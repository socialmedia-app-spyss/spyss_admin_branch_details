-- 1. Enable Row Level Security on app_carousel
alter table public.app_carousel enable row level security;

-- 2. Grant table permissions to authenticated, service_role, and anon
grant all on table public.app_carousel to authenticated;
grant all on table public.app_carousel to service_role;
grant select on table public.app_carousel to anon;

-- 3. Drop existing policies cleanly without DO blocks to avoid dollar-quote parsing issues
drop policy if exists app_carousel_super_admin_all on public.app_carousel;
drop policy if exists app_carousel_admin_all on public.app_carousel;
drop policy if exists app_carousel_admin_select on public.app_carousel;
drop policy if exists app_carousel_admin_insert on public.app_carousel;
drop policy if exists app_carousel_admin_update on public.app_carousel;
drop policy if exists app_carousel_admin_delete on public.app_carousel;
drop policy if exists app_carousel_public_read on public.app_carousel;

-- 4. Super Admin Policy: full CRUD strictly for approved, active SUPER_ADMIN
create policy app_carousel_super_admin_all
on public.app_carousel for all to authenticated
using (
  exists (
    select 1 from public.user_profiles profile
    where profile.id = auth.uid()
      and upper(trim(profile.role)) = 'SUPER_ADMIN'
      and (profile.status is null or upper(trim(profile.status)) in ('APPROVED', 'ACTIVE'))
      and (profile.is_active is null or profile.is_active = true)
  )
)
with check (
  exists (
    select 1 from public.user_profiles profile
    where profile.id = auth.uid()
      and upper(trim(profile.role)) = 'SUPER_ADMIN'
      and (profile.status is null or upper(trim(profile.status)) in ('APPROVED', 'ACTIVE'))
      and (profile.is_active is null or profile.is_active = true)
  )
);

-- 5. Public / Mobile App Policy: read-only access for active & scheduled banners
create policy app_carousel_public_read
on public.app_carousel for select to anon, authenticated
using (
  is_active is true
  and (start_at is null or start_at <= now())
  and (end_at is null or end_at > now())
);

-- 6. Reload schema cache
notify pgrst, 'reload schema';
