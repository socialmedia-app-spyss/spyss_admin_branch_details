-- Create a pending USER profile whenever Supabase Auth creates a user.
-- Signup often has no authenticated session while email confirmation is
-- pending, so profile creation must not depend on a browser INSERT/RLS policy.
create or replace function public.create_user_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_name text;
begin
  profile_name := nullif(btrim(new.raw_user_meta_data ->> 'full_name'), '');
  if profile_name is null then
    profile_name := coalesce(nullif(split_part(new.email, '@', 1), ''), 'New user');
  end if;

  insert into public.user_profiles (id, full_name, email, phone_number, role, status, is_active)
  values (
    new.id,
    left(profile_name, 150),
    new.email,
    new.phone,
    'USER',
    'PENDING',
    true
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.create_user_profile_for_auth_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.create_user_profile_for_auth_user();

-- Backfill Auth users who were already created before the trigger was installed.
insert into public.user_profiles (id, full_name, email, phone_number, role, status, is_active)
select
  auth_user.id,
  left(
    coalesce(
      nullif(btrim(auth_user.raw_user_meta_data ->> 'full_name'), ''),
      nullif(split_part(auth_user.email, '@', 1), ''),
      'New user'
    ),
    150
  ),
  auth_user.email,
  auth_user.phone,
  'USER',
  'PENDING',
  true
from auth.users as auth_user
where auth_user.email is not null
  and not exists (
    select 1
    from public.user_profiles as profile
    where profile.id = auth_user.id
  )
on conflict (id) do nothing;
