import * as hb from "npm:harfbuzzjs@^1.4.0";
import { initWasm, Resvg } from "npm:@resvg/resvg-wasm@^2.6.2";

export type AmruthaVachanaPoster = {
  vachana_text: string;
  attribution: string;
  canvas_width: number;
  canvas_height: number;
  text_alignment: "left" | "center" | "right";
  font_size: number | null;
  minimum_font_size: number;
  line_spacing: number | null;
  maximum_lines: number;
  text_color: string;
  attribution_color: string;
};

type PosterAssets = {
  templateData: Uint8Array;
  fontData: Uint8Array;
  personImageData?: Uint8Array;
};

type ShapedText = { width: number; paths: string[] };
type LineWidth = number | ((lineIndex: number) => number);

const BASE_WIDTH = 1080;
const BASE_HEIGHT = 1440;
const DEFAULT_TEXT_COLOR = "#283593";
const DEFAULT_ATTRIBUTION_COLOR = "#111111";
const QUOTED_TEXT_COLOR = "#EC0878";
const TEMPLATE_IMAGE_ID = "https://assets.local/amrutha-vachana-template.jpg";
const PERSON_IMAGE_ID = "https://assets.local/amrutha-vachana-person.png";
const PORTRAIT_NORMALIZATION_SIZE = 1024;
const PORTRAIT_ALPHA_THRESHOLD = 8;
const PORTRAIT_EDGE_PADDING = 2;
const wasmBytes = await Deno.readFile(
  new URL("index_bg.wasm", import.meta.resolve("npm:@resvg/resvg-wasm@^2.6.2")),
);
await initWasm(wasmBytes);

type PixelBounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

function visiblePixelBounds(
  pixels: Uint8Array,
  width: number,
  height: number,
): PixelBounds | undefined {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = pixels[(y * width + x) * 4 + 3];
      if (alpha <= PORTRAIT_ALPHA_THRESHOLD) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }

  return right >= left && bottom >= top
    ? { left, top, right, bottom }
    : undefined;
}

export function trimTransparentMargins(imageData: Uint8Array) {
  const size = PORTRAIT_NORMALIZATION_SIZE;
  const sourceSvg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <image href="${PERSON_IMAGE_ID}" x="0" y="0" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet"/>
  </svg>`;
  const sourceRenderer = new Resvg(sourceSvg, {
    fitTo: { mode: "original" },
    font: { loadSystemFonts: false },
  });
  sourceRenderer.resolveImage(PERSON_IMAGE_ID, imageData);
  const sourceImage = sourceRenderer.render();

  const bounds = visiblePixelBounds(
    sourceImage.pixels,
    sourceImage.width,
    sourceImage.height,
  );
  sourceImage.free();
  sourceRenderer.free();
  if (!bounds) {
    throw new Error("Author portrait does not contain any visible pixels");
  }

  const left = Math.max(0, bounds.left - PORTRAIT_EDGE_PADDING);
  const top = Math.max(0, bounds.top - PORTRAIT_EDGE_PADDING);
  const right = Math.min(size - 1, bounds.right + PORTRAIT_EDGE_PADDING);
  const bottom = Math.min(size - 1, bounds.bottom + PORTRAIT_EDGE_PADDING);
  const width = right - left + 1;
  const height = bottom - top + 1;
  const croppedSvg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <image href="${PERSON_IMAGE_ID}" x="${-left}" y="${-top}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet"/>
  </svg>`;
  const croppedRenderer = new Resvg(croppedSvg, {
    fitTo: { mode: "original" },
    font: { loadSystemFonts: false },
  });
  croppedRenderer.resolveImage(PERSON_IMAGE_ID, imageData);
  const croppedImage = croppedRenderer.render();
  const png = croppedImage.asPng();
  croppedImage.free();
  croppedRenderer.free();
  return png;
}

