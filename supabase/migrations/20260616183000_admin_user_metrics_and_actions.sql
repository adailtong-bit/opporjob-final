DO $$
BEGIN
  -- Ensures idempotency for generic statements
END $$;

-- Function to get users with metrics (rating and completed jobs count)
CREATE OR REPLACE FUNCTION public.admin_get_users_with_metrics()
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  role text,
  is_admin boolean,
  created_at timestamptz,
  city text,
  state text,
  status text,
  rating numeric,
  jobs_executed bigint
)
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
    p.city,
    p.state,
    p.status,
    public.get_bayesian_rating(p.id) as rating,
    (SELECT count(j.id) FROM public.jobs j JOIN public.bids b ON j.accepted_bid_id = b.id WHERE b.executor_id = p.id AND j.status = 'completed')::bigint as jobs_executed
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$function$;

-- Function to delete user from auth.users (cascades to profiles and others)
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  DELETE FROM auth.users WHERE id = target_user_id;
END;
$function$;
