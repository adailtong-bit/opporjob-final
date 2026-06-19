DO $$
BEGIN
  -- Update all demo jobs to have 'completed' status to reflect they are closed/illustrative
  UPDATE public.jobs
  SET status = 'completed'
  WHERE is_demo = true AND status != 'completed';
END $$;
