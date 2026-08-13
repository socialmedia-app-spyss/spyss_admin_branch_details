import * as hb from 'npm:harfbuzzjs@^1.4.0'
import {
  initWasm,
  Resvg,
} from 'npm:@resvg/resvg-wasm@^2.6.2'

export type KannadaPanchanga = {
  krishna_shaka_year: number | null
  shalivahana_shaka_year: number | null
  kali_yuga_year: number | null
  samvatsara: string
  ayana: string
  rutu: string
  masa: string
  paksha: string
  tithi: string
  vasara: string | null
  weekday: string
  nakshatra: string
  yoga: string
  karana: string
  display_date: string | null
  special_note: string | null
  special_note2: string | null
  special_note3: string | null
}

type PosterAssets = {
  templateData: Uint8Array
  fontData: Uint8Array
}

type TextSegment = {
  content: string
  color: string
}

type TextLine = {
  y: number
  size: number
  minSize: number
  segments: TextSegment[]
}

type ShapedSegment = {
  width: number
  paths: string[]
}

/* -------------------------------------------------------------------------- */
/*                                  COLOURS                                   */
/* -------------------------------------------------------------------------- */

const COLORS = {
  brown: '#4b2e20',
  blue: '#292d87',
  magenta: '#c51b78',
  red: '#df1018',
  green: '#08743f',
} as const

/* -------------------------------------------------------------------------- */
/*                                  TEMPLATE                                  */
/* -------------------------------------------------------------------------- */

const TEMPLATE_IMAGE_ID =
  'https://assets.local/panchanga-template.jpg'

/* -------------------------------------------------------------------------- */
/*                                POSTER LAYOUT                               */
/* -------------------------------------------------------------------------- */

const LAYOUT = {
  canvasWidth: 1080,
  canvasHeight: 1350,

  /*
   * 75 px left + 75 px right
   *
   * 1080 - 75 - 75 = 930 px
   */
  leftMargin: 75,
  rightMargin: 75,

  /*
   * Main Sankalpa lines
   */
  line1Y: 330,
  line2Y: 405,
  line3Y: 480,
  line4Y: 550,
  line5Y: 630,
  line6Y: 700,
  line7Y: 775,

  /*
   * Panchanga information rows
   */
  detailsRow1Y: 845,
  detailsRow2Y: 915,
  detailsRow3Y: 985,

  /*
   * Date
   */
  dateY: 1055,

  /*
   * Special notes
   */
  notesStartY: 1125,
  noteLineGap: 48,
} as const

const MAX_LINE_WIDTH =
  LAYOUT.canvasWidth -
  LAYOUT.leftMargin -
  LAYOUT.rightMargin

/* -------------------------------------------------------------------------- */
/*                                 FONT SIZES                                 */
/* -------------------------------------------------------------------------- */

/*
 * Normal Sankalpa lines.
 */
const PREFERRED_MAIN_LINE_SIZE = 46
const MIN_MAIN_LINE_SIZE = 34
const PREFERRED_DATE_SIZE = 46

/*
 * Ayana / Rutu / Masa etc.
 */
const PREFERRED_DETAIL_SIZE = 46
const MIN_DETAIL_LINE_SIZE = 32

/*
 * Special notes.
 */
const PREFERRED_NOTE_SIZE = 46
const MIN_NOTE_SIZE = 28

/* -------------------------------------------------------------------------- */
/*                              INITIALIZE RESVG                              */
/* -------------------------------------------------------------------------- */

const wasmBytes = await Deno.readFile(
  new URL(
    'index_bg.wasm',
    import.meta.resolve('npm:@resvg/resvg-wasm@^2.6.2'),
  ),
)

await initWasm(wasmBytes)

/* -------------------------------------------------------------------------- */
/*                              HELPER FUNCTIONS                              */
/* -------------------------------------------------------------------------- */

const value = (
  input: string | number | null | undefined,
  fallback = '—',
) =>
  String(input ?? '').trim() || fallback

