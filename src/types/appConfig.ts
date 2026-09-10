export type Platform = "android" | "ios";

export interface AppConfig {
  platform: Platform;
  is_app_running: boolean;
  force_update_active: boolean;
  min_build_number: number;
  maintenance_title: string;
  maintenance_message: string;
  update_title: string;
  update_message: string;
  store_url: string;
  updated_at?: string;
}

export interface AppConfigInput {
  platform: Platform;
  is_app_running: boolean;
  force_update_active: boolean;
  min_build_number: number | string;
  maintenance_title: string;
  maintenance_message: string;
  update_title: string;
  update_message: string;
  store_url: string;
}
