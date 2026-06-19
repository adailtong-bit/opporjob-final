DO $$
BEGIN
  -- Add admin ALL policy to jobs if not exists for robust bulk operations
  DROP POLICY IF EXISTS "admin_all_jobs" ON public.jobs;
  CREATE POLICY "admin_all_jobs" ON public.jobs
    FOR ALL TO authenticated USING (public.is_admin());
END $$;
