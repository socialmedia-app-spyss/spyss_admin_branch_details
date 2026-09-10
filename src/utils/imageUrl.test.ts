import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeImageUrl, validateImageUrl } from "./imageUrl.ts";

test("sanitizeImageUrl fixes placehold.co and escaped ampersands", () => {
  const raw =
    "https://placehold.co/1200x630/FFF0F5/E91E63?text=Happy+Birthday%21%0AWishing+You+a+Wonderful+Day%21\\&font=roboto";

  const cleaned = sanitizeImageUrl(raw);

  assert.ok(cleaned);
  assert.match(cleaned, /\/E91E63\.png\?/);
  assert.ok(!cleaned.includes("\\&"));
  assert.ok(cleaned.includes("&font=roboto"));
});

test("sanitizeImageUrl strips surrounding brackets and quotes", () => {
  assert.equal(
    sanitizeImageUrl("<https://example.com/banner.png>"),
    "https://example.com/banner.png"
  );
  assert.equal(
    sanitizeImageUrl('"https://example.com/banner.jpg"'),
    "https://example.com/banner.jpg"
  );
  assert.equal(
    sanitizeImageUrl("'https://example.com/banner.webp'"),
    "https://example.com/banner.webp"
  );
});

test("sanitizeImageUrl preserves placehold.co if extension already exists", () => {
  const withPng = "https://placehold.co/600x400.png";
  assert.equal(sanitizeImageUrl(withPng), "https://placehold.co/600x400.png");

  const withJpg = "https://placehold.co/600x400.jpg";
  assert.equal(sanitizeImageUrl(withJpg), "https://placehold.co/600x400.jpg");
});

test("validateImageUrl permits valid raster images", () => {
  assert.equal(validateImageUrl("https://example.com/photo.png"), true);
  assert.equal(validateImageUrl("https://example.com/photo.jpg"), true);
  assert.equal(validateImageUrl("https://example.com/photo.webp"), true);
  assert.equal(
    validateImageUrl(
      "https://placehold.co/1200x630/FFF0F5/E91E63?text=Happy+Birthday%21%0AWishing+You+a+Wonderful+Day%21\\&font=roboto"
    ),
    true
  );
});

test("validateImageUrl rejects SVG images", () => {
  const result = validateImageUrl("https://example.com/vector-logo.svg");
  assert.match(String(result), /SVG images are not supported by the mobile app/);
});

test("validateImageUrl enforces HTTPS when requireHttps is true", () => {
  const result = validateImageUrl("http://example.com/photo.png", { requireHttps: true });
  assert.match(String(result), /must start with https:\/\//);
});

test("validateImageUrl handles required and optional states", () => {
  assert.equal(validateImageUrl("", { required: false }), true);
  assert.equal(validateImageUrl(null, { required: false }), true);

  const reqResult = validateImageUrl("", { required: true, fieldLabel: "Banner Image" });
  assert.equal(reqResult, "Banner Image is required.");
});
