import { supabaseClient } from "../supabaseClient";
import type {
  MasterBatch,
  MasterBranchStatus,
  MasterCategory,
  MasterCountry,
  MasterDistrict,
  MasterMedium,
  MasterRegion,
  MasterState,
  MasterValaya,
  MasterValayaDistrict,
} from "../types/branch";
import { getDistinctValayaOptions, type ValayaOption } from "./valayaScope";

export type MasterOptions = {
  categories: MasterCategory[];
  batches: MasterBatch[];
  countries: MasterCountry[];
  states: MasterState[];
  districts: MasterDistrict[];
  valayas: MasterValaya[];
  valayaDistricts: MasterValayaDistrict[];
  regions: MasterRegion[];
  statuses: MasterBranchStatus[];
  mediums: MasterMedium[];
  distinctValayas: ValayaOption[];
};

export const emptyMasterOptions: MasterOptions = {
  categories: [],
  batches: [],
  countries: [],
  states: [],
  districts: [],
  valayas: [],
  valayaDistricts: [],
  regions: [],
  statuses: [],
  mediums: [],
  distinctValayas: [],
};

const sortByDisplayOrder = <T extends { display_order?: number }>(
  records: T[] | null | undefined,
) => [...(records ?? [])].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

const normalizeMasterRows = <T>(
  records: unknown[] | null | undefined,
  namePrefix: string,
): T[] => ((records ?? []) as Record<string, unknown>[]).map((row) => {
  const localized = row[`${namePrefix}_name`];
  const names = localized && typeof localized === "object"
    ? localized as { en?: unknown; kn?: unknown }
    : {};
  const englishName = typeof names.en === "string" ? names.en : "";
  const kannadaName = typeof names.kn === "string" ? names.kn : englishName;

  return {
    ...row,
    [`${namePrefix}_name_en`]: englishName,
    [`${namePrefix}_name_kn`]: kannadaName,
  } as T;
});

// Module-level in-memory cache to guarantee 0 calls after initial fetch
let cachedMasterOptions: MasterOptions | null = null;
let pendingFetchPromise: Promise<MasterOptions> | null = null;

const fetchMasterTableFallback = async <T>(
  table: string,
  namePrefix: string,
): Promise<T[]> => {
  const { data, error } = await supabaseClient
    .from(table)
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  if (error) {
    console.error(`masterOptionsService: Error fetching ${table}:`, error);
    return [];
  }

  return normalizeMasterRows<T>(data, namePrefix);
};

const fetchValayaDistricts = async (): Promise<MasterValayaDistrict[]> => {
  const { data, error } = await supabaseClient
    .from("master_valaya_districts")
    .select("valaya_id,district_id,is_active,created_at")
    .eq("is_active", true);

  if (error) {
    console.error("masterOptionsService: Error fetching master_valaya_districts:", error);
    return [];
  }

  return (data ?? []) as MasterValayaDistrict[];
};

const fetchAllMasterOptions = async (): Promise<MasterOptions> => {
  try {
    // 1. Try single RPC call for maximum performance (1 HTTP request)
    const { data: rpcData, error: rpcError } = await supabaseClient.rpc(
      "get_branch_master_options",
    );

    if (!rpcError && rpcData && typeof rpcData === "object") {
      const payload = rpcData as Partial<MasterOptions>;
      // The RPC response can contain only the distinct Valaya rows.  The form
      // needs every Valaya-to-district mapping row in order to populate the
      // dependent District dropdown, so load that relationship table directly.
      const [distinctValayas, districts, valayas, valayaDistricts] = await Promise.all([
        getDistinctValayaOptions(),
        fetchMasterTableFallback<MasterDistrict>("master_districts", "district"),
        fetchMasterTableFallback<MasterValaya>("master_valayas", "valaya"),
        fetchValayaDistricts(),
      ]);

      return {
        categories: sortByDisplayOrder(normalizeMasterRows<MasterCategory>(payload.categories, "category")),
        batches: sortByDisplayOrder(normalizeMasterRows<MasterBatch>(payload.batches, "batch")),
        countries: sortByDisplayOrder(normalizeMasterRows<MasterCountry>(payload.countries, "country")),
        states: sortByDisplayOrder(normalizeMasterRows<MasterState>(payload.states, "state")),
        districts: sortByDisplayOrder(districts),
        valayas: sortByDisplayOrder(valayas),
        valayaDistricts,
        regions: sortByDisplayOrder(normalizeMasterRows<MasterRegion>(payload.regions, "region")),
        statuses: sortByDisplayOrder(normalizeMasterRows<MasterBranchStatus>(payload.statuses, "status")),
        mediums: sortByDisplayOrder(normalizeMasterRows<MasterMedium>(payload.mediums, "medium")),
        distinctValayas,
      };
    }
  } catch (err) {
    console.warn("get_branch_master_options RPC not available, falling back to direct table queries:", err);
  }

  // 2. Graceful fallback if RPC function is not yet created in Supabase
  const [
    categories,
    batches,
    countries,
    states,
    districts,
    valayas,
    valayaDistricts,
    regions,
    statuses,
    mediums,
    distinctValayas,
  ] = await Promise.all([
    fetchMasterTableFallback<MasterCategory>("master_categories", "category"),
    fetchMasterTableFallback<MasterBatch>("master_batches", "batch"),
    fetchMasterTableFallback<MasterCountry>("master_countries", "country"),
    fetchMasterTableFallback<MasterState>("master_states", "state"),
    fetchMasterTableFallback<MasterDistrict>("master_districts", "district"),
    fetchMasterTableFallback<MasterValaya>("master_valayas", "valaya"),
    fetchValayaDistricts(),
    fetchMasterTableFallback<MasterRegion>("master_regions", "region"),
    fetchMasterTableFallback<MasterBranchStatus>("master_branch_statuses", "status"),
    fetchMasterTableFallback<MasterMedium>("master_mediums", "medium"),
    getDistinctValayaOptions(),
  ]);

  return {
    categories: sortByDisplayOrder(categories),
    batches: sortByDisplayOrder(batches),
    countries: sortByDisplayOrder(countries),
    states: sortByDisplayOrder(states),
    districts: sortByDisplayOrder(districts),
    valayas: sortByDisplayOrder(valayas),
    valayaDistricts,
    regions: sortByDisplayOrder(regions),
    statuses: sortByDisplayOrder(statuses),
    mediums: sortByDisplayOrder(mediums),
    distinctValayas,
  };
};

export const getMasterOptions = async (): Promise<MasterOptions> => {
  if (cachedMasterOptions) {
    return cachedMasterOptions;
  }

  if (!pendingFetchPromise) {
    pendingFetchPromise = fetchAllMasterOptions()
      .then((data) => {
        cachedMasterOptions = data;
        pendingFetchPromise = null;
        return data;
      })
      .catch((err) => {
        pendingFetchPromise = null;
        throw err;
      });
  }

  return pendingFetchPromise;
};

export const clearMasterOptionsCache = () => {
  cachedMasterOptions = null;
  pendingFetchPromise = null;
};
