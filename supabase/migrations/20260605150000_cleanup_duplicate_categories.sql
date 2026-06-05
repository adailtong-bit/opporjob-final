DO $$
BEGIN
  -- Create a temporary table with the rows to keep (min ID per slug to ensure consistency)
  CREATE TEMP TABLE categories_to_keep AS
  SELECT MIN(id) as id, slug
  FROM public.categories
  GROUP BY slug;

  -- Delete everything that is not in the keep list
  DELETE FROM public.categories
  WHERE id NOT IN (SELECT id FROM categories_to_keep);

  DROP TABLE categories_to_keep;
  
  -- Create a unique index on slug to prevent future duplicates
  CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_key ON public.categories (slug);
END $$;
