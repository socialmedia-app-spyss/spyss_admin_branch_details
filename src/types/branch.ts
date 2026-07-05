export interface Branch {
  id: string;

  branch_code: string;
  branch_name: string;

  category_id: string;
  batch_id: string;
  valaya_id: string;
  state_id: string;
  district_id: string;
  status_id: string;
  medium_id: string;

  full_address: string;
  class_days: string[];
  class_timings: string;
  pincode: string;
  country: string;

  area?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  google_location_link?: string | null;

  mukhyashikshak: string;
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
  branch_name: string;

  category_id: string;
  batch_id: string;
  valaya_id: string;
  state_id: string;
  district_id: string;
  status_id: string;
  medium_id: string;

  full_address: string;
  class_days: string[];
  class_timings: string;
  pincode: string;
  country: string;

  area?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  google_location_link?: string | null;

  mukhyashikshak: string;
  email_id?: string | null;
  contact_number: string;
  whatsapp_number?: string | null;

  branch_start_date?: string | null;
}

export type BranchUpdateInput = Partial<BranchCreateInput>;

export interface MasterState {
  id: string;
  state_name: string;
  state_code: string;
  description?: string | null;
  display_order: number;
  is_active: boolean;
}

export interface MasterDistrict {
  id: string;
  state_id: string;
  district_name: string;
  district_code: string;
  description?: string | null;
  display_order: number;
  is_active: boolean;
}

export interface MasterValaya {
  id: string;
  district_id: string;
  valaya_name: string;
  valaya_code: string;
  description?: string | null;
  display_order: number;
  is_active: boolean;
}

export interface MasterCategory {
  id: string;
  category_name: string;
  category_code: string;
  description?: string | null;
  display_order: number;
  is_active: boolean;
}

export interface MasterBatch {
  id: string;
  batch_name: string;
  batch_code: string;
  description?: string | null;
  display_order: number;
  is_active: boolean;
}

export interface MasterMedium {
  id: string;
  medium_name: string;
  medium_code: string;
  description?: string | null;
  display_order: number;
  is_active: boolean;
}

export interface MasterBranchStatus {
  id: string;
  status_name: string;
  status_code: string;
  description?: string | null;
  display_order: number;
  is_active: boolean;
}

export interface BranchWithMasters extends Branch {
  master_categories?: MasterCategory | null;
  master_batches?: MasterBatch | null;
  master_states?: MasterState | null;
  master_districts?: MasterDistrict | null;
  master_valayas?: MasterValaya | null;
  master_branch_statuses?: MasterBranchStatus | null;
  master_mediums?: MasterMedium | null;
}
