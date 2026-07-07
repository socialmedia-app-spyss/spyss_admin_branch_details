import { supabaseClient } from "../supabaseClient";
import type { MasterValaya } from "../types/branch";
import type { UserProfile } from "../types/user";

export type ValayaScopeRow = Pick<MasterValaya, "id" | "valaya_name" | "valaya_code" | "district_id">;

export type ValayaScope = {
  valayaCode: string | null;
  valayaName: string | null;
  valayaRows: ValayaScopeRow[];
  districtIds: string[];
};

export type ValayaOption = {
  id: string;
  valaya_name: string;
  valaya_code: string;
  district_id?: string | null;
  state_id?: string | null;
  display_order?: number;
  is_active?: boolean;
};

type ValayaOptionRow = ValayaOption & {
  master_districts?: { state_id?: string | null } | null;
};

const normalizeValayaOption = (row: ValayaOptionRow): ValayaOption => ({
  id: row.id,
  valaya_name: row.valaya_name,
  valaya_code: row.valaya_code,
  district_id: row.district_id ?? null,
  state_id: row.state_id ?? row.master_districts?.state_id ?? null,
  display_order: row.display_order,
  is_active: row.is_active,
});

export const getMatchingValayaIdForDistrict = (
  valayaRows: ValayaScopeRow[],
  districtId?: string | null,
) => valayaRows.find((row) => row.district_id === districtId)?.id ?? null;

export const getValayaScopeForUser = async (userProfile?: Pick<UserProfile, "valaya_id"> | null): Promise<ValayaScope> => {
  if (!userProfile?.valaya_id) {
    return {
      valayaCode: null,
      valayaName: null,
      valayaRows: [],
      districtIds: [],
    };
  }

  const { data: userValaya, error: userValayaError } = await supabaseClient
    .from("master_valayas")
    .select("id, valaya_name, valaya_code, district_id")
    .eq("id", userProfile.valaya_id)
    .maybeSingle();

  if (userValayaError || !userValaya?.valaya_code) {
    if (userValayaError) {
      console.error("getValayaScopeForUser: Error fetching user valaya:", userValayaError);
    }

    return {
      valayaCode: null,
      valayaName: null,
      valayaRows: [],
      districtIds: [],
    };
  }

  const { data: valayaRows, error: valayaRowsError } = await supabaseClient
    .from("master_valayas")
    .select("id, valaya_name, valaya_code, district_id")
    .eq("valaya_code", userValaya.valaya_code)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (valayaRowsError) {
    console.error("getValayaScopeForUser: Error fetching accessible valaya rows:", valayaRowsError);
  }

  const rows = (valayaRows ?? []) as ValayaScopeRow[];

  return {
    valayaCode: userValaya.valaya_code,
    valayaName: userValaya.valaya_name,
    valayaRows: rows,
    districtIds: rows.map((row) => row.district_id).filter(Boolean),
  };
};

export const getDistinctValayaOptions = async (): Promise<ValayaOption[]> => {
  const viewResult = await supabaseClient
    .from("vw_valaya_options")
    .select("id, valaya_name, valaya_code, district_id, state_id, display_order, is_active")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (!viewResult.error && viewResult.data) {
    return (viewResult.data as ValayaOptionRow[]).map(normalizeValayaOption);
  }

  console.warn("getDistinctValayaOptions: Falling back to master_valayas distinct options.", viewResult.error);

  const { data, error } = await supabaseClient
    .from("master_valayas")
    .select("id, valaya_name, valaya_code, district_id, display_order, is_active, master_districts(state_id)")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("getDistinctValayaOptions: Error fetching master_valayas:", error);
    return [];
  }

  const byCode = new Map<string, ValayaOption>();

  for (const row of (data ?? []) as ValayaOptionRow[]) {
    if (!byCode.has(row.valaya_code)) {
      byCode.set(row.valaya_code, normalizeValayaOption(row));
    }
  }

  return Array.from(byCode.values());
};
