-- Panchanga admins manage a global resource and therefore have no geographic scope.
-- Preserve the existing scope rules for every other role.
do $$
declare
  existing_scope_rule text;
begin
  select pg_get_expr(constraint_definition.conbin, constraint_definition.conrelid)
    into existing_scope_rule
  from pg_constraint constraint_definition
  where constraint_definition.conrelid = 'public.user_profiles'::regclass
    and constraint_definition.conname = 'chk_user_profiles_role_scope';

  if existing_scope_rule is null then
    raise exception 'Constraint chk_user_profiles_role_scope was not found';
  end if;

  alter table public.user_profiles
    drop constraint chk_user_profiles_role_scope;

  execute format(
    'alter table public.user_profiles
       add constraint chk_user_profiles_role_scope
       check (
         (
           role = ''PANCHANGA_ADMIN''
           and state_id is null
           and district_id is null
           and valaya_id is null
           and branch_id is null
         )
         or (%s)
       )',
    existing_scope_rule
  );
end
$$;
