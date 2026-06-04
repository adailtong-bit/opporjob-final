-- Ensure idempotency
DO $$
BEGIN

  -- 1. Fix projects RLS
  DROP POLICY IF EXISTS "projects_select" ON public.projects;
  CREATE POLICY "projects_select" ON public.projects
    FOR SELECT TO authenticated
    USING (
      auth.uid() = owner_id 
      OR is_admin() 
      OR EXISTS (
        SELECT 1 FROM public.project_partners pp
        JOIN public.vendors v ON pp.vendor_id = v.id
        WHERE pp.project_id = projects.id AND v.owner_id = auth.uid()
      )
    );

  -- 2. Fix project_updates RLS
  DROP POLICY IF EXISTS "auth_read_project_updates" ON public.project_updates;
  DROP POLICY IF EXISTS "auth_select_project_updates" ON public.project_updates;
  CREATE POLICY "auth_select_project_updates" ON public.project_updates
    FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_updates.project_id AND (
          p.owner_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.project_partners pp
            JOIN public.vendors v ON pp.vendor_id = v.id
            WHERE pp.project_id = p.id AND v.owner_id = auth.uid()
          )
        )
      )
      OR is_admin()
    );

  -- 3. Data Cleanup for Privacy
  DELETE FROM public.profiles WHERE name = 'Equipe Corporativa';

END $$;
