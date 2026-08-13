import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  createClient,
  type SupabaseClient,
} from "npm:@supabase/supabase-js@^2";
import {
  type AmruthaVachanaPoster,
  renderAmruthaVachanaPoster,
} from "./renderer.ts";

const BUCKET = "amrutha-vachana-posters";
const TEMPLATE_BUCKET = "poster-templates";
const LANGUAGE = "kn";
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const POSTER_RENDER_VERSION = 9;
const ADMIN_ROLES = new Set(["SUPER_ADMIN", "PANCHANGA_ADMIN"]);
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-amrutha-vachana-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const SOURCE_FIELDS = [
  "vachana_text",
  "attribution_override",
  "template_code",
  "canvas_width",
  "canvas_height",
  "text_alignment",
  "font_family",
  "font_size",
  "minimum_font_size",
  "line_spacing",
  "maximum_lines",
  "text_color",
  "attribution_color",
  "image_version",
] as const;

const fontBytes = await Deno.readFile(
  new URL("./assets/NotoSansKannada-Medium.ttf", import.meta.url),
);
const templateCache = new Map<string, Uint8Array>();

type AmruthaVachanaTemplate = {
  id: number;
  storage_path: string;
  version: number;
  weekday_number: number;
};

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { ...CORS_HEADERS, "Cache-Control": "no-store" },
  });
}

async function isAuthorized(
  request: Request,
  supabase: SupabaseClient<any>,
) {
  // Preserve the existing cron/service authorization contract.
  const configuredSecret = Deno.env.get("AMRUTHA_VACHANA_GENERATOR_SECRET");
  const providedSecret = request.headers.get("x-amrutha-vachana-secret");
  if (configuredSecret && providedSecret === configuredSecret) return true;

  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!accessToken) return false;

  const { data: userData, error: userError } = await supabase.auth.getUser(
    accessToken,
  );
  if (userError || !userData.user) return false;

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("role, status, is_active")
    .eq("id", userData.user.id)
    .maybeSingle();

  return Boolean(
    !profileError && profile && ADMIN_ROLES.has(profile.role) &&
      profile.status === "APPROVED" && profile.is_active === true,
  );
}

function todayInIndia() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function isoWeekday(date: string) {
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  return weekday === 0 ? 7 : weekday;
}

async function selectedTemplate(
  supabase: SupabaseClient<any>,
  requestedDate: string,
): Promise<AmruthaVachanaTemplate> {
  const weekdayNumber = isoWeekday(requestedDate);
  const { data, error } = await supabase
    .from("amrutha_vachana_templates")
    .select("id, storage_path, version, weekday_number")
    .eq("language", LANGUAGE)
    .eq("weekday_number", weekdayNumber)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error(
      `No active Kannada Amrutha Vachana template configured for ISO weekday ${weekdayNumber}`,
    );
  }
  return data;
}

async function templateData(
  supabase: SupabaseClient<any>,
  template: AmruthaVachanaTemplate,
) {
  const cacheKey = `${template.storage_path}:v${template.version}`;
  const cached = templateCache.get(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase.storage
    .from(TEMPLATE_BUCKET)
    .download(template.storage_path);
  if (error || !data) {
    throw new Error(
      `Unable to download template "${template.storage_path}": ${
        error?.message ?? "empty response"
      }`,
    );
  }

  const bytes = new Uint8Array(await data.arrayBuffer());
  templateCache.set(cacheKey, bytes);
  return bytes;
}

async function fetchImageBytes(url: string | null | undefined) {
  const value = String(url ?? "").trim();
  if (!value) return undefined;
  const parsed = new URL(value);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Image URL must use HTTP or HTTPS");
  }
  const response = await fetch(parsed, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) {
    throw new Error(`Unable to load image (${response.status})`);
  }
  const contentType = response.headers.get("content-type")?.split(";")[0] ||
    "image/png";
  if (!contentType.startsWith("image/")) {
    throw new Error("Image URL did not return an image");
  }
  return new Uint8Array(await response.arrayBuffer());
}

