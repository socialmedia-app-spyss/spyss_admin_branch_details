-- Grant permissions and RLS policies for Amrutha Vachana tables

-- 1. Table-level privileges for authors and author translations
grant select on table public.amrutha_vachana_authors to authenticated, anon;
grant select on table public.amrutha_vachana_author_translations to authenticated, anon;

-- 2. Privileges on app_amrutha_vachana
grant select, insert, update, delete on table public.app_amrutha_vachana to authenticated;
grant select on table public.app_amrutha_vachana to anon;

-- 3. Ensure compatibility alias view for daily_amrutha_vachana
create or replace view public.daily_amrutha_vachana as
  select * from public.app_amrutha_vachana;
grant select, insert, update, delete on table public.daily_amrutha_vachana to authenticated, anon;

-- 4. Enable Row Level Security and setup policies on app_amrutha_vachana
alter table public.app_amrutha_vachana enable row level security;

drop policy if exists app_amrutha_vachana_admin_select on public.app_amrutha_vachana;
create policy app_amrutha_vachana_admin_select
on public.app_amrutha_vachana for select to authenticated
using (
  exists (
    select 1 from public.user_profiles profile
    where profile.id = auth.uid()
      and profile.role in ('SUPER_ADMIN', 'PANCHANGA_ADMIN')
      and profile.status = 'APPROVED'
      and profile.is_active = true
  )
);

drop policy if exists app_amrutha_vachana_admin_insert on public.app_amrutha_vachana;
create policy app_amrutha_vachana_admin_insert
on public.app_amrutha_vachana for insert to authenticated
with check (
  exists (
    select 1 from public.user_profiles profile
    where profile.id = auth.uid()
      and profile.role in ('SUPER_ADMIN', 'PANCHANGA_ADMIN')
      and profile.status = 'APPROVED'
      and profile.is_active = true
  )
);

drop policy if exists app_amrutha_vachana_admin_update on public.app_amrutha_vachana;
create policy app_amrutha_vachana_admin_update
on public.app_amrutha_vachana for update to authenticated
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

drop policy if exists app_amrutha_vachana_super_admin_delete on public.app_amrutha_vachana;
create policy app_amrutha_vachana_super_admin_delete
on public.app_amrutha_vachana for delete to authenticated
using (
  exists (
    select 1 from public.user_profiles profile
    where profile.id = auth.uid()
      and profile.role = 'SUPER_ADMIN'
      and profile.status = 'APPROVED'
      and profile.is_active = true
  )
);
