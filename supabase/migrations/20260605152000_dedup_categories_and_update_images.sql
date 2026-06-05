DO $$
DECLARE
  dup_record RECORD;
  first_id TEXT;
BEGIN
  -- Insert/Update core categories with representative images
  INSERT INTO public.categories (id, name, slug, type, translation_key, image_url) VALUES
  ('cat-marketing', 'Marketing', 'marketing', 'job', 'category.marketing', 'https://img.usecurling.com/p/600/400?q=digital%20marketing&dpr=2'),
  ('cat-sales', 'Sales & Products', 'sales-products', 'marketplace', 'category.sales', 'https://img.usecurling.com/p/600/400?q=business%20sales&dpr=2'),
  ('cat-services', 'Professional Services', 'professional-personal-services', 'job', 'category.prof_personal', 'https://img.usecurling.com/p/600/400?q=professional%20services&dpr=2'),
  ('cat-tech', 'IT & Programming', 'it-programming', 'job', 'category.ti', 'https://img.usecurling.com/p/600/400?q=software%20technology&dpr=2'),
  ('cat-construction', 'Construction', 'construction', 'job', 'category.construction', 'https://img.usecurling.com/p/600/400?q=construction%20site&dpr=2'),
  ('cat-maintenance', 'Maintenance', 'maintenance', 'job', 'category.maintenance', 'https://img.usecurling.com/p/600/400?q=building%20maintenance&dpr=2')
  ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    type = EXCLUDED.type,
    translation_key = EXCLUDED.translation_key,
    image_url = EXCLUDED.image_url;

  -- Deduplicate by translation_key
  FOR dup_record IN 
    SELECT translation_key, COUNT(*) as cnt 
    FROM public.categories 
    WHERE translation_key IS NOT NULL AND translation_key != ''
    GROUP BY translation_key 
    HAVING COUNT(*) > 1
  LOOP
    SELECT id INTO first_id 
    FROM public.categories 
    WHERE translation_key = dup_record.translation_key 
    -- Prefer the static 'cat-%' ids if they exist
    ORDER BY CASE WHEN id LIKE 'cat-%' THEN 0 ELSE 1 END, created_at ASC 
    LIMIT 1;

    -- Update subcategories to point to the surviving category
    UPDATE public.subcategories 
    SET category_id = first_id 
    WHERE category_id IN (
      SELECT id FROM public.categories 
      WHERE translation_key = dup_record.translation_key AND id != first_id
    );

    -- Delete duplicates
    DELETE FROM public.categories 
    WHERE translation_key = dup_record.translation_key AND id != first_id;
  END LOOP;

  -- Deduplicate by name (case insensitive)
  FOR dup_record IN 
    SELECT lower(name) as lname, COUNT(*) as cnt 
    FROM public.categories 
    GROUP BY lower(name) 
    HAVING COUNT(*) > 1
  LOOP
    SELECT id INTO first_id 
    FROM public.categories 
    WHERE lower(name) = dup_record.lname 
    ORDER BY CASE WHEN id LIKE 'cat-%' THEN 0 ELSE 1 END, created_at ASC 
    LIMIT 1;

    UPDATE public.subcategories 
    SET category_id = first_id 
    WHERE category_id IN (
      SELECT id FROM public.categories 
      WHERE lower(name) = dup_record.lname AND id != first_id
    );

    DELETE FROM public.categories 
    WHERE lower(name) = dup_record.lname AND id != first_id;
  END LOOP;
  
  -- Enhance any other remaining categories with generic but nice imagery replacing 'keyboard'
  UPDATE public.categories SET image_url = 'https://img.usecurling.com/p/600/400?q=modern%20design&dpr=2' WHERE image_url IS NULL OR image_url = '' OR image_url ILIKE '%keyboard%';

END $$;
