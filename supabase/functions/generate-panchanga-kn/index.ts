import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import {
  createClient,
  type SupabaseClient,
} from 'npm:@supabase/supabase-js@^2'
import {
  type KannadaPanchanga,
  renderKannadaPoster,
} from './renderer.ts'

const BUCKET = 'panchanga-posters'
const TEMPLATE_BUCKET = 'poster-templates'
const LANGUAGE = 'kn'
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const POSTER_RENDER_VERSION = 4
const ADMIN_ROLES = new Set(['SUPER_ADMIN', 'PANCHANGA_ADMIN'])
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-panchanga-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const SOURCE_FIELDS = [
  'krishna_shaka_year',
  'shalivahana_shaka_year',
  'kali_yuga_year',
  'samvatsara',
  'ayana',
  'rutu',
  'masa',
  'paksha',
  'tithi',
  'vasara',
  'weekday',
  'nakshatra',
  'yoga',
  'karana',
  'display_date',
  'special_note',
  'special_note2',
  'special_note3',
] as const

const fontBytes = await Deno.readFile(
  new URL('./assets/NotoSansKannada-Medium.ttf', import.meta.url),
)
const templateCache = new Map<string, Uint8Array>()

type PanchangaTemplate = {
  id: number
  storage_path: string
  version: number
  weekday_number: number
}

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { ...CORS_HEADERS, 'Cache-Control': 'no-store' },
  })
}

async function isAuthorized(
  request: Request,
  supabase: SupabaseClient<any>,
) {
  // Preserve the existing cron/service authorization path exactly as-is.
  const configuredSecret = Deno.env.get('PANCHANGA_GENERATOR_SECRET')
  const providedSecret = request.headers.get('x-panchanga-secret')
  if (configuredSecret && providedSecret === configuredSecret) return true

  // Browser callers must use their Supabase session. Never expose the cron
  // secret in the admin application's VITE environment variables.
  const authorization = request.headers.get('authorization')
  const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!accessToken) return false

  const { data: userData, error: userError } = await supabase.auth.getUser(
    accessToken,
  )
  if (userError || !userData.user) return false

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role, status, is_active')
    .eq('id', userData.user.id)
    .maybeSingle()

  return Boolean(
    !profileError &&
      profile &&
      ADMIN_ROLES.has(profile.role) &&
      profile.status === 'APPROVED' &&
      profile.is_active === true,
  )
}

function todayInIndia() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function isoWeekday(date: string) {
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay()
  return weekday === 0 ? 7 : weekday
}

async function selectedTemplate(
  supabase: SupabaseClient<any>,
  requestedDate: string,
): Promise<PanchangaTemplate> {
  const weekdayNumber = isoWeekday(requestedDate)
  const { data, error } = await supabase
    .from('panchanga_templates')
    .select('id, storage_path, version, weekday_number')
    .eq('language', LANGUAGE)
    .eq('weekday_number', weekdayNumber)
    .eq('is_active', true)
    .maybeSingle()

  if (error) throw error
  if (!data) {
    throw new Error(
      `No active Kannada Panchanga template configured for ISO weekday ${weekdayNumber}`,
    )
  }
  return data
}

async function templateData(
  supabase: SupabaseClient<any>,
  template: PanchangaTemplate,
) {
  const cacheKey = `${template.storage_path}:v${template.version}`
  const cached = templateCache.get(cacheKey)
  if (cached) return cached

  const { data, error } = await supabase.storage
    .from(TEMPLATE_BUCKET)
    .download(template.storage_path)

  if (error || !data) {
    throw new Error(
      `Unable to download template "${template.storage_path}": ${error?.message ?? 'empty response'}`,
    )
  }

  const bytes = new Uint8Array(await data.arrayBuffer())
  templateCache.set(cacheKey, bytes)
  return bytes
}

async function sourceHash(
  row: Record<string, unknown>,
  template: PanchangaTemplate,
) {
  const source = Object.fromEntries(
    SOURCE_FIELDS.map((field) => [field, row[field]]),
  )
  const payload = JSON.stringify({
    render_version: POSTER_RENDER_VERSION,
    panchanga_date: row.panchanga_date,
    language: row.language,
    template: {
      id: template.id,
      storage_path: template.storage_path,
      version: template.version,
    },
    source,
  })
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(payload),
  )
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: 'Supabase environment is not configured' }, 500)
  }

  let requestedDate = todayInIndia()
  try {
    const body = await request.json().catch(() => ({})) as {
      panchanga_date?: string
    }
    requestedDate = body.panchanga_date?.trim() || requestedDate
  } catch {
    return json({ error: 'Request body must be valid JSON' }, 400)
  }

  if (!DATE_PATTERN.test(requestedDate)) {
    return json({ error: 'panchanga_date must use YYYY-MM-DD' }, 400)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  if (!(await isAuthorized(request, supabase))) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const { data: row, error: fetchError } = await supabase
    .from('daily_panchanga')
    .select('*')
    .eq('panchanga_date', requestedDate)
    .eq('language', LANGUAGE)
    .eq('approve_status', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (fetchError) {
    return json({ error: fetchError.message }, 500)
  }
  if (!row) {
    return json({
      status: 'skipped',
      reason: `No approved Kannada Panchanga found for ${requestedDate}`,
    })
  }

  try {
    const template = await selectedTemplate(supabase, requestedDate)
    const currentSourceHash = await sourceHash(row, template)
    if (
      row.image_url &&
      row.image_storage_path &&
      row.image_source_hash === currentSourceHash &&
      !row.image_generation_error
    ) {
      return json({
        status: 'already_current',
        id: row.id,
        panchanga_date: requestedDate,
        language: LANGUAGE,
        image_url: row.image_url,
        image_storage_path: row.image_storage_path,
      })
    }

    const selectedTemplateData = await templateData(supabase, template)
    const imageBytes = renderKannadaPoster(row as KannadaPanchanga, {
      templateData: selectedTemplateData,
      fontData: fontBytes,
    })
    const [year, month, day] = requestedDate.split('-')
    const storagePath = `${LANGUAGE}/${year}/${month}/${day}/panchanga.png`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, imageBytes, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: true,
      })
    if (uploadError) throw uploadError

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath)
    const version = Date.now()
    const imageUrl = `${publicUrlData.publicUrl}?v=${version}`

    const { error: updateError } = await supabase
      .from('daily_panchanga')
      .update({
        image_url: imageUrl,
        image_storage_path: storagePath,
        image_generated_at: new Date().toISOString(),
        image_generation_error: null,
        image_source_hash: currentSourceHash,
        image_template_id: template.id,
        image_template_version: template.version,
      })
      .eq('id', row.id)
    if (updateError) throw updateError

    return json({
      status: 'generated',
      id: row.id,
      panchanga_date: requestedDate,
      language: LANGUAGE,
      image_url: imageUrl,
      image_storage_path: storagePath,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await supabase
      .from('daily_panchanga')
      .update({ image_generation_error: message })
      .eq('id', row.id)
    return json({ error: message }, 500)
  }
})
