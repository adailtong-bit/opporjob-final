-- Update all existing demo jobs to have 'completed' status
DO $$
BEGIN
  UPDATE public.jobs
  SET status = 'completed'
  WHERE is_demo = true AND status != 'completed';
END $$;

-- Create a trigger to ensure all future demo jobs are created with 'completed' status
CREATE OR REPLACE FUNCTION public.set_demo_jobs_completed()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_demo = true THEN
    NEW.status := 'completed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_demo_jobs_completed ON public.jobs;
CREATE TRIGGER ensure_demo_jobs_completed
  BEFORE INSERT ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_demo_jobs_completed();
