-- Restore branch-management writes for approved administrators.
alter table public.app_branches enable row level security;

grant select, insert, update, delete on table public.app_branches to authenticated;

drop policy if exists app_branches_super_admin_all on public.app_branches;
drop policy if exists app_branches_valaya_admin_select on public.app_branches;
drop policy if exists app_branches_valaya_admin_insert on public.app_branches;
drop policy if exists app_branches_valaya_admin_update on public.app_branches;

create policy app_branches_super_admin_all
on public.app_branches for all to authenticated
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

-- A Valaya can have one master row per district. Match by valaya_code so a
-- Valaya Admin can manage every branch within their complete Valaya scope.
create policy app_branches_valaya_admin_select
on public.app_branches for select to authenticated
using (
  exists (
    select 1
    from public.user_profiles profile
    join public.master_valayas assigned_valaya on assigned_valaya.id = profile.valaya_id
    join public.master_valayas branch_valaya on branch_valaya.id = app_branches.valaya_id
    where profile.id = auth.uid()
      and profile.role = 'VALAYA_ADMIN'
      and profile.status = 'APPROVED'
      and profile.is_active = true
      and assigned_valaya.valaya_code = branch_valaya.valaya_code
  )
);

create policy app_branches_valaya_admin_insert
on public.app_branches for insert to authenticated
with check (
  exists (
    select 1
    from public.user_profiles profile
    join public.master_valayas assigned_valaya on assigned_valaya.id = profile.valaya_id
    join public.master_valayas branch_valaya on branch_valaya.id = app_branches.valaya_id
    where profile.id = auth.uid()
      and profile.role = 'VALAYA_ADMIN'
      and profile.status = 'APPROVED'
      and profile.is_active = true
      and assigned_valaya.valaya_code = branch_valaya.valaya_code
  )
);

create policy app_branches_valaya_admin_update
on public.app_branches for update to authenticated
using (
  exists (
    select 1
    from public.user_profiles profile
    join public.master_valayas assigned_valaya on assigned_valaya.id = profile.valaya_id
    join public.master_valayas branch_valaya on branch_valaya.id = app_branches.valaya_id
    where profile.id = auth.uid()
      and profile.role = 'VALAYA_ADMIN'
      and profile.status = 'APPROVED'
      and profile.is_active = true
      and assigned_valaya.valaya_code = branch_valaya.valaya_code
  )
)
with check (
  exists (
    select 1
    from public.user_profiles profile
    join public.master_valayas assigned_valaya on assigned_valaya.id = profile.valaya_id
    join public.master_valayas branch_valaya on branch_valaya.id = app_branches.valaya_id
    where profile.id = auth.uid()
      and profile.role = 'VALAYA_ADMIN'
      and profile.status = 'APPROVED'
      and profile.is_active = true
      and assigned_valaya.valaya_code = branch_valaya.valaya_code
  )
);

notify pgrst, 'reload schema';
