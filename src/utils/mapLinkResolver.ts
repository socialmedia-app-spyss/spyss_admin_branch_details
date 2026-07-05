import { supabaseClient } from "../supabaseClient";

export type ResolveMapLinkResult = {
  success: boolean;
  finalUrl?: string;
  latitude?: number;
  longitude?: number;
  source?: string;
  error?: string;
};

type ResolveMapLinkResponse = {
  success?: boolean;
  finalUrl?: string;
  latitude?: number;
  longitude?: number;
  source?: string;
  error?: string;
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

    return {
      success: false,
      error: error.message || "Failed to resolve map link.",
    };
  }

  console.log("Resolved map response:", data);

  if (!data?.latitude || !data?.longitude) {
    return {
      success: false,
      error: data?.error || "Could not extract latitude and longitude from this link.",
    };
  }

  return {
    success: true,
    finalUrl: data.finalUrl,
    latitude: data.latitude,
    longitude: data.longitude,
    source: data.source,
  };
};