function validColor(value: string | null | undefined, fallback: string) {
  const color = String(value ?? "").trim();
  return /^(#[0-9a-f]{3,8}|[a-z]+)$/i.test(color) ? color : fallback;
}

function shapeText(font: hb.Font, content: string, size: number): ShapedText {
  font.setScale(size, size);
  const buffer = new hb.Buffer();
  buffer.addText(content);
  buffer.guessSegmentProperties();
  buffer.setLanguage("kn");
  buffer.setScript("knda");
  hb.shape(font, buffer);

  const paths: string[] = [];
  let cursor = 0;
  for (const glyph of buffer.getGlyphInfosAndPositions()) {
    const path = font.glyphToPath(glyph.codepoint);
    const x = cursor + (glyph.xOffset ?? 0);
    const y = -(glyph.yOffset ?? 0);
    paths.push(`<path d="${path}" transform="matrix(1 0 0 -1 ${x} ${y})"/>`);
    cursor += glyph.xAdvance ?? 0;
  }
  return { width: cursor, paths };
}

function coloredPaths(paths: string[], color: string) {
  return paths.map((path) => path.replace("<path ", `<path fill="${color}" `)).join("");
}

function splitLongWord(
  font: hb.Font,
  word: string,
  size: number,
  maxWidth: number,
) {
  const graphemes = Array.from(
    new Intl.Segmenter("kn", { granularity: "grapheme" }).segment(word),
    (part) => part.segment,
  );
  const pieces: string[] = [];
  let current = "";
  for (const grapheme of graphemes) {
    const candidate = current + grapheme;
    if (current && shapeText(font, candidate, size).width > maxWidth) {
      pieces.push(current);
      current = grapheme;
    } else {
      current = candidate;
    }
  }
  if (current) pieces.push(current);
  return pieces;
}

function wrapText(font: hb.Font, text: string, size: number, width: LineWidth) {
  const output: string[] = [];
  for (const paragraph of text.trim().split(/\r?\n/)) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    let line = "";
    const pending = [...words];
    while (pending.length) {
      const maxWidth = typeof width === "function"
        ? width(output.length)
        : width;
      const word = pending.shift()!;
      if (shapeText(font, word, size).width > maxWidth) {
        pending.unshift(...splitLongWord(font, word, size, maxWidth));
        continue;
      }
      const candidate = line ? `${line} ${word}` : word;
      if (line && shapeText(font, candidate, size).width > maxWidth) {
        output.push(line);
        line = "";
        pending.unshift(word);
      } else {
        line = candidate;
      }
    }
    if (line) output.push(line);
  }
  return output;
}

function linesToPaths(
  font: hb.Font,
  lines: string[],
  size: number,
  width: LineWidth,
  alignment: AmruthaVachanaPoster["text_alignment"],
  startY: number,
  lineHeight: number,
  color: string,
  left: number,
  highlightedColor?: string,
) {
  let insideQuote = false;
  return lines.map((content, index) => {
    const maxWidth = typeof width === "function" ? width(index) : width;
    const shaped = shapeText(font, content, size);
    const x = alignment === "center"
      ? left + (maxWidth - shaped.width) / 2
      : alignment === "right"
      ? left + maxWidth - shaped.width
      : left;
    if (!highlightedColor) {
      return `<g transform="translate(${x} ${
        startY + index * lineHeight
      })">${coloredPaths(shaped.paths, color)}</g>`;
    }

    const runs: { content: string; highlighted: boolean }[] = [];
    for (
      const grapheme of Array.from(
        new Intl.Segmenter("kn", { granularity: "grapheme" }).segment(content),
        (part) => part.segment,
      )
    ) {
      if (grapheme === "‘") insideQuote = true;
      const highlighted = insideQuote;
      const previous = runs.at(-1);
      if (previous?.highlighted === highlighted) {
        previous.content += grapheme;
      } else {
        runs.push({ content: grapheme, highlighted });
      }
      if (grapheme === "’") insideQuote = false;
    }

    let runX = x;
    return runs.map((run) => {
      const runShape = shapeText(font, run.content, size);
      const runColor = run.highlighted ? highlightedColor : color;
      const result = `<g transform="translate(${runX} ${
        startY + index * lineHeight
      })">${coloredPaths(runShape.paths, runColor)}</g>`;
      runX += runShape.width;
      return result;
    }).join("");
  }).join("");
}

