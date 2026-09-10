// ---------------------------------------------------------------------------
// Localized string structure for JSONB fields
// ---------------------------------------------------------------------------

export interface LocalizedString {
  en?: string;
  kn?: string;
}

// ---------------------------------------------------------------------------
// Branch entity matching public.app_branches
// ---------------------------------------------------------------------------

export interface Branch {
  id: string;
  branch_code: string;
  version: number;

  branch_name: LocalizedString;
  full_address: LocalizedString;
  area: LocalizedString;
  nagara: LocalizedString;
  upa_nagara: LocalizedString;
  mukhyashikshak: LocalizedString;

  class_timings: string;
  category_id: string;
  batch_id: string;
  medium_id: string;
  status_id: string;
  country_id: string;
  state_id: string;
  district_id: string;
  valaya_id: string;
  region_id?: string | null;

  class_days: string[];
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
  google_location_link?: string | null;

  contact_number: string;
  whatsapp_number?: string | null;
  spyss_main_contact_number: string;
  email_id?: string | null;
  branch_start_date?: string | null;
  is_active: boolean;

  branch_name_en_sort?: string | null;

  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Form state representation (flat for React Hook Form)
// ---------------------------------------------------------------------------

export interface BranchFormValues {
  branch_name_en: string;
  branch_name_kn: string;

  category_id: string;
  batch_id: string;
  valaya_id: string;
  country_id: string;
  state_id: string;
  district_id: string;
  region_id?: string | null;
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
  spyss_main_contact_number?: string | null;

  branch_start_date?: string | null;
  is_active: boolean;
}

// ---------------------------------------------------------------------------
// DB Input types sent to Supabase app_branches
// ---------------------------------------------------------------------------

export interface BranchCreateInput {
  branch_name: LocalizedString;
  full_address: LocalizedString;
  area: LocalizedString;
  nagara: LocalizedString;
  upa_nagara: LocalizedString;
  mukhyashikshak: LocalizedString;

  class_timings: string;
  category_id: string;
  batch_id: string;
  medium_id: string;
  status_id: string;
  country_id: string;
  state_id: string;
  district_id: string;
  valaya_id: string;
  region_id?: string | null;

  class_days: string[];
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
  google_location_link?: string | null;

  contact_number: string;
  whatsapp_number?: string | null;
  spyss_main_contact_number?: string | null;
  email_id?: string | null;
  branch_start_date?: string | null;
  is_active: boolean;
}

export type BranchUpdateInput = Partial<BranchCreateInput>;

// ---------------------------------------------------------------------------
// Master lookup interfaces
// ---------------------------------------------------------------------------

export interface MasterCountry {
  id: string;
  country_name: LocalizedString;
  country_name_en: string;
  country_name_kn: string;
  country_code: string;
  phone_code?: string | null;
  display_order: number;
  is_active: boolean;
}

export interface MasterState {
  id: string;
  state_name: LocalizedString;
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
  district_name: LocalizedString;
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
  valaya_name: LocalizedString;
  district_id?: string | null;
  valaya_name_en: string;
  valaya_name_kn: string;
  valaya_code: string;
  description?: string | null;
  display_order: number;
  is_active: boolean;
}

export interface MasterValayaDistrict {
  valaya_id: string;
  district_id: string;
  is_active: boolean;
  created_at?: string;
}

export interface MasterRegion {
  id: string;
  region_name: LocalizedString;
  district_id: string;
  region_name_en: string;
  region_name_kn: string;
  region_code: string;
  description?: string | null;
  display_order: number;
  is_active: boolean;
}

export interface MasterCategory {
  id: string;
  category_name: LocalizedString;
  category_name_en: string;
  category_name_kn: string;
  category_code: string;
  description?: string | null;
  display_order: number;
  is_active: boolean;
}

export interface MasterBatch {
  id: string;
  batch_name: LocalizedString;
  batch_name_en: string;
  batch_name_kn: string;
  batch_code: string;
  description?: string | null;
  display_order: number;
  is_active: boolean;
}

export interface MasterMedium {
  id: string;
  medium_name: LocalizedString;
  medium_name_en: string;
  medium_name_kn: string;
  medium_code: string;
  description?: string | null;
  display_order: number;
  is_active: boolean;
}

export interface MasterBranchStatus {
  id: string;
  status_name: LocalizedString;
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

export type PartialMasterState = Pick<
  MasterState,
  "state_name"
>;

export type PartialMasterCountry = Pick<
  MasterCountry,
  "country_name"
>;

export type PartialMasterDistrict = Pick<
  MasterDistrict,
  "district_name"
>;

export type PartialMasterValaya = Pick<
  MasterValaya,
  "valaya_name"
>;

export type PartialMasterRegion = Pick<
  MasterRegion,
  "region_name"
>;

export type PartialMasterCategory = Pick<
  MasterCategory,
  "category_name"
>;

export type PartialMasterBatch = Pick<
  MasterBatch,
  "batch_name"
>;

export type PartialMasterMedium = Pick<
  MasterMedium,
  "medium_name"
>;

export type PartialMasterBranchStatus = Pick<
  MasterBranchStatus,
  "status_name"
>;

export interface BranchWithMasters extends Branch {
  master_countries?: PartialMasterCountry | null;
  master_categories?: PartialMasterCategory | null;
  master_batches?: PartialMasterBatch | null;
  master_states?: PartialMasterState | null;
  master_districts?: PartialMasterDistrict | null;
  master_valayas?: PartialMasterValaya | null;
  master_regions?: PartialMasterRegion | null;
  master_branch_statuses?: PartialMasterBranchStatus | null;
  master_mediums?: PartialMasterMedium | null;
}
