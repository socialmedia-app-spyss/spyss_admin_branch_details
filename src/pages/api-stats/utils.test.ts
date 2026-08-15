import assert from "node:assert/strict";
import test from "node:test";
import type { ApiResourceStat } from "./types.ts";
import { aggregateResourceStats, calculateSummary, classifyResource, dateInputToIst, pivotHourlyMatrix } from "./utils.ts";

test("classifies supported normalized API paths", () => {
  assert.equal(classifyResource("/rest/v1/events"), "events");
  assert.equal(classifyResource("/rest/v1/rpc/rebuild_summary"), "RPC: rebuild_summary");
  assert.equal(classifyResource("/functions/v1/send-notification"), "Function: send-notification");
  assert.equal(classifyResource("/auth/v1/token"), "Auth");
  assert.equal(classifyResource("/storage/v1/object/public/events/:object"), "Storage/CDN");
  assert.equal(classifyResource("/realtime/v1/websocket"), "Realtime");
  assert.equal(classifyResource("/unknown"), "Other");
});

test("converts IST date inputs to UTC boundaries", () => {
  assert.equal(dateInputToIst("2026-08-15").toISOString(), "2026-08-14T18:30:00.000Z");
  assert.equal(dateInputToIst("2026-08-15", true).toISOString(), "2026-08-15T18:30:00.000Z");
});

test("pivots dynamic resources without adding storage to application totals", () => {
  const bucket = "2026-08-15T04:30:00Z";
  const result = pivotHourlyMatrix([
    { bucket_start: bucket, resource: "events", total_requests: 7, is_storage: false },
    { bucket_start: bucket, resource: "new_resource", total_requests: 3, is_storage: false },
    { bucket_start: bucket, resource: "Storage/CDN", total_requests: 5, is_storage: true },
  ]);
  assert.deepEqual(result.resources, ["events", "new_resource"]);
  assert.equal(result.rows[0].applicationTotal, 10);
  assert.equal(result.rows[0].storageTotal, 5);
});

test("calculates totals and rates", () => {
  const row = { total_requests: 10, success_2xx: 8, redirect_3xx: 0, client_error_4xx: 1,
    server_error_5xx: 1, avg_response_ms: 20, p95_response_ms: 50, cache_hits: 6,
    cache_misses: 2, cache_bypasses: 2 } as ApiResourceStat;
  assert.deepEqual(calculateSummary([row]), { total: 10, successful: 8, fourXx: 1, fiveXx: 1,
    successPercent: 80, averageMs: 20, p95Ms: 50, cdnHitRate: 60 });
});

test("combines hourly API detail rows by resource, method and path", () => {
  const base = {
    resource: "events", source: "api", method: "GET", normalized_path: "/rest/v1/events",
    success_2xx: 1, redirect_3xx: 0, client_error_4xx: 0, server_error_5xx: 0,
    p50_response_ms: 10, p95_response_ms: 20, max_response_ms: 30,
    cache_hits: 0, cache_misses: 0, cache_bypasses: 0,
  };
  const combined = aggregateResourceStats([
    { ...base, bucket_start: "2026-08-15T00:30:00Z", total_requests: 1, avg_response_ms: 10,
      first_request_at: "2026-08-15T00:31:00Z", last_request_at: "2026-08-15T00:32:00Z" },
    { ...base, bucket_start: "2026-08-15T01:30:00Z", total_requests: 3, success_2xx: 2,
      client_error_4xx: 1, avg_response_ms: 30, p95_response_ms: 50, max_response_ms: 60,
      first_request_at: "2026-08-15T01:31:00Z", last_request_at: "2026-08-15T01:35:00Z" },
  ] as ApiResourceStat[]);
  assert.equal(combined.length, 1);
  assert.equal(combined[0].total_requests, 4);
  assert.equal(combined[0].success_2xx, 3);
  assert.equal(combined[0].client_error_4xx, 1);
  assert.equal(combined[0].avg_response_ms, 25);
  assert.equal(combined[0].p95_response_ms, 50);
  assert.equal(combined[0].first_request_at, "2026-08-15T00:31:00Z");
  assert.equal(combined[0].last_request_at, "2026-08-15T01:35:00Z");
});