export function renderAmruthaVachanaPoster(
  vachana: AmruthaVachanaPoster,
  assets: PosterAssets,
) {
  const fontBuffer = assets.fontData.buffer.slice(
    assets.fontData.byteOffset,
    assets.fontData.byteOffset + assets.fontData.byteLength,
  ) as ArrayBuffer;
  const blob = new hb.Blob(fontBuffer);
  const face = new hb.Face(blob);
  const font = new hb.Font(face);

  // The new right-hand panel is narrower, so legacy rows configured for seven
  // wide lines need room to reflow vertically rather than being rejected.
  const maxLines = Math.max(10, Math.min(vachana.maximum_lines || 12, 12));
  const minimumSize = Math.max(28, vachana.minimum_font_size || 38);
  const spacing = Math.max(1, Number(vachana.line_spacing) || 1.35);
  const personImageData = assets.personImageData
    ? trimTransparentMargins(assets.personImageData)
    : undefined;
  const textAreaLeft = 465;
  const fullWidth = 430;
  const shortWords = vachana.vachana_text.trim().split(/\s+/).filter(Boolean);
  const usesShortLayout = shortWords.length >= 1 && shortWords.length <= 6;
  const maximumSize = Math.max(
    minimumSize,
    usesShortLayout
      ? Math.min(92, Math.max(78, vachana.font_size || 0))
      : Math.min(64, Math.max(52, vachana.font_size || 0)),
  );
  const quoteAreaTop = 325;
  const quoteAreaBottom = 1135;
  let fontSize = maximumSize;
  let lines: string[] = [];
  let lineHeight = fontSize * spacing;
  for (; fontSize >= minimumSize; fontSize -= 2) {
    const effectiveSpacing = usesShortLayout
      ? Math.max(1.15, Math.min(spacing, 1.3))
      : spacing;
    const candidateLineHeight = fontSize * effectiveSpacing;
    const candidateLines = usesShortLayout
      ? shortWords
      : wrapText(font, vachana.vachana_text, fontSize, fullWidth);
    const linesFitWidth = candidateLines.every((line) =>
      shapeText(font, line, fontSize).width <= fullWidth
    );
    const blockHeight = fontSize +
      Math.max(0, candidateLines.length - 1) * candidateLineHeight;
    if (
      linesFitWidth &&
      candidateLines.length <= maxLines &&
      blockHeight <= quoteAreaBottom - quoteAreaTop
    ) {
      lines = candidateLines;
      lineHeight = candidateLineHeight;
      break;
    }
  }
  if (!lines.length) {
    throw new Error(
      `Vachana is too long to fit without truncation (maximum ${maxLines} lines)`,
    );
  }

  const textColor = validColor(vachana.text_color, DEFAULT_TEXT_COLOR);
  const blockHeight = fontSize + Math.max(0, lines.length - 1) * lineHeight;
  const quoteStartY = quoteAreaTop + fontSize +
    (quoteAreaBottom - quoteAreaTop - blockHeight) / 2;
  const quotePaths = linesToPaths(
    font,
    lines,
    fontSize,
    fullWidth,
    "center",
    quoteStartY,
    lineHeight,
    textColor,
    textAreaLeft,
    QUOTED_TEXT_COLOR,
  );
  if (!quotePaths) {
    throw new Error("Vachana text did not produce any drawable glyphs");
  }
  const attributionMaxWidth = fullWidth;
  let attributionSize = Math.max(28, Math.min(42, fontSize - 8));
  let attribution = shapeText(font, vachana.attribution, attributionSize);
  while (attribution.width > attributionMaxWidth && attributionSize > 28) {
    attributionSize -= 2;
    attribution = shapeText(font, vachana.attribution, attributionSize);
  }
  if (attribution.width > attributionMaxWidth) {
    throw new Error(
      "Author attribution is too long to fit in the right panel",
    );
  }
  if (!attribution.paths.length) {
    throw new Error("Author attribution did not produce any drawable glyphs");
  }
  const attributionX = textAreaLeft +
    (attributionMaxWidth - attribution.width) / 2;
  const attributionY = 1230;
  const personImage = personImageData
    ? `<image href="${PERSON_IMAGE_ID}" x="100" y="775" width="335" height="455" preserveAspectRatio="xMidYMax meet"/>`
    : "";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${
    vachana.canvas_width || BASE_WIDTH
  }" height="${
    vachana.canvas_height || BASE_HEIGHT
  }" viewBox="0 0 ${BASE_WIDTH} ${BASE_HEIGHT}">
    <image href="${TEMPLATE_IMAGE_ID}" x="0" y="0" width="${BASE_WIDTH}" height="${BASE_HEIGHT}" preserveAspectRatio="none"/>
    ${quotePaths}
    <g transform="translate(${attributionX} ${attributionY})">${
    coloredPaths(
      attribution.paths,
      validColor(vachana.attribution_color, DEFAULT_ATTRIBUTION_COLOR),
    )
  }</g>
    ${personImage}
  </svg>`;

  const createRenderer = () => {
    const renderer = new Resvg(svg, {
      fitTo: { mode: "original" },
      font: { loadSystemFonts: false },
    });
    renderer.resolveImage(TEMPLATE_IMAGE_ID, assets.templateData);
    if (personImageData) {
      renderer.resolveImage(PERSON_IMAGE_ID, personImageData);
    }
    return renderer;
  };

  const renderer = createRenderer();
  const rendered = renderer.render();
  const png = rendered.asPng();
  // The known transparent failure containing only a portrait was about 53 KB;
  // a valid template-backed 1080x1440 poster is substantially larger.
  if (png.byteLength < 100_000) {
    throw new Error(
      "Rendered poster is unexpectedly small; template or text compositing failed",
    );
  }
  return png;
}
