DO $$
BEGIN
  -- Transition all demo jobs to completed status to ensure data consistency
  UPDATE public.jobs
  SET status = 'completed'
  WHERE is_demo = true AND status != 'completed';
END $$;
