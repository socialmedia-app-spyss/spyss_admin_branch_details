// ---------------------------------------------------------------------------
// Branch entity
// ---------------------------------------------------------------------------

export interface Branch {
  id: string;

  branch_code: string;
  branch_name_en: string;
  branch_name_kn: string;

  category_id: string;
  batch_id: string;
  valaya_id: string;
  country_id: string;
  state_id: string;
  district_id: string;
  status_id: string;
  medium_id: string;

  full_address_en: string;
  full_address_kn: string;
  class_days: string[];
  class_timings: string;
  pincode: string;

  area_en: string;
  area_kn: string;
  nagara_en?: string | null;
  nagara_kn?: string | null;
  upa_nagara_en?: string | null;
  upa_nagara_kn?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  google_location_link?: string | null;

  mukhyashikshak_en: string;
  mukhyashikshak_kn: string;
  email_id?: string | null;
  contact_number: string;
  whatsapp_number?: string | null;

  branch_start_date?: string | null;

  created_at: string;
  updated_at: string;

  created_by?: string | null;
  updated_by?: string | null;
}

export interface BranchCreateInput {
  branch_name_en: string;
  branch_name_kn: string;

  category_id: string;
  batch_id: string;
  valaya_id: string;
  country_id: string;
  state_id: string;
  district_id: string;
  status_id: string;
  medium_id: string;

  full_address_en: string;
  full_address_kn: string;
  class_days: string[];
  class_timings: string;
  pincode: string;

  area_en: string;
  area_kn: string;
  nagara_en?: string | null;
  nagara_kn?: string | null;
  upa_nagara_en?: string | null;
  upa_nagara_kn?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  google_location_link?: string | null;

  mukhyashikshak_en: string;
  mukhyashikshak_kn: string;
  email_id?: string | null;
  contact_number: string;
  whatsapp_number?: string | null;

  branch_start_date?: string | null;
}

export type BranchUpdateInput = Partial<BranchCreateInput>;

// ---------------------------------------------------------------------------
// Master lookup interfaces — each carries both language columns.
// The single-language `*_name` field has been removed; use
// getLocalizedName(item.*_name_en, item.*_name_kn, language) instead.
// ---------------------------------------------------------------------------

export interface MasterCountry {
  id: string;
  country_name_en: string;
  country_name_kn: string;
  country_code: string;
  phone_code?: string | null;
  display_order: number;
  is_active: boolean;
}

export interface MasterState {
  id: string;
  country_id: string;
  state_name_en: string;
  state_name_kn: string;
  state_code: string;
  description?: string | null;
  display_order: number;
  is_active: boolean;
}

export interface MasterDistrict {
  id: string;
  state_id: string;
  district_name_en: string;
  district_name_kn: string;
  district_code: string;
  description?: string | null;
  display_order: number;
  is_active: boolean;
}

export interface MasterValaya {
  id: string;
  district_id: string;
  valaya_name_en: string;
  valaya_name_kn: string;
  valaya_code: string;
  description?: string | null;
  display_order: number;
  is_active: boolean;
}

export interface MasterCategory {
  id: string;
  category_name_en: string;
  category_name_kn: string;
  category_code: string;
  description?: string | null;
  display_order: number;
  is_active: boolean;
}

export interface MasterBatch {
  id: string;
  batch_name_en: string;
  batch_name_kn: string;
  batch_code: string;
  description?: string | null;
  display_order: number;
  is_active: boolean;
}

export interface MasterMedium {
  id: string;
  medium_name_en: string;
  medium_name_kn: string;
  medium_code: string;
  description?: string | null;
  display_order: number;
  is_active: boolean;
}

export interface MasterBranchStatus {
  id: string;
  status_name_en: string;
  status_name_kn: string;
  status_code: string;
  description?: string | null;
  display_order: number;
  is_active: boolean;
}

// ---------------------------------------------------------------------------
// Joined branch record (from Supabase select with master relations)
// ---------------------------------------------------------------------------

/**
 * Partial master shapes returned by Supabase relational select.
 * Only the columns explicitly requested in `select` are present at runtime,
 * so each field is optional here.
 */
export type PartialMasterState = Pick<
  MasterState,
  "state_name_en" | "state_name_kn"
>;

export type PartialMasterCountry = Pick<
  MasterCountry,
  "country_name_en" | "country_name_kn"
>;

export type PartialMasterDistrict = Pick<
  MasterDistrict,
  "district_name_en" | "district_name_kn"
>;

export type PartialMasterValaya = Pick<
  MasterValaya,
  "valaya_name_en" | "valaya_name_kn"
>;

export type PartialMasterCategory = Pick<
  MasterCategory,
  "category_name_en" | "category_name_kn"
>;

export type PartialMasterBatch = Pick<
  MasterBatch,
  "batch_name_en" | "batch_name_kn"
>;

export type PartialMasterMedium = Pick<
  MasterMedium,
  "medium_name_en" | "medium_name_kn"
>;

export type PartialMasterBranchStatus = Pick<
  MasterBranchStatus,
  "status_name_en" | "status_name_kn"
>;

export interface BranchWithMasters extends Branch {
  master_countries?: PartialMasterCountry | null;
  master_categories?: PartialMasterCategory | null;
  master_batches?: PartialMasterBatch | null;
  master_states?: PartialMasterState | null;
  master_districts?: PartialMasterDistrict | null;
  master_valayas?: PartialMasterValaya | null;
  master_branch_statuses?: PartialMasterBranchStatus | null;
  master_mediums?: PartialMasterMedium | null;
}
