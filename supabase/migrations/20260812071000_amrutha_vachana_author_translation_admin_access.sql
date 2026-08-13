-- Read-only author translations are needed to label the admin author selector.
-- This policy is additive and does not alter existing application access.
alter table public.amrutha_vachana_author_translations enable row level security;

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
