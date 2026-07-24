-- Keep the database role constraint aligned with the roles supported by the admin app.
alter table public.user_profiles
  drop constraint if exists chk_user_profiles_role;

alter table public.user_profiles
  add constraint chk_user_profiles_role
  check (
    role in (
      'SUPER_ADMIN',
      'STATE_ADMIN',
      'DISTRICT_ADMIN',
      'VALAYA_ADMIN',
      'BRANCH_ADMIN',
      'PANCHANGA_ADMIN',
      'USER'
    )
  );
