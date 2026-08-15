import type { ApiResourceStat, HourlyMatrixDatum, MatrixRow } from "./types";

export const IST_TIME_ZONE = "Asia/Kolkata";
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export const classifyResource = (path: string): string => {
  const rpc = path.match(/^\/rest\/v1\/rpc\/([^/]+)/);
  if (rpc) return `RPC: ${rpc[1]}`;
  const table = path.match(/^\/rest\/v1\/([^/]+)/);
  if (table) return table[1];
  const fn = path.match(/^\/functions\/v1\/([^/]+)/);
  if (fn) return `Function: ${fn[1]}`;
  if (path.startsWith("/auth/v1/")) return "Auth";
  if (path.startsWith("/storage/v1/object/")) return "Storage/CDN";
  if (path.startsWith("/realtime/v1/")) return "Realtime";
  return "Other";
};

const istDateParts = (date: Date) => {
  const shifted = new Date(date.getTime() + IST_OFFSET_MS);
  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth(), day: shifted.getUTCDate() };
};

export const istDayRange = (offsetDays = 0): { start: Date; end: Date } => {
  const parts = istDateParts(new Date());
  const startUtc = Date.UTC(parts.year, parts.month, parts.day + offsetDays) - IST_OFFSET_MS;
  return { start: new Date(startUtc), end: new Date(startUtc + 24 * 60 * 60 * 1000) };
};

export const istDateInput = (date: Date) => new Intl.DateTimeFormat("en-CA", {
  timeZone: IST_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
}).format(date);

export const dateInputToIst = (value: string, endExclusive = false) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + (endExclusive ? 1 : 0)) - IST_OFFSET_MS);
};

export const formatIst = (value: string | Date | null, includeSeconds = false) => value
  ? new Intl.DateTimeFormat("en-IN", {
      timeZone: IST_TIME_ZONE, dateStyle: "medium",
      timeStyle: includeSeconds ? "medium" : "short",
    }).format(new Date(value))
  : "—";

export const pivotHourlyMatrix = (data: HourlyMatrixDatum[]): { resources: string[]; rows: MatrixRow[] } => {
  const resources = [...new Set(data.filter((item) => !item.is_storage).map((item) => item.resource))].sort();
  const map = new Map<string, MatrixRow>();
  data.forEach((item) => {
    const row = map.get(item.bucket_start) ?? { bucketStart: item.bucket_start, values: {}, applicationTotal: 0, storageTotal: 0 };
    row.values[item.resource] = (row.values[item.resource] ?? 0) + Number(item.total_requests);
    if (item.is_storage) row.storageTotal += Number(item.total_requests);
    else row.applicationTotal += Number(item.total_requests);
    map.set(item.bucket_start, row);
  });
  return { resources, rows: [...map.values()].sort((a, b) => b.bucketStart.localeCompare(a.bucketStart)) };
};

export const calculateSummary = (rows: ApiResourceStat[]) => {
  const total = rows.reduce((sum, row) => sum + Number(row.total_requests), 0);
  const successful = rows.reduce((sum, row) => sum + Number(row.success_2xx), 0);
  const fourXx = rows.reduce((sum, row) => sum + Number(row.client_error_4xx), 0);
  const fiveXx = rows.reduce((sum, row) => sum + Number(row.server_error_5xx), 0);
  const weightedAverage = total ? rows.reduce((sum, row) => sum + Number(row.avg_response_ms ?? 0) * Number(row.total_requests), 0) / total : 0;
  const p95 = rows.reduce((max, row) => Math.max(max, Number(row.p95_response_ms ?? 0)), 0);
  const hits = rows.reduce((sum, row) => sum + Number(row.cache_hits), 0);
  const misses = rows.reduce((sum, row) => sum + Number(row.cache_misses), 0);
  const bypasses = rows.reduce((sum, row) => sum + Number(row.cache_bypasses), 0);
  return { total, successful, fourXx, fiveXx, successPercent: total ? successful / total * 100 : 0,
    averageMs: weightedAverage, p95Ms: p95, cdnHitRate: hits + misses + bypasses ? hits / (hits + misses + bypasses) * 100 : 0 };
};

export const aggregateResourceStats = (rows: ApiResourceStat[]): ApiResourceStat[] => {
  const grouped = new Map<string, ApiResourceStat>();

  rows.forEach((row) => {
    const key = `${row.resource}\u0000${row.method}\u0000${row.normalized_path}`;
    const current = grouped.get(key);
    if (!current) {
      grouped.set(key, { ...row });
      return;
    }

    const currentRequests = Number(current.total_requests);
    const rowRequests = Number(row.total_requests);
    const combinedRequests = currentRequests + rowRequests;
    const weighted = (left: number | null, right: number | null) => {
      if (left == null && right == null) return null;
      return combinedRequests
        ? ((Number(left ?? 0) * currentRequests) + (Number(right ?? 0) * rowRequests)) / combinedRequests
        : 0;
    };

    current.total_requests = combinedRequests;
    current.success_2xx = Number(current.success_2xx) + Number(row.success_2xx);
    current.redirect_3xx = Number(current.redirect_3xx) + Number(row.redirect_3xx);
    current.client_error_4xx = Number(current.client_error_4xx) + Number(row.client_error_4xx);
    current.server_error_5xx = Number(current.server_error_5xx) + Number(row.server_error_5xx);
    current.cache_hits = Number(current.cache_hits) + Number(row.cache_hits);
    current.cache_misses = Number(current.cache_misses) + Number(row.cache_misses);
    current.cache_bypasses = Number(current.cache_bypasses) + Number(row.cache_bypasses);
    current.avg_response_ms = weighted(current.avg_response_ms, row.avg_response_ms);
    // Exact cross-hour percentiles cannot be reconstructed from aggregates. The maximum
    // hourly percentile is conservative and avoids understating a slow selected period.
    current.p50_response_ms = Math.max(Number(current.p50_response_ms ?? 0), Number(row.p50_response_ms ?? 0));
    current.p95_response_ms = Math.max(Number(current.p95_response_ms ?? 0), Number(row.p95_response_ms ?? 0));
    current.max_response_ms = Math.max(Number(current.max_response_ms ?? 0), Number(row.max_response_ms ?? 0));
    current.first_request_at = [current.first_request_at, row.first_request_at].filter(Boolean).sort()[0] ?? null;
    current.last_request_at = [current.last_request_at, row.last_request_at].filter(Boolean).sort().at(-1) ?? null;
    if (row.bucket_start > current.bucket_start) current.bucket_start = row.bucket_start;
  });

  return [...grouped.values()];
};
