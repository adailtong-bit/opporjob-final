-- 1. Data Cleanup for "Equipe Corporativa" / Mock data
-- Safely delete profiles and auth.users that might belong to the mock "Corporate Team"
DO $$
BEGIN
  -- We delete profiles explicitly named "Equipe Corporativa" or with emails indicating corporate test
  -- Deleting from auth.users cascades to profiles if foreign keys are set correctly
  DELETE FROM auth.users WHERE email LIKE '%equipecorporativa%' OR email LIKE '%corporate_team%';
  DELETE FROM public.profiles WHERE name ILIKE '%Equipe Corporativa%';
END $$;

-- 2. Create project_stages table
CREATE TABLE IF NOT EXISTS public.project_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fix RLS on project_stages
ALTER TABLE public.project_stages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_read_project_stages" ON public.project_stages;
CREATE POLICY "auth_read_project_stages" ON public.project_stages
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "auth_write_project_stages" ON public.project_stages;
CREATE POLICY "auth_write_project_stages" ON public.project_stages
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid()) 
    OR EXISTS (SELECT 1 FROM public.project_partners pp JOIN public.vendors v ON pp.vendor_id = v.id WHERE pp.project_id = project_stages.project_id AND v.owner_id = auth.uid())
  );

-- Fix RLS on project_partners
DROP POLICY IF EXISTS "auth_update_project_partners" ON public.project_partners;
CREATE POLICY "auth_update_project_partners" ON public.project_partners
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid()) 
    OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.owner_id = auth.uid())
  );

-- Fix RLS on project_partners insert
DROP POLICY IF EXISTS "auth_insert_project_partners" ON public.project_partners;
CREATE POLICY "auth_insert_project_partners" ON public.project_partners
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())
  );
