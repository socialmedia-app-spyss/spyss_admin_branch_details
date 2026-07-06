import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function isAllowedGoogleMapsUrl(inputUrl: string) {
  try {
    const parsedUrl = new URL(inputUrl);
    const host = parsedUrl.hostname.toLowerCase();

    return (
      host === "maps.app.goo.gl" ||
      host === "goo.gl" ||
      host === "maps.google.com" ||
      host === "www.google.com" ||
      host === "google.com" ||
      host === "www.google.co.in" ||
      host === "google.co.in" ||
      host === "maps.google.co.in" ||
      /^(.+\.)?google\.[a-z.]+$/.test(host)
    );
  } catch {
    return false;
  }
}

function isValidLatLng(latitude: number, longitude: number) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function dmsToDecimal(
  degrees: number,
  minutes: number,
  seconds: number,
  direction: string
) {
  let decimal = degrees + minutes / 60 + seconds / 3600;

  if (direction === "S" || direction === "W") {
    decimal = decimal * -1;
  }

  return decimal;
}

function safeDecodeURIComponent(input: string) {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}

function extractLatLngFromText(input: string) {
  const decodedText = safeDecodeURIComponent(input);

  const decimalPatterns = [
    {
      source: "place_pin_3d_4d",
      regex: /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    },
    {
      source: "query_q",
      regex: /[?&]q=(-?\d+(?:\.\d+)?),[\s+]*(-?\d+(?:\.\d+)?)/,
    },
    {
      source: "query_ll",
      regex: /[?&]ll=(-?\d+(?:\.\d+)?),[\s+]*(-?\d+(?:\.\d+)?)/,
    },
    {
      source: "query_center",
      regex: /[?&]center=(-?\d+(?:\.\d+)?),[\s+]*(-?\d+(?:\.\d+)?)/,
    },
    {
      source: "search_path",
      regex: /\/maps\/search\/(-?\d+(?:\.\d+)?),[\s+]*(-?\d+(?:\.\d+)?)/,
    },
    {
      source: "viewport_at",
      regex: /@(-?\d+(?:\.\d+)?),[\s+]*(-?\d+(?:\.\d+)?)/,
    },
  ];

  for (const pattern of decimalPatterns) {
    const match = decodedText.match(pattern.regex);

    if (match) {
      const latitude = Number(match[1]);
      const longitude = Number(match[2]);

      if (isValidLatLng(latitude, longitude)) {
        return {
          latitude,
          longitude,
          source: pattern.source,
        };
      }
    }
  }

  // Example:
  // 12°51'31.5"N+77°34'59.4"E
  const dmsPattern =
    /(\d{1,2})°(\d{1,2})'([\d.]+)"([NS])[\s+]+(\d{1,3})°(\d{1,2})'([\d.]+)"([EW])/;

  const dmsMatch = decodedText.match(dmsPattern);

  if (dmsMatch) {
    const latitude = dmsToDecimal(
      Number(dmsMatch[1]),
      Number(dmsMatch[2]),
      Number(dmsMatch[3]),
      dmsMatch[4]
    );

    const longitude = dmsToDecimal(
      Number(dmsMatch[5]),
      Number(dmsMatch[6]),
      Number(dmsMatch[7]),
      dmsMatch[8]
    );

    if (isValidLatLng(latitude, longitude)) {
      return {
        latitude,
        longitude,
        source: "dms_coordinates",
      };
    }
  }

  return null;
}

async function getRequestUrl(req: Request) {
  const bodyText = await req.text();

  if (!bodyText?.trim()) {
    return null;
  }

  try {
    const parsedBody = JSON.parse(bodyText);

    if (typeof parsedBody === "string") {
      return parsedBody.trim();
    }

    if (typeof parsedBody?.url === "string") {
      return parsedBody.url.trim();
    }
  } catch {
    return bodyText.trim();
  }

  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Only POST method is allowed",
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    const url = await getRequestUrl(req);

    if (!url) {
      return new Response(
        JSON.stringify({
          error: "Google Maps URL is required",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!isAllowedGoogleMapsUrl(url)) {
      return new Response(
        JSON.stringify({
          error: "Only Google Maps links are allowed",
          receivedUrl: url,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-IN,en;q=0.9",
      },
    });

    const finalUrl = response.url;

    console.log("Input URL:", url);
    console.log("Final URL:", finalUrl);

    // First try final URL.
    let coordinates = extractLatLngFromText(finalUrl);

    // Fallback: try response HTML body also.
    let bodyPreview = "";

    if (!coordinates) {
      const responseBody = await response.text();
      bodyPreview = responseBody.slice(0, 500);

      coordinates = extractLatLngFromText(responseBody);
    }

    if (!coordinates) {
      return new Response(
        JSON.stringify({
          error:
            "Could not extract latitude and longitude from this Google Maps link",
          inputUrl: url,
          finalUrl,
          bodyPreview,
        }),
        {
          status: 422,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        inputUrl: url,
        finalUrl,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        source: coordinates.source,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("resolve-map-link error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to resolve Google Maps link",
        details: String(error),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
