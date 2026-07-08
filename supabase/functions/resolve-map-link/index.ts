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
      host === "share.google" ||
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

function isResolvedGoogleMapsLocationUrl(inputUrl: string) {
  try {
    const parsedUrl = new URL(inputUrl);
    const host = parsedUrl.hostname.toLowerCase();
    const path = parsedUrl.pathname.toLowerCase();

    const isGoogleHost =
      host === "maps.google.com" ||
      host === "www.google.com" ||
      host === "google.com" ||
      host === "www.google.co.in" ||
      host === "google.co.in" ||
      host === "maps.google.co.in" ||
      /^(.+\.)?google\.[a-z.]+$/.test(host);

    if (!isGoogleHost) {
      return false;
    }

    return (
      path.includes("/maps/place/") ||
      path.includes("/maps/dir/") ||
      path.includes("/maps/search/") ||
      path.includes("/maps/@") ||
      path === "/maps"
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

  const decimalPatterns: Array<{
    source: string;
    regex: RegExp;
    order: "lat_lng" | "lng_lat";
  }> = [
    {
      // Common Google Maps place pin format:
      // !3d12.983166!4d77.4720401
      source: "place_pin_3d_4d",
      regex: /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
      order: "lat_lng",
    },
    {
      // Your sample URL format:
      // !1d77.4720401!2d12.983166
      // Here longitude comes first, latitude second.
      source: "place_pin_1d_2d",
      regex: /!1d(-?\d+(?:\.\d+)?)!2d(-?\d+(?:\.\d+)?)/,
      order: "lng_lat",
    },
    {
      // Another Google Maps data format:
      // !2d77.4720401!3d12.983166
      source: "place_pin_2d_3d",
      regex: /!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/,
      order: "lng_lat",
    },
    {
      source: "query_q",
      regex: /[?&]q=(-?\d+(?:\.\d+)?),[\s+]*(-?\d+(?:\.\d+)?)/,
      order: "lat_lng",
    },
    {
      source: "query_ll",
      regex: /[?&]ll=(-?\d+(?:\.\d+)?),[\s+]*(-?\d+(?:\.\d+)?)/,
      order: "lat_lng",
    },
    {
      source: "query_center",
      regex: /[?&]center=(-?\d+(?:\.\d+)?),[\s+]*(-?\d+(?:\.\d+)?)/,
      order: "lat_lng",
    },
    {
      source: "maps_search_path_coordinates",
      regex: /\/maps\/search\/(-?\d+(?:\.\d+)?),[\s+]*(-?\d+(?:\.\d+)?)/,
      order: "lat_lng",
    },
    {
      // Keep this last.
      // @lat,lng is often only map viewport center, not exact place pin.
      source: "viewport_at_fallback",
      regex: /@(-?\d+(?:\.\d+)?),[\s+]*(-?\d+(?:\.\d+)?)/,
      order: "lat_lng",
    },
  ];

  for (const pattern of decimalPatterns) {
    const match = decodedText.match(pattern.regex);

    if (match) {
      let latitude: number;
      let longitude: number;

      if (pattern.order === "lng_lat") {
        longitude = Number(match[1]);
        latitude = Number(match[2]);
      } else {
        latitude = Number(match[1]);
        longitude = Number(match[2]);
      }

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

function decodeGoogleMapsAddressPart(input: string) {
  try {
    // Preserve plus codes like XFJF%2BQJF.
    // But convert normal + into space.
    const preservedPlusCode = input.replace(/%2B/gi, "__PLUS_SIGN__");
    const spacesFixed = preservedPlusCode.replace(/\+/g, " ");
    const decoded = decodeURIComponent(spacesFixed);

    return decoded
      .replace(/__PLUS_SIGN__/g, "+")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return input.replace(/\+/g, " ").replace(/\s+/g, " ").trim();
  }
}

function looksLikeOnlyCoordinates(input: string) {
  return /^-?\d+(?:\.\d+)?,\s*-?\d+(?:\.\d+)?$/.test(input.trim());
}

function cleanExtractedAddress(input: string | null) {
  if (!input) {
    return null;
  }

  const cleaned = input
    .replace(/^\/+|\/+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned || looksLikeOnlyCoordinates(cleaned)) {
    return null;
  }

  return cleaned;
}

function extractAddressFromUrl(inputUrl: string) {
  try {
    const parsedUrl = new URL(inputUrl);
    const rawPath = parsedUrl.pathname;

    // Example:
    // /maps/dir//Ayur+Ashrama,+XFJF%2BQJF,+Magadi+Main+Road.../@...
    if (rawPath.includes("/maps/dir/")) {
      let pathBeforeMapPosition = rawPath.split("/@")[0];
      pathBeforeMapPosition = pathBeforeMapPosition.split("/data=")[0];

      const parts = pathBeforeMapPosition
        .split("/")
        .filter(Boolean)
        .filter((part) => part !== "maps" && part !== "dir");

      const lastPart = parts[parts.length - 1];

      const address = cleanExtractedAddress(
        decodeGoogleMapsAddressPart(lastPart || "")
      );

      if (address) {
        return {
          address,
          source: "maps_dir_path",
        };
      }
    }

    // Example:
    // /maps/place/Ayur+Ashrama/@...
    if (rawPath.includes("/maps/place/")) {
      const part = rawPath
        .split("/maps/place/")[1]
        ?.split("/@")[0]
        ?.split("/data=")[0];

      const address = cleanExtractedAddress(
        decodeGoogleMapsAddressPart(part || "")
      );

      if (address) {
        return {
          address,
          source: "maps_place_path",
        };
      }
    }

    // Example:
    // /maps/search/Ayur+Ashrama...
    if (rawPath.includes("/maps/search/")) {
      const part = rawPath
        .split("/maps/search/")[1]
        ?.split("/@")[0]
        ?.split("/data=")[0];

      const address = cleanExtractedAddress(
        decodeGoogleMapsAddressPart(part || "")
      );

      if (address) {
        return {
          address,
          source: "maps_search_path",
        };
      }
    }

    // Query params fallback:
    // ?q=address
    // ?query=address
    // ?destination=address
    // ?daddr=address
    const queryKeys = ["q", "query", "destination", "daddr"];

    for (const key of queryKeys) {
      const value = parsedUrl.searchParams.get(key);

      const address = cleanExtractedAddress(value);

      if (address) {
        return {
          address,
          source: `query_${key}`,
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

function extractPlusCode(parts: string[]) {
  for (const part of parts) {
    const cleaned = part.trim();

    // Examples:
    // XFJF+QJF
    // 7J4V+82 Bengaluru
    if (/^[23456789CFGHJMPQRVWX]{4,}\+[23456789CFGHJMPQRVWX]{2,}/i.test(cleaned)) {
      return cleaned;
    }
  }

  return null;
}

function extractRoad(parts: string[]) {
  const roadWords = [
    "road",
    "main road",
    "street",
    "cross",
    "lane",
    "highway",
    "marg",
    "circle",
  ];

  for (const part of parts) {
    const lower = part.toLowerCase();

    if (roadWords.some((word) => lower.includes(word))) {
      return part.trim();
    }
  }

  return null;
}

function extractAddressParts(address: string | null) {
  if (!address) {
    return {
      placeName: null,
      plusCode: null,
      road: null,
      area: null,
      city: null,
      state: null,
      pincode: null,
      country: null,
    };
  }

  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const pincodeMatch = address.match(/\b\d{6}\b/);
  const pincode = pincodeMatch ? pincodeMatch[0] : null;

  const knownStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi",
  ];

  const knownCountries = ["India", "Bharat"];

  let state: string | null = null;
  let stateIndex = -1;

  for (let i = 0; i < parts.length; i++) {
    const cleanPart = parts[i].replace(/\b\d{6}\b/g, "").trim();

    if (knownStates.includes(cleanPart)) {
      state = cleanPart;
      stateIndex = i;
      break;
    }
  }

  let country: string | null = null;

  for (const part of parts) {
    const cleanPart = part.trim();

    if (knownCountries.includes(cleanPart)) {
      country = cleanPart;
      break;
    }
  }

  let city: string | null = null;

  const cityCandidates = [
    "Bengaluru",
    "Bangalore",
    "Mysuru",
    "Mangalore",
    "Mangaluru",
    "Tumakuru",
    "Tumkur",
    "Hubballi",
    "Dharwad",
    "Belagavi",
    "Shivamogga",
    "Hassan",
    "Mandya",
    "Udupi",
    "Kolar",
    "Chikkaballapur",
    "Ramanagara",
    "Davangere",
    "Ballari",
    "Vijayapura",
    "Bagalkot",
    "Kalaburagi",
    "Bidar",
    "Raichur",
    "Koppal",
    "Gadag",
    "Haveri",
    "Chitradurga",
    "Chikkamagaluru",
    "Kodagu",
    "Karwar",
  ];

  for (const part of parts) {
    const cleanPart = part.replace(/\b\d{6}\b/g, "").trim();

    if (cityCandidates.includes(cleanPart)) {
      city = cleanPart;
      break;
    }
  }

  // Fallback: if city was not found, use the part before state.
  // This is not always perfect, so known city list is preferred.
  if (!city && stateIndex > 0) {
    city = parts[stateIndex - 1].replace(/\b\d{6}\b/g, "").trim();
  }

  const plusCode = extractPlusCode(parts);
  const road = extractRoad(parts);

  const placeName =
    parts.length > 0 &&
    !looksLikeOnlyCoordinates(parts[0]) &&
    parts[0] !== plusCode
      ? parts[0]
      : null;

  const ignoredWords = [
    "road",
    "main road",
    "street",
    "cross",
    "lane",
    "highway",
    "marg",
    "circle",
    "stage",
    "phase",
    "block",
    "layout",
    "near",
    "opposite",
    "beside",
    "behind",
    "karnataka",
    "india",
  ];

  const areaCandidates = parts.filter((part) => {
    const lower = part.toLowerCase();
    const cleanPart = part.replace(/\b\d{6}\b/g, "").trim();

    if (!cleanPart) return false;
    if (cleanPart === placeName) return false;
    if (cleanPart === plusCode) return false;
    if (cleanPart === road) return false;
    if (cleanPart === city) return false;
    if (cleanPart === state) return false;
    if (cleanPart === country) return false;
    if (pincode && part.includes(pincode)) return false;
    if (looksLikeOnlyCoordinates(cleanPart)) return false;
    if (ignoredWords.some((word) => lower.includes(word))) return false;

    return true;
  });

  const area = areaCandidates.length > 0 ? areaCandidates[0] : null;

  return {
    placeName,
    plusCode,
    road,
    area,
    city,
    state,
    pincode,
    country,
  };
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
        success: false,
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
          success: false,
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
          success: false,
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
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-IN,en;q=0.9",
      },
    });

    const finalUrl = response.url;

    if (!isResolvedGoogleMapsLocationUrl(finalUrl)) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "This link does not open a Google Maps location. Please paste a proper Google Maps location link.",
          inputUrl: url,
          finalUrl,
          suggestion:
            "Open the location in Google Maps, tap Share, then copy the Google Maps link.",
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

    console.log("Input URL:", url);
    console.log("Final URL:", finalUrl);

    let coordinates = extractLatLngFromText(finalUrl);

    if (!coordinates) {
      coordinates = extractLatLngFromText(url);
    }

    let addressResult = extractAddressFromUrl(finalUrl);

    if (!addressResult) {
      addressResult = extractAddressFromUrl(url);
    }

    let responseBody = "";
    let bodyPreview = "";

    // Read body only if needed.
    if (!coordinates || !addressResult) {
      responseBody = await response.text();
      bodyPreview = responseBody.slice(0, 500);
    }

    if (!coordinates && responseBody) {
      coordinates = extractLatLngFromText(responseBody);
    }

    // Address from HTML body is not very reliable.
    // But this fallback may help in some Google response formats.
    if (!addressResult && responseBody) {
      addressResult = extractAddressFromUrl(responseBody);
    }

    if (!coordinates && !addressResult) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Could not extract location details from this Google Maps link",
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

    const addressParts = extractAddressParts(addressResult?.address || null);

    return new Response(
      JSON.stringify({
        success: true,
        partial: !coordinates,
        requiresManualCoordinates: !coordinates,

        inputUrl: url,
        finalUrl,

        latitude: coordinates?.latitude || null,
        longitude: coordinates?.longitude || null,
        coordinateSource: coordinates?.source || null,

        address: addressResult?.address || null,
        addressSource: addressResult?.source || null,

        placeName: addressParts.placeName,
        plusCode: addressParts.plusCode,
        road: addressParts.road,
        area: addressParts.area,
        city: addressParts.city,
        state: addressParts.state,
        pincode: addressParts.pincode,
        country: addressParts.country,
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
        success: false,
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
