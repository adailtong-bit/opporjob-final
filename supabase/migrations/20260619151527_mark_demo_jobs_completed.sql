DO $$
BEGIN
  -- Update jobs explicitly flagged as demo to be 'completed'
  UPDATE public.jobs
  SET status = 'completed'
  WHERE is_demo = true AND status != 'completed';

  -- Catch the 88 marketing demonstration ads (e.g. 'Marketing Service - Ref 766') 
  -- ensuring they are correctly flagged as demo and completed.
  UPDATE public.jobs
  SET status = 'completed', is_demo = true
  WHERE (title ILIKE '%Ref %' OR title ILIKE '%Marketing Service%') AND (status != 'completed' OR is_demo = false);
END $$;
