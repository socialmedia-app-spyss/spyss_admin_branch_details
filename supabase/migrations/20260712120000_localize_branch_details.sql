begin;

alter table public.latest_branches rename column mukhyashikshak to mukhyashikshak_en;

alter table public.latest_branches add column mukhyashikshak_kn text;

-- Existing rows retain their current English values and must be translated on
-- their next edit. New and updated rows require all bilingual values.
alter table public.latest_branches
  add constraint branches_bilingual_details_required check (
    nullif(btrim(branch_name_en), '') is not null
    and nullif(btrim(branch_name_kn), '') is not null
    and nullif(btrim(full_address_en), '') is not null
    and nullif(btrim(full_address_kn), '') is not null
    and nullif(btrim(area_en), '') is not null
    and nullif(btrim(area_kn), '') is not null
    and nullif(btrim(mukhyashikshak_en), '') is not null
    and nullif(btrim(mukhyashikshak_kn), '') is not null
  ) not valid;

commit;
