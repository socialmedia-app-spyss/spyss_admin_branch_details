-- Give Netravathi Valaya administrative scope over Kasaragod, Kerala.
-- The composite key is also required before an app_branches row can use this
-- valaya/district combination.
insert into public.master_valaya_districts (valaya_id, district_id, is_active)
select v.id, d.id, true
from public.master_valayas v
join public.master_districts d
  on d.district_code = 'KSD'
join public.master_states s
  on s.id = d.state_id
where s.state_code = 'KL'
  and (
    v.valaya_code ilike 'NETHRAVATHI'
    or v.valaya_name ->> 'en' ilike 'Nethravathi'
  )
on conflict (valaya_id, district_id) do update
set is_active = true;

notify pgrst, 'reload schema';
