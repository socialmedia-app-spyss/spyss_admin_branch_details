-- Keep Country -> State -> District relationships consistent for branches.

-- Ensure the master state-country relationship exists in environments where the
-- dashboard SQL was not applied manually.
alter table public.master_states
  add column if not exists country_id uuid;

update public.master_states state
set country_id = country.id
from public.master_countries country
where state.country_id is null
  and upper(country.country_code) in ('IN', 'IND');

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.master_states'::regclass
      and conname = 'master_states_country_id_fkey'
  ) then
    alter table public.master_states
      add constraint master_states_country_id_fkey
      foreign key (country_id)
      references public.master_countries(id)
      on update cascade
      on delete restrict;
  end if;
end
$$;

alter table public.master_states
  alter column country_id set not null;

create index if not exists idx_master_states_country_id
  on public.master_states(country_id);

-- PostgreSQL requires unique referenced column pairs for composite foreign keys.
create unique index if not exists uq_master_states_id_country_id
  on public.master_states(id, country_id);

create unique index if not exists uq_master_districts_id_state_id
  on public.master_districts(id, state_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.latest_branches'::regclass
      and conname = 'latest_branches_state_country_consistency_fkey'
  ) then
    alter table public.latest_branches
      add constraint latest_branches_state_country_consistency_fkey
      foreign key (state_id, country_id)
      references public.master_states(id, country_id)
      on update cascade
      on delete restrict
      not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.latest_branches'::regclass
      and conname = 'latest_branches_district_state_consistency_fkey'
  ) then
    alter table public.latest_branches
      add constraint latest_branches_district_state_consistency_fkey
      foreign key (district_id, state_id)
      references public.master_districts(id, state_id)
      on update cascade
      on delete restrict
      not valid;
  end if;
end
$$;

notify pgrst, 'reload schema';
