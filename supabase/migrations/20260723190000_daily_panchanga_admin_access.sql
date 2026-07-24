-- Daily Panchanga is managed by approved, active super admins and Panchanga admins.
-- Panchanga admins can read, create, and edit, but cannot delete.
alter table public.daily_panchanga enable row level security;

do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'daily_panchanga'
  loop
    execute format('drop policy if exists %I on public.daily_panchanga', existing_policy.policyname);
  end loop;
end
$$;

create policy daily_panchanga_admin_select
on public.daily_panchanga for select to authenticated
using (
  exists (
    select 1 from public.user_profiles profile
    where profile.id = auth.uid()
      and profile.role in ('SUPER_ADMIN', 'PANCHANGA_ADMIN')
      and profile.status = 'APPROVED'
      and profile.is_active = true
  )
);

create policy daily_panchanga_admin_insert
on public.daily_panchanga for insert to authenticated
with check (
  exists (
    select 1 from public.user_profiles profile
    where profile.id = auth.uid()
      and profile.role in ('SUPER_ADMIN', 'PANCHANGA_ADMIN')
      and profile.status = 'APPROVED'
      and profile.is_active = true
  )
);

create policy daily_panchanga_admin_update
on public.daily_panchanga for update to authenticated
using (
  exists (
    select 1 from public.user_profiles profile
    where profile.id = auth.uid()
      and profile.role in ('SUPER_ADMIN', 'PANCHANGA_ADMIN')
      and profile.status = 'APPROVED'
      and profile.is_active = true
  )
)
with check (
  exists (
    select 1 from public.user_profiles profile
    where profile.id = auth.uid()
      and profile.role in ('SUPER_ADMIN', 'PANCHANGA_ADMIN')
      and profile.status = 'APPROVED'
      and profile.is_active = true
  )
);

create policy daily_panchanga_super_admin_delete
on public.daily_panchanga for delete to authenticated
using (
  exists (
    select 1 from public.user_profiles profile
    where profile.id = auth.uid()
      and profile.role = 'SUPER_ADMIN'
      and profile.status = 'APPROVED'
      and profile.is_active = true
  )
);
