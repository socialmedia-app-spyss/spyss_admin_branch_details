-- Admin access after daily_amrutha_vachana was replaced by app_amrutha_vachana.
alter table public.app_amrutha_vachana enable row level security;

grant select, insert, update, delete on table public.app_amrutha_vachana to authenticated;
grant select on table public.amrutha_vachana_authors to authenticated;
grant select on table public.amrutha_vachana_author_translations to authenticated;

drop policy if exists app_amrutha_vachana_admin_select on public.app_amrutha_vachana;
drop policy if exists app_amrutha_vachana_admin_insert on public.app_amrutha_vachana;
drop policy if exists app_amrutha_vachana_admin_update on public.app_amrutha_vachana;
drop policy if exists app_amrutha_vachana_super_admin_delete on public.app_amrutha_vachana;

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

-- Keep the existing additive admin read policies, but ensure the table grants
-- they depend on are present.
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

drop policy if exists amrutha_vachana_author_translations_admin_select
  on public.amrutha_vachana_author_translations;
create policy amrutha_vachana_author_translations_admin_select
on public.amrutha_vachana_author_translations for select to authenticated
using (
  exists (
    select 1 from public.user_profiles profile
    where profile.id = auth.uid()
      and profile.role in ('SUPER_ADMIN', 'PANCHANGA_ADMIN')
      and profile.status = 'APPROVED'
      and profile.is_active = true
  )
);

notify pgrst, 'reload schema';
