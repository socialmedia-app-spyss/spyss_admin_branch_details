import { supabaseClient } from "../supabaseClient";
import type { MasterValaya } from "../types/branch";
import type { AppLanguage } from "../contexts/language";
import type { UserProfile } from "../types/user";
import { getLocalizedName } from "../utils/i18n";

// ---------------------------------------------------------------------------
// Core row/option shapes
// ---------------------------------------------------------------------------

/**
 * Minimal valaya row used for scope/access checks.
 * Carries both name columns so any caller can display a localized label.
 */
export type ValayaScopeRow = Pick<
  MasterValaya,
  "id" | "valaya_name_en" | "valaya_name_kn" | "valaya_code" | "district_id"
>;

export type ValayaScope = {
  valayaCode: string | null;
  /** Localized name resolved at call-time; use getLocalizedValayaName for on-demand resolution. */
  valayaNameEn: string | null;
  valayaNameKn: string | null;
  valayaRows: ValayaScopeRow[];
  districtIds: string[];
};

/**
 * Option shape used in Valaya dropdowns.
 * Always carries both language columns; callers resolve the display label
 * via getLocalizedName(option.valaya_name_en, option.valaya_name_kn, language).
 */
export type ValayaOption = {
  id: string;
  valaya_name_en: string;
  valaya_name_kn: string;
  valaya_code: string;
  district_id?: string | null;
  state_id?: string | null;
  display_order?: number;
  is_active?: boolean;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns the localized display label for a ValayaOption or ValayaScopeRow. */
export const getLocalizedValayaName = (
  row: Pick<ValayaOption, "valaya_name_en" | "valaya_name_kn">,
  language: AppLanguage,
): string => getLocalizedName(row.valaya_name_en, row.valaya_name_kn, language);

type ValayaOptionRow = {
  id: string;
  valaya_name?: string;
  valaya_name_en?: string;
  valaya_name_kn?: string;
  valaya_code: string;
  district_id?: string | null;
  state_id?: string | null;
  display_order?: number;
  is_active?: boolean;
  master_districts?: { state_id?: string | null } | null;
};

const normalizeValayaOption = (row: ValayaOptionRow): ValayaOption => ({
  id: row.id,
  valaya_name_en: row.valaya_name_en ?? row.valaya_name ?? "",
  valaya_name_kn: row.valaya_name_kn ?? row.valaya_name ?? row.valaya_name_en ?? "",
  valaya_code: row.valaya_code,
  district_id: row.district_id ?? null,
  state_id: row.state_id ?? row.master_districts?.state_id ?? null,
  display_order: row.display_order,
  is_active: row.is_active,
});

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const getMatchingValayaIdForDistrict = (
  valayaRows: ValayaScopeRow[],
  districtId?: string | null,
): string | null =>
  valayaRows.find((row) => row.district_id === districtId)?.id ?? null;

export const getValayaScopeForUser = async (
  userProfile?: Pick<UserProfile, "valaya_id"> | null,
): Promise<ValayaScope> => {
  const empty: ValayaScope = {
    valayaCode: null,
    valayaNameEn: null,
    valayaNameKn: null,
    valayaRows: [],
    districtIds: [],
  };

  if (!userProfile?.valaya_id) return empty;

  const { data: userValaya, error: userValayaError } = await supabaseClient
    .from("master_valayas")
    .select("*")
    .eq("id", userProfile.valaya_id)
    .maybeSingle();

  if (userValayaError || !userValaya?.valaya_code) {
    if (userValayaError) {
      console.error("getValayaScopeForUser: Error fetching user valaya:", userValayaError);
    }
    return empty;
  }

  const { data: valayaRows, error: valayaRowsError } = await supabaseClient
    .from("master_valayas")
    .select("*")
    .eq("valaya_code", userValaya.valaya_code)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (valayaRowsError) {
    console.error(
      "getValayaScopeForUser: Error fetching accessible valaya rows:",
      valayaRowsError,
    );
  }

  const normalizedUserValaya = normalizeValayaOption(userValaya as ValayaOptionRow);
  const rows: ValayaScopeRow[] = ((valayaRows ?? []) as ValayaOptionRow[])
    .map(normalizeValayaOption)
    .filter((row) => Boolean(row.district_id))
    .map((row) => ({
      id: row.id,
      valaya_name_en: row.valaya_name_en,
      valaya_name_kn: row.valaya_name_kn,
      valaya_code: row.valaya_code,
      district_id: row.district_id as string,
    }));

  return {
    valayaCode: userValaya.valaya_code,
    valayaNameEn: normalizedUserValaya.valaya_name_en,
    valayaNameKn: normalizedUserValaya.valaya_name_kn,
    valayaRows: rows,
    districtIds: rows.map((row) => row.district_id).filter(Boolean) as string[],
  };
};

export const getDistinctValayaOptions = async (): Promise<ValayaOption[]> => {
  // Prefer the bilingual master table. The legacy view can expose only
  // valaya_name (English), which would make Kannada mode display English.
  const masterResult = await supabaseClient
      .from("master_valayas")
      .select("*, master_districts(state_id)")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

  if (!masterResult.error && masterResult.data) {
    const byCode = new Map<string, ValayaOption>();

    for (const row of masterResult.data as ValayaOptionRow[]) {
      if (!byCode.has(row.valaya_code)) {
        byCode.set(row.valaya_code, normalizeValayaOption(row));
      }
    }

    return Array.from(byCode.values());
  }

  console.warn(
    "getDistinctValayaOptions: Falling back to vw_valaya_options.",
    masterResult.error,
  );

  const { data, error } = await supabaseClient
      .from("vw_valaya_options")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

  if (error) {
    console.error("getDistinctValayaOptions: Error fetching Valaya options:", error);
    return [];
  }

  return ((data ?? []) as ValayaOptionRow[]).map(normalizeValayaOption);
};
