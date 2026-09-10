-- Privacy-safe, read-only observability access for approved SUPER_ADMIN users.
-- This migration is additive. It does not grant access to the underlying tables.

create or replace function public.observability_require_super_admin()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not exists (
    select 1
    from public.user_profiles as profile
    where profile.id = auth.uid()
      and profile.role = 'SUPER_ADMIN'
      and profile.status = 'APPROVED'
      and profile.is_active is true
  ) then
    raise exception 'API statistics are restricted to active, approved SUPER_ADMIN users'
      using errcode = '42501';
  end if;
end;
$$;

revoke all on function public.observability_require_super_admin() from public, anon, authenticated;

create or replace function public.observability_get_admin_resource_stats(
  p_start timestamptz,
  p_end timestamptz,
  p_resource text default null,
  p_method text default null,
  p_outcome text default null,
  p_hour smallint default null
)
returns table (
  bucket_start timestamptz, resource text, source text, method text, normalized_path text,
  total_requests bigint, success_2xx bigint, redirect_3xx bigint,
  client_error_4xx bigint, server_error_5xx bigint,
  avg_response_ms numeric, p50_response_ms numeric, p95_response_ms numeric,
  max_response_ms numeric, cache_hits bigint, cache_misses bigint, cache_bypasses bigint,
  first_request_at timestamptz, last_request_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.observability_require_super_admin();
  if p_start is null or p_end is null or p_end <= p_start or p_end - p_start > interval '31 days' then
    raise exception 'Date range must be positive and no longer than 31 days' using errcode = '22023';
  end if;
  if p_hour is not null and (p_hour < 0 or p_hour > 23) then
    raise exception 'Hour must be between 0 and 23' using errcode = '22023';
  end if;
  if p_outcome is not null and p_outcome not in ('success', 'failure') then
    raise exception 'Outcome must be success or failure' using errcode = '22023';
  end if;

  return query
  with classified as (
    select a.*,
      case
        when a.path ~ '^/rest/v1/rpc/[^/]+' then 'RPC: ' || split_part(a.path, '/', 5)
        when a.path ~ '^/rest/v1/[^/]+' then split_part(a.path, '/', 4)
        when a.path ~ '^/functions/v1/[^/]+' then 'Function: ' || split_part(a.path, '/', 4)
        when a.path like '/auth/v1/%' then 'Auth'
        when a.path like '/storage/v1/object/%' then 'Storage/CDN'
        when a.path like '/realtime/v1/%' then 'Realtime'
        else 'Other'
      end as resource_name
    from public.observability_api_hourly a
    where a.bucket_start >= p_start and a.bucket_start < p_end
  )
  select c.bucket_start, c.resource_name, c.source, c.method, c.path,
    c.total_requests, c.success_2xx, c.redirect_3xx, c.client_error_4xx, c.server_error_5xx,
    c.avg_response_ms, c.p50_response_ms, c.p95_response_ms, c.max_response_ms,
    c.cache_hits, c.cache_misses, c.cache_bypasses, c.first_request_at, c.last_request_at
  from classified c
  where (p_resource is null or c.resource_name = p_resource)
    and (p_method is null or c.method = upper(p_method))
    and (p_outcome is null
      or (p_outcome = 'success' and c.success_2xx > 0)
      or (p_outcome = 'failure' and c.client_error_4xx + c.server_error_5xx > 0))
    and (p_hour is null or extract(hour from c.bucket_start at time zone 'Asia/Kolkata') = p_hour)
  order by c.bucket_start desc, c.total_requests desc;
end;
$$;

create or replace function public.observability_get_admin_hourly_matrix(
  p_start timestamptz, p_end timestamptz, p_resource text default null,
  p_method text default null, p_outcome text default null, p_hour smallint default null
)
returns table (bucket_start timestamptz, resource text, total_requests bigint, is_storage boolean)
language plpgsql security definer set search_path = ''
as $$
begin
  perform public.observability_require_super_admin();
  if p_start is null or p_end is null or p_end <= p_start or p_end - p_start > interval '31 days' then
    raise exception 'Date range must be positive and no longer than 31 days' using errcode = '22023';
  end if;
  if p_hour is not null and (p_hour < 0 or p_hour > 23) then raise exception 'Hour must be between 0 and 23' using errcode = '22023'; end if;
  if p_outcome is not null and p_outcome not in ('success', 'failure') then raise exception 'Invalid outcome' using errcode = '22023'; end if;
  return query
  select r.bucket_start, r.resource, sum(r.total_requests)::bigint,
    (r.resource = 'Storage/CDN')
  from public.observability_get_admin_resource_stats(p_start, p_end, p_resource, p_method, p_outcome, p_hour) r
  group by r.bucket_start, r.resource;
end;
$$;

create or replace function public.observability_get_admin_system_stats(
  p_start timestamptz, p_end timestamptz, p_hour smallint default null
)
returns table (bucket_start timestamptz, system text, operation text, total_events bigint,
  successes bigint, warnings bigint, failures bigint, avg_duration_ms numeric, p95_duration_ms numeric)
language plpgsql security definer set search_path = ''
as $$
begin
  perform public.observability_require_super_admin();
  if p_start is null or p_end is null or p_end <= p_start or p_end - p_start > interval '31 days' then
    raise exception 'Date range must be positive and no longer than 31 days' using errcode = '22023';
  end if;
  if p_hour is not null and (p_hour < 0 or p_hour > 23) then raise exception 'Hour must be between 0 and 23' using errcode = '22023'; end if;
  return query
  select s.bucket_start, s.system, s.operation, s.total_events, s.successes, s.warnings,
    s.failures, s.avg_duration_ms, s.p95_duration_ms
  from public.observability_system_hourly s
  where s.bucket_start >= p_start and s.bucket_start < p_end
    and (p_hour is null or extract(hour from s.bucket_start at time zone 'Asia/Kolkata') = p_hour)
  order by s.bucket_start desc, s.system, s.operation;
end;
$$;

create or replace function public.observability_get_admin_collection_health(
  p_start timestamptz, p_end timestamptz
)
returns table (window_start timestamptz, window_end timestamptz, collector_name text, status text,
  rows_api integer, rows_cdn integer, rows_system integer, started_at timestamptz,
  completed_at timestamptz, sanitized_error_message text)
language plpgsql security definer set search_path = ''
as $$
begin
  perform public.observability_require_super_admin();
  if p_start is null or p_end is null or p_end <= p_start or p_end - p_start > interval '31 days' then
    raise exception 'Date range must be positive and no longer than 31 days' using errcode = '22023';
  end if;
  return query
  select c.window_start, c.window_end, c.collector_name, c.status, c.rows_api, c.rows_cdn,
    c.rows_system, c.started_at, c.completed_at,
    case when c.error_message is null then null else left(regexp_replace(c.error_message,
      '(https?://[^ ]+|[[:alnum:]_.+-]+@[[:alnum:].-]+|[0-9a-fA-F-]{32,}|Bearer [^ ]+)', '[redacted]', 'gi'), 240) end
  from public.observability_collection_runs c
  where c.window_start >= p_start and c.window_start < p_end
  order by c.window_start desc;
end;
$$;

revoke all on function public.observability_get_admin_resource_stats(timestamptz,timestamptz,text,text,text,smallint) from public, anon;
revoke all on function public.observability_get_admin_hourly_matrix(timestamptz,timestamptz,text,text,text,smallint) from public, anon;
revoke all on function public.observability_get_admin_system_stats(timestamptz,timestamptz,smallint) from public, anon;
revoke all on function public.observability_get_admin_collection_health(timestamptz,timestamptz) from public, anon;
grant execute on function public.observability_get_admin_resource_stats(timestamptz,timestamptz,text,text,text,smallint) to authenticated;
grant execute on function public.observability_get_admin_hourly_matrix(timestamptz,timestamptz,text,text,text,smallint) to authenticated;
grant execute on function public.observability_get_admin_system_stats(timestamptz,timestamptz,smallint) to authenticated;
grant execute on function public.observability_get_admin_collection_health(timestamptz,timestamptz) to authenticated;
