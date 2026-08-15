export type OutcomeFilter = "all" | "success" | "failure";
export type DatePreset = "today" | "yesterday" | "7days" | "custom";

export interface ApiStatsFilters {
  start: Date;
  end: Date;
  preset: DatePreset;
  resource: string;
  method: string;
  outcome: OutcomeFilter;
  hour: number | null;
}

export interface ApiResourceStat {
  bucket_start: string;
  resource: string;
  source: string;
  method: string;
  normalized_path: string;
  total_requests: number;
  success_2xx: number;
  redirect_3xx: number;
  client_error_4xx: number;
  server_error_5xx: number;
  avg_response_ms: number | null;
  p50_response_ms: number | null;
  p95_response_ms: number | null;
  max_response_ms: number | null;
  cache_hits: number;
  cache_misses: number;
  cache_bypasses: number;
  first_request_at: string | null;
  last_request_at: string | null;
}

export interface HourlyMatrixDatum {
  bucket_start: string;
  resource: string;
  total_requests: number;
  is_storage: boolean;
}

export interface SystemStat {
  bucket_start: string;
  system: string;
  operation: string;
  total_events: number;
  successes: number;
  warnings: number;
  failures: number;
  avg_duration_ms: number | null;
  p95_duration_ms: number | null;
}

export interface CollectionRun {
  window_start: string;
  window_end: string;
  collector_name: string;
  status: string;
  rows_api: number;
  rows_cdn: number;
  rows_system: number;
  started_at: string;
  completed_at: string | null;
  sanitized_error_message: string | null;
}

export interface MatrixRow {
  bucketStart: string;
  values: Record<string, number>;
  applicationTotal: number;
  storageTotal: number;
}