const withSuffix = (
  input: string | number | null | undefined,
  suffix: string,
) => {
  const normalized = String(input ?? '').trim()

  if (!normalized) {
    return `— ${suffix}`
  }

  return normalized.endsWith(suffix)
    ? normalized
    : `${normalized} ${suffix}`
}

const segment = (
  content: string,
  color: string = COLORS.brown,
): TextSegment => ({
  content,
  color,
})

const line = (
  y: number,
  size: number,
  minSize: number,
  segments: TextSegment[],
): TextLine => ({
  y,
  size,
  minSize,
  segments,
})

/* -------------------------------------------------------------------------- */
/*                            HARFBUZZ TEXT SHAPING                           */
/* -------------------------------------------------------------------------- */

function shapeSegment(
  font: hb.Font,
  textSegment: TextSegment,
  fontSize: number,
): ShapedSegment {
  font.setScale(fontSize, fontSize)

  const buffer = new hb.Buffer()

  buffer.addText(textSegment.content)
  buffer.guessSegmentProperties()

  buffer.setLanguage('kn')
  buffer.setScript('knda')

  hb.shape(font, buffer)

  const glyphs = buffer.getGlyphInfosAndPositions()

  const paths: string[] = []

  let cursor = 0

  for (const glyph of glyphs) {
    const pathData = font.glyphToPath(glyph.codepoint)

    const x =
      cursor +
      (glyph.xOffset ?? 0)

    const y =
      -(glyph.yOffset ?? 0)

    paths.push(
      `<path
        d="${pathData}"
        fill="${textSegment.color}"
        transform="matrix(1 0 0 -1 ${x} ${y})"
      />`,
    )

    cursor += glyph.xAdvance ?? 0
  }

  return {
    width: cursor,
    paths,
  }
}

/* -------------------------------------------------------------------------- */
/*                                TEXT WIDTH                                  */
/* -------------------------------------------------------------------------- */

function measureLineWidth(
  font: hb.Font,
  textLine: TextLine,
  fontSize: number,
) {
  const shaped = textLine.segments.map((item) =>
    shapeSegment(
      font,
      item,
      fontSize,
    )
  )

  return shaped.reduce(
    (sum, item) =>
      sum + item.width,
    0,
  )
}

/* -------------------------------------------------------------------------- */
/*                              AUTOMATIC FITTING                             */
/* -------------------------------------------------------------------------- */

function fitLineSize(
  font: hb.Font,
  textLine: TextLine,
  preferredSize: number,
) {
  let size = preferredSize

  let width =
    measureLineWidth(
      font,
      textLine,
      size,
    )

  /*
   * Reduce by 0.5 px until:
   *
   * 1. text fits in 930px
   * OR
   * 2. minimum allowed font size is reached
   */
  while (
    size > textLine.minSize &&
    width > MAX_LINE_WIDTH
  ) {
    size -= 0.5

    width =
      measureLineWidth(
        font,
        textLine,
        size,
      )
  }

  return size
}

/* -------------------------------------------------------------------------- */
/*                           CONVERT LINE TO SVG PATHS                        */
/* -------------------------------------------------------------------------- */

function lineToPaths(
  font: hb.Font,
  textLine: TextLine,
) {
  const effectiveSize =
    fitLineSize(
      font,
      textLine,
      textLine.size,
    )

  const shaped =
    textLine.segments.map(
      (item) =>
        shapeSegment(
          font,
          item,
          effectiveSize,
        ),
    )

  const totalWidth =
    shaped.reduce(
      (sum, item) =>
        sum + item.width,
      0,
    )

  /*
   * Center text inside complete 1080px canvas.
   */
  const centeredX =
    (LAYOUT.canvasWidth - totalWidth) / 2

  /*
   * Prevent text from moving beyond safe margins.
   */
  const maxStartX =
    LAYOUT.canvasWidth -
    LAYOUT.rightMargin -
    totalWidth

  const startX =
    Math.max(
      LAYOUT.leftMargin,
      Math.min(
        centeredX,
        maxStartX,
      ),
    )

  let segmentX = startX

  const output: string[] = []

  for (const item of shaped) {
    output.push(
      `<g transform="translate(${segmentX} ${textLine.y})">
        ${item.paths.join('')}
      </g>`,
    )

    segmentX += item.width
  }

  return output.join('')
}

