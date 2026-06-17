DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed the admin user idempotently
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin User", "role": "admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, is_admin, role, country, state, city)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Admin User', true, 'admin', 'US', 'NY', 'New York')
    ON CONFLICT (id) DO UPDATE 
    SET is_admin = true, role = 'admin', country = 'US', state = 'NY', city = 'New York';
  ELSE
    UPDATE public.profiles 
    SET is_admin = true, role = 'admin'
    WHERE email = 'adailtong@gmail.com';
  END IF;
END $$;

DROP FUNCTION IF EXISTS public.admin_get_users_with_metrics();
CREATE OR REPLACE FUNCTION public.admin_get_users_with_metrics()
 RETURNS TABLE(id uuid, name text, email text, role text, is_admin boolean, created_at timestamp with time zone, city text, state text, country text, status text, rating numeric, jobs_executed bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
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
    p.country,
    p.status,
    public.get_bayesian_rating(p.id) as rating,
    (SELECT count(j.id) FROM public.jobs j JOIN public.bids b ON j.accepted_bid_id = b.id WHERE b.executor_id = p.id AND j.status = 'completed')::bigint as jobs_executed
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$;

DROP FUNCTION IF EXISTS public.admin_get_jobs_with_metrics();
CREATE OR REPLACE FUNCTION public.admin_get_jobs_with_metrics()
 RETURNS TABLE(id uuid, title text, description text, category text, budget numeric, status text, created_at timestamp with time zone, owner_id uuid, owner_name text, owner_rating numeric, location text, city text, state text, country text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
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
    j.location,
    p.city,
    p.state,
    p.country
  FROM public.jobs j
  LEFT JOIN public.profiles p ON j.owner_id = p.id
  ORDER BY j.created_at DESC;
END;
$;
