-- Events are administered only by approved, active super admins.
-- The service role continues to bypass RLS for trusted server-side jobs/triggers.
alter table public.events enable row level security;

-- Remove any older event policies so they cannot continue granting access to other roles.
do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'events'
  loop
    execute format('drop policy if exists %I on public.events', existing_policy.policyname);
  end loop;
end
$$;

create policy events_super_admin_all
on public.events
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
