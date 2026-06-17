-- Update admin_get_users_with_metrics to include country
CREATE OR REPLACE FUNCTION public.admin_get_users_with_metrics()
 RETURNS TABLE(id uuid, name text, email text, role text, is_admin boolean, created_at timestamp with time zone, country text, city text, state text, status text, rating numeric, jobs_executed bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.email,
    p.role,
    p.is_admin,
    p.created_at,
    p.country,
    p.city,
    p.state,
    p.status,
    public.get_bayesian_rating(p.id) as rating,
    (SELECT count(j.id) FROM public.jobs j JOIN public.bids b ON j.accepted_bid_id = b.id WHERE b.executor_id = p.id AND j.status = 'completed')::bigint as jobs_executed
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$function$;

-- Update admin_get_jobs_with_metrics to include location
CREATE OR REPLACE FUNCTION public.admin_get_jobs_with_metrics()
 RETURNS TABLE(id uuid, title text, description text, category text, budget numeric, status text, created_at timestamp with time zone, owner_id uuid, owner_name text, owner_rating numeric, location text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT 
    j.id,
    j.title,
    j.description,
    j.category,
    j.budget,
    j.status,
    j.created_at,
    j.owner_id,
    COALESCE(p.name, 'Unknown') as owner_name,
    public.get_bayesian_rating(j.owner_id) as owner_rating,
    j.location
  FROM public.jobs j
  LEFT JOIN public.profiles p ON j.owner_id = p.id
  ORDER BY j.created_at DESC;
END;
$function$;
