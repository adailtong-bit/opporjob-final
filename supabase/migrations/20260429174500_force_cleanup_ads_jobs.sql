-- Force cleanup of any test data in hypothetical jobs/ads tables if they exist
DO $cleanup$
BEGIN
  -- We use dynamic SQL to avoid errors if the tables don't exist
  
  -- Clean jobs table if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'jobs') THEN
    EXECUTE 'DELETE FROM public.jobs WHERE title ILIKE ''%test%'' OR title ILIKE ''%demo%'' OR title ILIKE ''%fictício%'' OR title ILIKE ''%ficticio%'' OR title ILIKE ''%mock%''';
    EXECUTE 'DELETE FROM public.jobs WHERE description ILIKE ''%test%'' OR description ILIKE ''%lorem%''';
  END IF;

  -- Clean ads table if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ads') THEN
    EXECUTE 'DELETE FROM public.ads WHERE title ILIKE ''%test%'' OR title ILIKE ''%demo%'' OR title ILIKE ''%fictício%'' OR title ILIKE ''%ficticio%'' OR title ILIKE ''%mock%''';
  END IF;

EXCEPTION WHEN OTHERS THEN
  -- Ignore if error
END $cleanup$;
