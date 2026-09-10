-- Carry the admin access rules forward after daily_panchanga was replaced by
-- app_panchanga. Without these grants PostgREST returns 403 for the dashboard.
alter table public.app_panchanga enable row level security;

-- RLS policies do not replace table privileges. The API error explicitly
-- reports that authenticated currently has no SELECT privilege.
grant select, insert, update on table public.app_panchanga to authenticated;
grant delete on table public.app_panchanga to authenticated;

drop policy if exists app_panchanga_admin_select on public.app_panchanga;
drop policy if exists app_panchanga_admin_insert on public.app_panchanga;
drop policy if exists app_panchanga_admin_update on public.app_panchanga;
drop policy if exists app_panchanga_super_admin_delete on public.app_panchanga;

create policy app_panchanga_admin_select
on public.app_panchanga for select to authenticated
using (
  exists (
    select 1 from public.user_profiles profile
    where profile.id = auth.uid()
      and profile.role in ('SUPER_ADMIN', 'PANCHANGA_ADMIN')
      and profile.status = 'APPROVED'
      and profile.is_active = true
  )
);

create policy app_panchanga_admin_insert
on public.app_panchanga for insert to authenticated
with check (
  exists (
    select 1 from public.user_profiles profile
    where profile.id = auth.uid()
      and profile.role in ('SUPER_ADMIN', 'PANCHANGA_ADMIN')
      and profile.status = 'APPROVED'
      and profile.is_active = true
  )
);

create policy app_panchanga_admin_update
on public.app_panchanga for update to authenticated
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

create policy app_panchanga_super_admin_delete
on public.app_panchanga for delete to authenticated
using (
  exists (
    select 1 from public.user_profiles profile
    where profile.id = auth.uid()
      and profile.role = 'SUPER_ADMIN'
      and profile.status = 'APPROVED'
      and profile.is_active = true
  )
);

notify pgrst, 'reload schema';
