import { supabaseClient } from "../../supabaseClient";
import type { ApiResourceStat, ApiStatsFilters, CollectionRun, HourlyMatrixDatum, SystemStat } from "./types";

const params = (filters: ApiStatsFilters) => ({
  p_start: filters.start.toISOString(), p_end: filters.end.toISOString(),
  p_resource: filters.resource || null, p_method: filters.method || null,
  p_outcome: filters.outcome === "all" ? null : filters.outcome, p_hour: filters.hour,
});

const unwrap = <T>(data: unknown, error: { message: string } | null): T => {
  if (error) throw new Error(error.message);
  return (data ?? []) as T;
};

export const getApiStats = async (filters: ApiStatsFilters) => {
  const [resources, matrix, systems, health] = await Promise.all([
    supabaseClient.rpc("observability_get_admin_resource_stats", params(filters)),
    supabaseClient.rpc("observability_get_admin_hourly_matrix", params(filters)),
    supabaseClient.rpc("observability_get_admin_system_stats", { p_start: filters.start.toISOString(), p_end: filters.end.toISOString(), p_hour: filters.hour }),
    supabaseClient.rpc("observability_get_admin_collection_health", { p_start: filters.start.toISOString(), p_end: filters.end.toISOString() }),
  ]);
  return {
    resources: unwrap<ApiResourceStat[]>(resources.data, resources.error),
    matrix: unwrap<HourlyMatrixDatum[]>(matrix.data, matrix.error),
    systems: unwrap<SystemStat[]>(systems.data, systems.error),
    health: unwrap<CollectionRun[]>(health.data, health.error),
  };
};
