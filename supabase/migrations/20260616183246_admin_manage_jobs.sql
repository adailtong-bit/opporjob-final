-- Fix policies to hide suspended jobs from non-admins and non-owners
DROP POLICY IF EXISTS "public_read_jobs" ON public.jobs;
CREATE POLICY "public_read_jobs" ON public.jobs
  FOR SELECT TO public
  USING (
    status != 'suspended' OR 
    auth.uid() = owner_id OR 
    public.is_admin()
  );

DROP POLICY IF EXISTS "auth_insert_jobs" ON public.jobs;
CREATE POLICY "auth_insert_jobs" ON public.jobs
  FOR INSERT TO public
  WITH CHECK (
    auth.uid() = owner_id OR 
    owner_id IS NULL OR 
    public.is_admin()
  );

-- Create RPC to fetch jobs with user metrics for the admin panel
CREATE OR REPLACE FUNCTION public.admin_get_jobs_with_metrics()
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  category text,
  budget numeric,
  status text,
  created_at timestamp with time zone,
  owner_id uuid,
  owner_name text,
  owner_rating numeric
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
    j.id,
    j.title,
    j.description,
    j.category,
    j.budget,
    j.status,
    j.created_at,
    j.owner_id,
    COALESCE(p.name, 'Unknown') as owner_name,
    public.get_bayesian_rating(j.owner_id) as owner_rating
  FROM public.jobs j
  LEFT JOIN public.profiles p ON j.owner_id = p.id
  ORDER BY j.created_at DESC;
END;
$function$;

-- Insert seed data to test the new list view
DO $DO_BLOCK$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
  
  IF admin_id IS NOT NULL THEN
    INSERT INTO public.jobs (id, title, description, category, budget, status, owner_id, owner_name)
    VALUES 
      ('3a4b5c6d-1234-5678-9abc-def012345678'::uuid, 'Admin Seed Job 1', 'Description for seed job 1', 'Development', 500, 'open', admin_id, 'Admin'),
      ('3a4b5c6d-1234-5678-9abc-def012345679'::uuid, 'Admin Seed Job 2', 'Description for seed job 2', 'Design', 1200, 'in_progress', admin_id, 'Admin'),
      ('3a4b5c6d-1234-5678-9abc-def012345670'::uuid, 'Admin Seed Job 3', 'Description for seed job 3', 'Marketing', 300, 'suspended', admin_id, 'Admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END;
$DO_BLOCK$;
