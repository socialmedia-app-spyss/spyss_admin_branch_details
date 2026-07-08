import { supabaseClient } from "../supabaseClient";

export type ResolveMapLinkResult = {
  success: boolean;
  finalUrl?: string;
  partial?: boolean;
  requiresManualCoordinates?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  area?: string | null;
  pincode?: string | null;
  source?: string;
  coordinateSource?: string;
  addressSource?: string | null;
  error?: string;
  suggestion?: string;
};

type ResolveMapLinkResponse = {
  success?: boolean;
  finalUrl?: string;
  partial?: boolean;
  requiresManualCoordinates?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  area?: string | null;
  pincode?: string | null;
  source?: string;
  coordinateSource?: string;
  addressSource?: string | null;
  error?: string;
  suggestion?: string;
};

const getFunctionErrorPayload = async (error: unknown): Promise<ResolveMapLinkResponse | null> => {
  const context = (error as { context?: unknown })?.context;

  if (!(context instanceof Response)) {
    return null;
  }

  try {
    return (await context.json()) as ResolveMapLinkResponse;
  } catch {
    return null;
  }
};

export const resolveGoogleMapLink = async (googleLocationLink: string): Promise<ResolveMapLinkResult> => {
  if (!googleLocationLink?.trim()) {
    return {
      success: false,
      error: "Google location link is required.",
    };
  }

  const { data, error } = await supabaseClient.functions.invoke<ResolveMapLinkResponse>("resolve-map-link", {
    body: {
      url: googleLocationLink.trim(),
    },
  });

  if (error) {
    console.error("resolve-map-link function error:", error);
    const errorPayload = await getFunctionErrorPayload(error);

    return {
      success: false,
      finalUrl: errorPayload?.finalUrl,
      error: errorPayload?.error || error.message || "Failed to resolve map link.",
      suggestion: errorPayload?.suggestion,
    };
  }

  console.log("Resolved map response:", data);

  if (!data?.success) {
    return {
      success: false,
      error: data?.error || "Could not extract address details from this link.",
      suggestion: data?.suggestion,
    };
  }

  return {
    success: true,
    finalUrl: data.finalUrl,
    partial: data.partial,
    requiresManualCoordinates: data.requiresManualCoordinates,
    latitude: data.latitude,
    longitude: data.longitude,
    address: data.address,
    area: data.area,
    pincode: data.pincode,
    source: data.source,
    coordinateSource: data.coordinateSource,
    addressSource: data.addressSource,
    suggestion: data.suggestion,
  };
};
