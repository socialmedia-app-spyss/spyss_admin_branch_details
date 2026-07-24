-- Prevent duplicate Panchanga entries for the same date and language,
-- including writes made outside the admin table.
create unique index if not exists uq_daily_panchanga_date_language
  on public.daily_panchanga (panchanga_date, language);
