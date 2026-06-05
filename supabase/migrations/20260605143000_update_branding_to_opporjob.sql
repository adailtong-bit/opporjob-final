DO $$
BEGIN
  -- Update marketing_content
  UPDATE public.marketing_content
  SET title = REGEXP_REPLACE(title, 'BIDWORK', 'OPPORJOB', 'ig'),
      subtitle = REGEXP_REPLACE(subtitle, 'BIDWORK', 'OPPORJOB', 'ig'),
      features = (REGEXP_REPLACE(features::text, 'BIDWORK', 'OPPORJOB', 'ig'))::jsonb
  WHERE title ILIKE '%BIDWORK%' OR subtitle ILIKE '%BIDWORK%' OR features::text ILIKE '%BIDWORK%';

  -- Update site_settings
  UPDATE public.site_settings
  SET value = (REGEXP_REPLACE(value::text, 'BIDWORK', 'OPPORJOB', 'ig'))::jsonb
  WHERE value::text ILIKE '%BIDWORK%';

  -- Update jobs
  UPDATE public.jobs
  SET description = REGEXP_REPLACE(description, 'BIDWORK', 'OPPORJOB', 'ig'),
      title = REGEXP_REPLACE(title, 'BIDWORK', 'OPPORJOB', 'ig')
  WHERE description ILIKE '%BIDWORK%' OR title ILIKE '%BIDWORK%';

  -- Update invoices
  UPDATE public.invoices
  SET description = REGEXP_REPLACE(description, 'BIDWORK', 'OPPORJOB', 'ig')
  WHERE description ILIKE '%BIDWORK%';
END $$;
