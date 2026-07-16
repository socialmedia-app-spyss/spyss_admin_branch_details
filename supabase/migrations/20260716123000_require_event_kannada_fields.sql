-- Kannada content is required wherever the corresponding English event field is required.
-- NOT VALID preserves legacy rows, while PostgreSQL still enforces these checks for new or updated rows.
alter table public.events
  add constraint events_event_name_kn_required
    check (event_name_kn is not null and btrim(event_name_kn) <> '') not valid,
  add constraint events_short_description_kn_required
    check (short_description_kn is not null and btrim(short_description_kn) <> '') not valid,
  add constraint events_full_description_kn_required
    check (full_description_kn is not null and btrim(full_description_kn) <> '') not valid,
  add constraint events_location_kn_required
    check (location_kn is not null and btrim(location_kn) <> '') not valid;
