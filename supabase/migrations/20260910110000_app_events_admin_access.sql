-- Enable Row Level Security for app_events
alter table public.app_events enable row level security;

-- Grant necessary table privileges to authenticated and anon roles
grant select, insert, update, delete on table public.app_events to authenticated;
grant select on table public.app_events to anon;

-- Remove any older app_events policies to prevent restrictive conflicts
do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'app_events'
  loop
    execute format('drop policy if exists %I on public.app_events', existing_policy.policyname);
  end loop;
end
$$;

-- Super Administrator policy: full CRUD access for approved, active SUPER_ADMIN users
create policy app_events_super_admin_all
on public.app_events for all to authenticated
using (
  exists (
    select 1 from public.user_profiles profile
    where profile.id = auth.uid()
      and profile.role = 'SUPER_ADMIN'
      and profile.status = 'APPROVED'
      and profile.is_active = true
  )
)
with check (
  exists (
    select 1 from public.user_profiles profile
    where profile.id = auth.uid()
      and profile.role = 'SUPER_ADMIN'
      and profile.status = 'APPROVED'
      and profile.is_active = true
  )
);

-- Public / Mobile policy: read-only access for active, published events
create policy app_events_public_read
on public.app_events for select
using (
  is_active is true
  and visible_from <= now()
);

-- Refresh PostgREST schema cache
notify pgrst, 'reload schema';