/* -------------------------------------------------------------------------- */
/*                         SPECIAL NOTE WORD WRAPPING                         */
/* -------------------------------------------------------------------------- */

function wrapText(
  font: hb.Font,
  text: string,
  preferredSize: number,
  minSize: number,
): string[] {
  const normalized =
    text
      .replace(/\s+/g, ' ')
      .trim()

  if (!normalized) {
    return []
  }

  /*
   * Check whether complete note fits on one line.
   */
  const completeLine =
    line(
      0,
      preferredSize,
      minSize,
      [
        segment(
          normalized,
          COLORS.red,
        ),
      ],
    )

  const completeWidthAtMinimumSize =
    measureLineWidth(
      font,
      completeLine,
      minSize,
    )

  /*
   * Keep the note on one line whenever it can fit without going below the
   * configured minimum. lineToPaths() will choose the largest fitting size.
   */
  if (
    completeWidthAtMinimumSize <=
    MAX_LINE_WIDTH
  ) {
    return [normalized]
  }

  /*
   * Split note by words.
   */
  const words =
    normalized.split(' ')

  const result: string[] = []

  let currentLine = ''

  for (const word of words) {
    const candidate =
      currentLine
        ? `${currentLine} ${word}`
        : word

    const candidateLine =
      line(
        0,
        preferredSize,
        minSize,
        [
          segment(
            candidate,
            COLORS.red,
          ),
        ],
      )

    const candidateWidth =
      measureLineWidth(
        font,
        candidateLine,
        preferredSize,
      )

    /*
     * Once wrapping is necessary, fill each line at the preferred size so
     * wrapped notes remain comfortably readable.
     */
    if (
      candidateWidth <=
      MAX_LINE_WIDTH
    ) {
      currentLine = candidate
    } else {
      /*
       * Save existing line.
       */
      if (currentLine) {
        result.push(currentLine)
      }

      /*
       * Start new line.
       */
      currentLine = word
    }
  }

  if (currentLine) {
    result.push(currentLine)
  }

  return result
}

/* -------------------------------------------------------------------------- */
/*                       GENERATE SPECIAL NOTE LINES                          */
/* -------------------------------------------------------------------------- */

function createNoteLines(
  font: hb.Font,
  notes: string[],
): TextLine[] {
  const noteLines: TextLine[] = []

  let currentY =
    LAYOUT.notesStartY

  for (const note of notes) {
    const wrappedLines =
      wrapText(
        font,
        note,
        PREFERRED_NOTE_SIZE,
        MIN_NOTE_SIZE,
      )

    for (
      const wrappedNote
      of wrappedLines
    ) {
      noteLines.push(
        line(
          currentY,
          PREFERRED_NOTE_SIZE,
          MIN_NOTE_SIZE,
          [
            segment(
              wrappedNote,
              COLORS.red,
            ),
          ],
        ),
      )

      currentY +=
        LAYOUT.noteLineGap
    }
  }

  return noteLines
}

/* -------------------------------------------------------------------------- */
/*                               MAIN RENDERER                                */
/* -------------------------------------------------------------------------- */

