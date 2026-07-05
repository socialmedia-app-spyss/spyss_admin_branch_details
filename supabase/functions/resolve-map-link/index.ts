import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const allowedHosts = [
  "maps.app.goo.gl",
  "goo.gl",
  "www.google.com",
  "google.com",
  "maps.google.com",
];

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  Response.json(body, {
    status,
    headers: corsHeaders,
  });

const isAllowedGoogleMapsUrl = (inputUrl: string) => {
  try {
    const parsedUrl = new URL(inputUrl);
    return allowedHosts.some(
      (host) => parsedUrl.hostname === host || parsedUrl.hostname.endsWith(`.${host}`),
    );
  } catch {
    return false;
  }
};

const getValidCoordinates = (latValue: string, lngValue: string) => {
  const latitude = Number(latValue);
  const longitude = Number(lngValue);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return {
    latitude,
    longitude,
  };
};

type CoordinateSource =
  | "place_pin_3d_4d"
  | "query_q"
  | "query_query"
  | "query_ll"
  | "query_center"
  | "search_path"
  | "viewport_at";

const extractLatLng = (url: string) => {
  const decodedUrl = decodeURIComponent(url);

  const patterns: Array<{ source: CoordinateSource; regex: RegExp }> = [
    {
      source: "place_pin_3d_4d",
      regex: /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    },
    {
      source: "query_q",
      regex: /[?&]q=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    },
    {
      source: "query_query",
      regex: /[?&]query=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    },
    {
      source: "query_ll",
      regex: /[?&]ll=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    },
    {
      source: "query_center",
      regex: /[?&]center=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    },
    {
      source: "search_path",
      regex: /\/search\/(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    },
    {
      source: "viewport_at",
      regex: /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    },
  ];

  for (const pattern of patterns) {
    const match = decodedUrl.match(pattern.regex);
    const coordinates = match ? getValidCoordinates(match[1], match[2]) : null;

    if (coordinates) {
      return {
        ...coordinates,
        source: pattern.source,
      };
    }
  }

  return null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Only POST method is allowed" }, 405);
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return jsonResponse({ error: "Google Maps URL is required" }, 400);
    }

    const trimmedUrl = url.trim();

    if (!isAllowedGoogleMapsUrl(trimmedUrl)) {
      return jsonResponse({ error: "Only Google Maps links are allowed" }, 400);
    }

    const coordinatesFromInput = extractLatLng(trimmedUrl);

    if (coordinatesFromInput) {
      return jsonResponse({
        success: true,
        finalUrl: trimmedUrl,
        latitude: coordinatesFromInput.latitude,
        longitude: coordinatesFromInput.longitude,
        source: coordinatesFromInput.source,
      });
    }

    const response = await fetch(trimmedUrl, {
      method: "GET",
      redirect: "follow",
    });

    const finalUrl = response.url;
    const coordinates = extractLatLng(finalUrl);

    if (!coordinates) {
      return jsonResponse(
        {
          error: "Could not extract latitude and longitude from this Google Maps link",
          finalUrl,
        },
        422,
      );
    }

    return jsonResponse({
      success: true,
      finalUrl,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      source: coordinates.source,
    });
  } catch (error) {
    return jsonResponse(
      {
        error: "Failed to resolve Google Maps link",
        details: String(error),
      },
      500,
    );
  }
});