async function sourceHash(
  row: Record<string, unknown>,
  author: Record<string, unknown>,
  translation: Record<string, unknown> | undefined,
  template: AmruthaVachanaTemplate,
) {
  const source = Object.fromEntries(
    SOURCE_FIELDS.map((field) => [field, row[field]]),
  );
  const payload = JSON.stringify({
    render_version: POSTER_RENDER_VERSION,
    vachana_date: row.vachana_date,
    language: row.language,
    template: {
      id: template.id,
      storage_path: template.storage_path,
      version: template.version,
    },
    source,
    author: {
      person_image_url: author.person_image_url,
      person_image_storage_path: author.person_image_storage_path,
      updated_at: author.updated_at,
    },
    translation: translation ?? null,
  });
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(payload),
  );
  return Array.from(new Uint8Array(digest)).map((byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "Supabase environment is not configured" }, 500);
  }

  const body = await request.json().catch(() => ({})) as {
    vachana_date?: string;
    amrutha_vachana_date?: string;
  };
  const requestedDate = body.vachana_date?.trim() ||
    body.amrutha_vachana_date?.trim() || todayInIndia();
  if (!DATE_PATTERN.test(requestedDate)) {
    return json({ error: "vachana_date must use YYYY-MM-DD" }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  if (!(await isAuthorized(request, supabase))) {
    return json({ error: "Unauthorized" }, 401);
  }
  const { data: row, error: fetchError } = await supabase
    .from("daily_amrutha_vachana")
    .select(`*, amrutha_vachana_authors!inner(
      id, person_image_url, person_image_storage_path, updated_at,
      amrutha_vachana_author_translations(language, author_name, attribution_text, short_description, updated_at)
    )`)
    .eq("vachana_date", requestedDate)
    .eq("language", LANGUAGE)
    .eq("approve_status", true)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (fetchError) return json({ error: fetchError.message }, 500);
  if (!row) {
    return json({
      status: "skipped",
      reason:
        `No approved active Kannada Amrutha Vachana found for ${requestedDate}`,
    });
  }

  const author = row.amrutha_vachana_authors as Record<string, unknown>;
  const translations =
    (author.amrutha_vachana_author_translations ?? []) as Record<
      string,
      unknown
    >[];
  const translation = translations.find((item) => item.language === LANGUAGE);
  const attribution = String(
    row.attribution_override ?? translation?.attribution_text ??
      translation?.author_name ?? "",
  ).trim();
  if (!attribution) {
    return json({ error: "Kannada author attribution is missing" }, 422);
  }

  try {
    const template = await selectedTemplate(supabase, requestedDate);
    const currentSourceHash = await sourceHash(
      row,
      author,
      translation,
      template,
    );
    if (
      row.image_url && row.image_storage_path &&
      row.image_source_hash === currentSourceHash &&
      row.image_generation_status === "COMPLETED" && !row.image_generation_error
    ) {
      return json({
        status: "already_current",
        id: row.id,
        vachana_date: requestedDate,
        language: LANGUAGE,
        image_url: row.image_url,
        image_storage_path: row.image_storage_path,
      });
    }

    await supabase.from("daily_amrutha_vachana").update({
      image_generation_status: "PROCESSING",
      image_generation_error: null,
      generation_attempts: Number(row.generation_attempts ?? 0) + 1,
      last_generation_attempt_at: new Date().toISOString(),
    }).eq("id", row.id);

    const personImageData = await fetchImageBytes(
      author.person_image_url as string | null,
    );
    const selectedTemplateData = await templateData(supabase, template);
    const imageBytes = renderAmruthaVachanaPoster({
      vachana_text: row.vachana_text,
      attribution,
      canvas_width: row.canvas_width,
      canvas_height: row.canvas_height,
      text_alignment: row.text_alignment,
      font_size: row.font_size,
      minimum_font_size: row.minimum_font_size,
      line_spacing: row.line_spacing,
      maximum_lines: row.maximum_lines,
      text_color: row.text_color,
      attribution_color: row.attribution_color,
    } as AmruthaVachanaPoster, {
      templateData: selectedTemplateData,
      fontData: fontBytes,
      personImageData,
    });

    const [year, month, day] = requestedDate.split("-");
    const storagePath =
      `${LANGUAGE}/${year}/${month}/${day}/amrutha-vachana.png`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(
      storagePath,
      imageBytes,
      {
        contentType: "image/png",
        cacheControl: "3600",
        upsert: true,
      },
    );
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(
      storagePath,
    );
    const imageUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;
    const { error: updateError } = await supabase.from("daily_amrutha_vachana")
      .update({
        image_url: imageUrl,
        image_storage_path: storagePath,
        image_generated_at: new Date().toISOString(),
        image_generation_status: "COMPLETED",
        image_generation_error: null,
        image_source_hash: currentSourceHash,
        image_template_id: template.id,
        image_template_version: template.version,
      }).eq("id", row.id);
    if (updateError) throw updateError;

    return json({
      status: "generated",
      id: row.id,
      vachana_date: requestedDate,
      language: LANGUAGE,
      image_url: imageUrl,
      image_storage_path: storagePath,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await supabase.from("daily_amrutha_vachana").update({
      image_generation_status: "FAILED",
      image_generation_error: message,
    }).eq("id", row.id);
    return json({ error: message }, 500);
  }
});
