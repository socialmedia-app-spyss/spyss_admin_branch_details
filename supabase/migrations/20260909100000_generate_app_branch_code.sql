-- Synchronize the authoritative counters with any branch codes created before
-- this generator existed. This also seeds districts missing from the table.
insert into public.master_branch_running_numbers (
  state_code,
  district_code,
  last_running_number,
  updated_at
)
select
  split_part(branch_code, '-', 2),
  split_part(branch_code, '-', 3),
  max((substring(branch_code from '([0-9]+)$'))::bigint),
  now()
from public.app_branches
where branch_code ~ '^SPYSS-[^-]+-[^-]+-[0-9]+$'
group by 1, 2
on conflict (state_code, district_code) do update
set last_running_number = greatest(
      public.master_branch_running_numbers.last_running_number,
      excluded.last_running_number
    ),
    updated_at = now();

-- Generate branch codes centrally so all clients use the same, race-safe format.
create or replace function public.generate_app_branch_code()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  resolved_state_code text;
  resolved_district_code text;
  code_prefix text;
  next_sequence bigint;
begin
  if nullif(btrim(new.branch_code), '') is not null then
    return new;
  end if;

  select upper(state.state_code), upper(district.district_code)
  into resolved_state_code, resolved_district_code
  from public.master_states state
  join public.master_districts district
    on district.id = new.district_id
   and district.state_id = state.id
  where state.id = new.state_id;

  if resolved_state_code is null or resolved_district_code is null then
    raise exception 'Cannot generate branch code: state or district code is missing'
      using errcode = '23502';
  end if;

  code_prefix := format(
    'SPYSS-%s-%s-',
    resolved_state_code,
    resolved_district_code
  );

  -- The unique state/district key makes this a single atomic allocation even
  -- when multiple admins create branches concurrently.
  insert into public.master_branch_running_numbers (
    state_code,
    district_code,
    last_running_number,
    updated_at
  )
  values (
    resolved_state_code,
    resolved_district_code,
    1,
    now()
  )
  on conflict (state_code, district_code) do update
  set last_running_number =
        public.master_branch_running_numbers.last_running_number + 1,
      updated_at = now()
  returning last_running_number into next_sequence;

  new.branch_code := code_prefix || lpad(next_sequence::text, 4, '0');
  return new;
end;
$$;

drop trigger if exists trg_generate_app_branch_code on public.app_branches;
create trigger trg_generate_app_branch_code
before insert on public.app_branches
for each row
execute function public.generate_app_branch_code();

notify pgrst, 'reload schema';
