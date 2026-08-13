-- Add admin-panel access without removing or replacing existing application policies.
alter table public.daily_amrutha_vachana enable row level security;

drop policy if exists daily_amrutha_vachana_admin_select on public.daily_amrutha_vachana;
create policy daily_amrutha_vachana_admin_select
on public.daily_amrutha_vachana for select to authenticated
using (
  exists (
    select 1 from public.user_profiles profile
    where profile.id = auth.uid()
      and profile.role in ('SUPER_ADMIN', 'PANCHANGA_ADMIN')
      and profile.status = 'APPROVED'
      and profile.is_active = true
  )
);

drop policy if exists daily_amrutha_vachana_admin_insert on public.daily_amrutha_vachana;
create policy daily_amrutha_vachana_admin_insert
on public.daily_amrutha_vachana for insert to authenticated
with check (
  exists (
    select 1 from public.user_profiles profile
    where profile.id = auth.uid()
      and profile.role in ('SUPER_ADMIN', 'PANCHANGA_ADMIN')
      and profile.status = 'APPROVED'
      and profile.is_active = true
  )
);

drop policy if exists daily_amrutha_vachana_admin_update on public.daily_amrutha_vachana;
create policy daily_amrutha_vachana_admin_update
on public.daily_amrutha_vachana for update to authenticated
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

drop policy if exists daily_amrutha_vachana_super_admin_delete on public.daily_amrutha_vachana;
create policy daily_amrutha_vachana_super_admin_delete
on public.daily_amrutha_vachana for delete to authenticated
using (
  exists (
    select 1 from public.user_profiles profile
    where profile.id = auth.uid()
      and profile.role = 'SUPER_ADMIN'
      and profile.status = 'APPROVED'
      and profile.is_active = true
  )
);

-- The editor needs author names for its author selector. This select policy is
-- additive and leaves all existing author policies intact.
alter table public.amrutha_vachana_authors enable row level security;
drop policy if exists amrutha_vachana_authors_admin_select on public.amrutha_vachana_authors;
create policy amrutha_vachana_authors_admin_select
on public.amrutha_vachana_authors for select to authenticated
using (
  exists (
    select 1 from public.user_profiles profile
    where profile.id = auth.uid()
      and profile.role in ('SUPER_ADMIN', 'PANCHANGA_ADMIN')
      and profile.status = 'APPROVED'
      and profile.is_active = true
  )
);
