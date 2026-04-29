-- Cleanup test data from production

DO $cleanup$
BEGIN
  -- Delete test users
  DELETE FROM auth.users 
  WHERE email != 'adailtong@gmail.com' 
    AND (email ILIKE '%test%' OR email ILIKE '%demo%' OR email ILIKE '%ficticio%');

  -- Delete test projects
  DELETE FROM public.projects 
  WHERE name ILIKE '%test%' 
     OR name ILIKE '%demo%' 
     OR name ILIKE '%fictício%' 
     OR name ILIKE '%ficticio%'
     OR description ILIKE '%test%';

  -- Delete test materials
  DELETE FROM public.materials 
  WHERE name ILIKE '%test%' 
     OR name ILIKE '%demo%' 
     OR name ILIKE '%fictício%';

  -- Delete test equipment
  DELETE FROM public.equipment 
  WHERE name ILIKE '%test%' 
     OR name ILIKE '%demo%' 
     OR name ILIKE '%fictício%';

EXCEPTION WHEN OTHERS THEN
  -- Ignore if error
END $cleanup$;
