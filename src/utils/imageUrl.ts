/**
 * Utility functions for sanitizing and validating image URLs for mobile app compatibility.
 * Flutter's CachedNetworkImage only supports raster formats (PNG, JPG, WebP, GIF) and fails on SVG.
 * This utility also auto-fixes common copy-paste artifacts like markdown escaping (\&)
 * and auto-appends .png to placehold.co URLs which default to SVG.
 */

export const sanitizeImageUrl = (rawUrl?: string | null): string | null => {
  if (!rawUrl) return null;
  let text = rawUrl.trim();
  if (!text) return null;

  // Strip enclosing brackets or quotes if pasted as markdown: <https://...>, [url](https://...) or "https://..."
  text = text.replace(/^<([^>]+)>$/, "$1").replace(/^['"]|['"]$/g, "");
  // Un-escape markdown escaped ampersands (\& -> &)
  text = text.replace(/\\&/g, "&");

  try {
    const parsed = new URL(text);
    const host = parsed.hostname.toLowerCase();

    // Auto-correct placehold.co URLs lacking a raster extension
    if (host === "placehold.co" || host.endsWith(".placehold.co")) {
      const pathname = parsed.pathname;
      // If no image extension is present in the path, placehold.co defaults to SVG. Append .png.
      if (!/\.(png|jpe?g|webp|gif|svg)$/i.test(pathname)) {
        parsed.pathname = `${pathname.replace(/\/+$/, "")}.png`;
      }
    }

    return parsed.toString();
  } catch {
    // If URL constructor fails, return cleaned text (validator will catch invalid URL)
    return text;
  }
};

export interface ValidateImageUrlOptions {
  required?: boolean;
  requireHttps?: boolean;
  fieldLabel?: string;
}

export const validateImageUrl = (
  value?: string | null,
  options?: ValidateImageUrlOptions
): true | string => {
  const { required = false, requireHttps = true, fieldLabel = "Image URL" } = options || {};
  const trimmed = String(value ?? "").trim();

  if (!trimmed) {
    return required ? `${fieldLabel} is required.` : true;
  }

  // Pre-clean for validation check
  const cleaned = sanitizeImageUrl(trimmed) || trimmed;

  if (requireHttps && !cleaned.toLowerCase().startsWith("https://")) {
    return `${fieldLabel} must start with https:// (secured HTTPS protocol).`;
  }

  if (cleaned.length > 1000) {
    return `${fieldLabel} must not exceed 1000 characters.`;
  }

  try {
    const parsed = new URL(cleaned);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "Enter a valid http(s) URL.";
    }

    // Check for unsupported SVG format
    const path = parsed.pathname.toLowerCase();
    if (path.endsWith(".svg")) {
      return "SVG images are not supported by the mobile app (CachedNetworkImage). Please provide a PNG, JPG, or WebP image.";
    }

    return true;
  } catch {
    return "Enter a valid URL.";
  }
};
