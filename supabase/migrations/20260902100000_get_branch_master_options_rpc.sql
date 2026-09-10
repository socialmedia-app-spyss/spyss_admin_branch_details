-- Single RPC function to fetch all active master options in one network round-trip.
create or replace function public.get_branch_master_options()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'categories', coalesce((select jsonb_agg(c order by c.display_order) from public.master_categories c where c.is_active = true), '[]'::jsonb),
    'batches', coalesce((select jsonb_agg(b order by b.display_order) from public.master_batches b where b.is_active = true), '[]'::jsonb),
    'countries', coalesce((select jsonb_agg(co order by co.display_order) from public.master_countries co where co.is_active = true), '[]'::jsonb),
    'states', coalesce((select jsonb_agg(s order by s.display_order) from public.master_states s where s.is_active = true), '[]'::jsonb),
    'districts', coalesce((select jsonb_agg(d order by d.display_order) from public.master_districts d where d.is_active = true), '[]'::jsonb),
    'valayas', coalesce((select jsonb_agg(v order by v.display_order) from public.master_valayas v where v.is_active = true), '[]'::jsonb),
    'regions', coalesce((select jsonb_agg(r order by r.display_order) from public.master_regions r where r.is_active = true), '[]'::jsonb),
    'statuses', coalesce((select jsonb_agg(st order by st.display_order) from public.master_branch_statuses st where st.is_active = true), '[]'::jsonb),
    'mediums', coalesce((select jsonb_agg(m order by m.display_order) from public.master_mediums m where m.is_active = true), '[]'::jsonb)
  );
$$;

grant execute on function public.get_branch_master_options() to authenticated, anon;
