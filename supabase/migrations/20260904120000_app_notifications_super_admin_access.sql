-- Allow approved, active super administrators to manage app notifications.
alter table public.app_notifications enable row level security;

grant select, insert, update, delete on table public.app_notifications to authenticated;

drop policy if exists app_notifications_super_admin_all on public.app_notifications;
create policy app_notifications_super_admin_all
on public.app_notifications for all to authenticated
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

notify pgrst, 'reload schema';