export function renderKannadaPoster(
  panchanga: KannadaPanchanga,
  assets: PosterAssets,
) {
  const vasara =
    value(
      panchanga.vasara,
      '',
    )

  const weekday =
    value(
      panchanga.weekday,
      '',
    )

  const displayDate =
    value(
      panchanga.display_date,
    )

  const displayDateAndWeekday =
    weekday
      ? `${displayDate} (${weekday})`
      : displayDate

  /* ------------------------------------------------------------------------ */
  /*                               LOAD FONT                                  */
  /* ------------------------------------------------------------------------ */

  const fontBuffer =
    assets.fontData.buffer.slice(
      assets.fontData.byteOffset,
      assets.fontData.byteOffset +
        assets.fontData.byteLength,
    ) as ArrayBuffer

  const blob =
    new hb.Blob(fontBuffer)

  const face =
    new hb.Face(blob)

  const font =
    new hb.Font(face)

  /* ------------------------------------------------------------------------ */
  /*                               BASE LINES                                 */
  /* ------------------------------------------------------------------------ */

  const separator = () =>
    segment(
      '  |  ',
      COLORS.brown,
    )

  const lines: TextLine[] = [
    /*
     * Line 1
     */
    line(
      LAYOUT.line1Y,
      PREFERRED_MAIN_LINE_SIZE,
      MIN_MAIN_LINE_SIZE,
      [
        segment(
          'ಜಂಬೂದ್ವೀಪೇ ಭರತಖಂಡೇ',
        ),
      ],
    ),

    /*
     * Line 2
     */
    line(
      LAYOUT.line2Y,
      PREFERRED_MAIN_LINE_SIZE,
      MIN_MAIN_LINE_SIZE,
      [
        segment(
          'ಭರತವರ್ಷೇ ದ್ವಿತೀಯ ಪರಾರ್ಧೇ',
        ),
      ],
    ),

    /*
     * Line 3
     */
    line(
      LAYOUT.line3Y,
      PREFERRED_MAIN_LINE_SIZE,
      MIN_MAIN_LINE_SIZE,
      [
        segment(
          'ಶ್ವೇತವರಾಹ ಕಲ್ಪೇ ವೈವಸ್ವತ ಮನ್ವಂತರೇ',
        ),
      ],
    ),

    /*
     * Line 4
     */
    line(
      LAYOUT.line4Y,
      PREFERRED_MAIN_LINE_SIZE,
      MIN_MAIN_LINE_SIZE,
      [
        segment(
          `${value(
            panchanga.kali_yuga_year,
            '28',
          )}ನೇ ಚತುರ್ಯುಗೇ ಕಲಿಯುಗೇ`,
        ),
      ],
    ),

    /*
     * Line 5
     */
    line(
      LAYOUT.line5Y,
      PREFERRED_MAIN_LINE_SIZE,
      MIN_MAIN_LINE_SIZE,
      [
        segment(
          'ಪ್ರಥಮಪಾದೇ ಸ್ವಸ್ತಿ ಶ್ರೀವಿಜಯಾಭ್ಯುದಯ',
        ),
      ],
    ),

    /*
     * Line 6
     */
    line(
      LAYOUT.line6Y,
      PREFERRED_MAIN_LINE_SIZE,
      MIN_MAIN_LINE_SIZE,
      [
        segment(
          `ಶ್ರೀಕೃಷ್ಣ ಶಕ ${value(
            panchanga.krishna_shaka_year,
          )}   ಶ್ರೀ ಶಾಲಿವಾಹನ ಶಕ ${value(
            panchanga.shalivahana_shaka_year,
          )}`,
        ),
      ],
    ),

    /*
     * Line 7
     */
    line(
      LAYOUT.line7Y,
      PREFERRED_MAIN_LINE_SIZE,
      MIN_MAIN_LINE_SIZE,
      [
        segment(
          `ಶ್ರೀ ${value(
            panchanga.samvatsara,
          )}ನಾಮ ಸಂವತ್ಸರೇ`,
        ),
      ],
    ),

    /* ---------------------------------------------------------------------- */
    /*                     AYANA | RUTU | MASA                                */
    /* ---------------------------------------------------------------------- */

    line(
      LAYOUT.detailsRow1Y,
      PREFERRED_DETAIL_SIZE,
      MIN_DETAIL_LINE_SIZE,
      [
        segment(
          value(
            panchanga.ayana,
          ),
          COLORS.magenta,
        ),

        separator(),

        segment(
          withSuffix(
            panchanga.rutu,
            'ಋತು',
          ),
          COLORS.red,
        ),

        separator(),

        segment(
          withSuffix(
            panchanga.masa,
            'ಮಾಸ',
          ),
          COLORS.blue,
        ),
      ],
    ),

    /* ---------------------------------------------------------------------- */
    /*                     PAKSHA | TITHI | VASARA                            */
    /* ---------------------------------------------------------------------- */

    line(
      LAYOUT.detailsRow2Y,
      PREFERRED_DETAIL_SIZE,
      MIN_DETAIL_LINE_SIZE,
      [
        segment(
          withSuffix(
            panchanga.paksha,
            'ಪಕ್ಷ',
          ),
          COLORS.red,
        ),

        separator(),

        segment(
          withSuffix(
            panchanga.tithi,
            'ತಿಥಿ',
          ),
          COLORS.blue,
        ),

        separator(),

        segment(
          vasara,
          COLORS.magenta,
        ),
      ],
    ),

    /* ---------------------------------------------------------------------- */
    /*                 NAKSHATRA | YOGA | KARANA                              */
    /* ---------------------------------------------------------------------- */

    line(
      LAYOUT.detailsRow3Y,
      PREFERRED_DETAIL_SIZE,
      MIN_DETAIL_LINE_SIZE,
      [
        segment(
          withSuffix(
            panchanga.nakshatra,
            'ನಕ್ಷತ್ರ',
          ),
          COLORS.green,
        ),

        separator(),

        segment(
          withSuffix(
            panchanga.yoga,
            'ಯೋಗ',
          ),
          COLORS.green,
        ),

        separator(),

        segment(
          withSuffix(
            panchanga.karana,
            'ಕರಣ',
          ),
          COLORS.blue,
        ),
      ],
    ),

    /* ---------------------------------------------------------------------- */
    /*                                DATE                                    */
    /* ---------------------------------------------------------------------- */

    line(
      LAYOUT.dateY,
      PREFERRED_DATE_SIZE,
      MIN_MAIN_LINE_SIZE,
      [
        segment(
          displayDateAndWeekday,
          COLORS.magenta,
        ),
      ],
    ),
  ]

  /* ------------------------------------------------------------------------ */
  /*                            SPECIAL NOTES                                 */
  /* ------------------------------------------------------------------------ */

  const notes = [
    panchanga.special_note,
    panchanga.special_note2,
    panchanga.special_note3,
  ].filter(
    (note): note is string =>
      Boolean(
        note?.trim(),
      ),
  )

  const noteLines =
    createNoteLines(
      font,
      notes,
    )

  lines.push(
    ...noteLines,
  )

  /* ------------------------------------------------------------------------ */
  /*                         CONVERT TEXT INTO SVG                            */
  /* ------------------------------------------------------------------------ */

  const vectorText =
    lines
      .map(
        (item) =>
          lineToPaths(
            font,
            item,
          ),
      )
      .join('')

  /* ------------------------------------------------------------------------ */
  /*                                  SVG                                     */
  /* ------------------------------------------------------------------------ */

  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${LAYOUT.canvasWidth}"
      height="${LAYOUT.canvasHeight}"
      viewBox="0 0 ${LAYOUT.canvasWidth} ${LAYOUT.canvasHeight}"
    >

      <image
        href="${TEMPLATE_IMAGE_ID}"
        x="0"
        y="0"
        width="${LAYOUT.canvasWidth}"
        height="${LAYOUT.canvasHeight}"
      />

      ${vectorText}

    </svg>
  `

  /* ------------------------------------------------------------------------ */
  /*                                RENDER PNG                                */
  /* ------------------------------------------------------------------------ */

  const renderer =
    new Resvg(
      svg,
      {
        fitTo: {
          mode: 'original',
        },

        font: {
          loadSystemFonts: false,
        },
      },
    )

  renderer.resolveImage(
    TEMPLATE_IMAGE_ID,
    assets.templateData,
  )

  const rendered =
    renderer.render()

  const png =
    rendered.asPng()

  rendered.free()
  renderer.free()

  /* ------------------------------------------------------------------------ */
  /*                              VALIDATION                                  */
  /* ------------------------------------------------------------------------ */

  if (
    png.byteLength <
    100_000
  ) {
    throw new Error(
      'Rendered poster is unexpectedly small; template or text compositing failed',
    )
  }

  return png
}
