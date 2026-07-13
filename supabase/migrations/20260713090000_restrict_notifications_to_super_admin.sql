-- Notifications are administered only by approved, active super admins.
-- The service role continues to bypass RLS for trusted server-side jobs/triggers.
alter table public.notifications enable row level security;

drop policy if exists notifications_super_admin_all on public.notifications;

create policy notifications_super_admin_all
on public.notifications
for all
to authenticated
using (
  exists (
    select 1
    from public.user_profiles profile
    where profile.id = auth.uid()
      and profile.role = 'SUPER_ADMIN'
      and profile.status = 'APPROVED'
      and profile.is_active = true
  )
)
with check (
  exists (
    select 1
    from public.user_profiles profile
    where profile.id = auth.uid()
      and profile.role = 'SUPER_ADMIN'
      and profile.status = 'APPROVED'
      and profile.is_active = true
  )
);
