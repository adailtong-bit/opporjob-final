DO $$
BEGIN
  -- Update Technology
  UPDATE public.categories SET 
    image_url = 'https://img.usecurling.com/p/400/300?q=technology',
    translation_key = 'category.ti'
  WHERE name ILIKE 'Technology';

  -- Update Marketing
  UPDATE public.categories SET 
    image_url = 'https://img.usecurling.com/p/400/300?q=marketing',
    translation_key = 'category.marketing'
  WHERE name ILIKE 'Marketing';

  -- Update Education
  UPDATE public.categories SET 
    image_url = 'https://img.usecurling.com/p/400/300?q=education',
    translation_key = 'category.education'
  WHERE name ILIKE 'Education';

  -- Update Services
  UPDATE public.categories SET 
    image_url = 'https://img.usecurling.com/p/400/300?q=services',
    translation_key = 'category.servicos'
  WHERE name ILIKE 'Services';

  -- Update Maintenance
  UPDATE public.categories SET 
    image_url = 'https://img.usecurling.com/p/400/300?q=maintenance',
    translation_key = 'category.maintenance'
  WHERE name ILIKE 'Maintenance';

  -- Update Electronics
  UPDATE public.categories SET 
    image_url = 'https://img.usecurling.com/p/400/300?q=electronics',
    translation_key = 'category.sales'
  WHERE name ILIKE 'Electronics';

  -- Update Furniture
  UPDATE public.categories SET 
    image_url = 'https://img.usecurling.com/p/400/300?q=furniture',
    translation_key = 'category.furniture'
  WHERE name ILIKE 'Furniture';

  -- Update Sports
  UPDATE public.categories SET 
    image_url = 'https://img.usecurling.com/p/400/300?q=sports',
    translation_key = 'category.sports'
  WHERE name ILIKE 'Sports';

  -- Update Construction
  UPDATE public.categories SET 
    image_url = 'https://img.usecurling.com/p/400/300?q=construction',
    translation_key = 'category.construction'
  WHERE name ILIKE 'Construction';

  -- Update Design
  UPDATE public.categories SET 
    image_url = 'https://img.usecurling.com/p/400/300?q=design',
    translation_key = 'category.design'
  WHERE name ILIKE 'Design';

  -- Update AI & Machine Learning
  UPDATE public.categories SET 
    image_url = 'https://img.usecurling.com/p/400/300?q=artificial%20intelligence',
    translation_key = 'category.ai_machine_learning'
  WHERE name ILIKE 'AI & Machine Learning' OR name ILIKE 'AI % Machine Learning';

  -- Update Renewable Energy
  UPDATE public.categories SET 
    image_url = 'https://img.usecurling.com/p/400/300?q=renewable%20energy',
    translation_key = 'category.renewable_energy'
  WHERE name ILIKE 'Renewable Energy';

  -- Update Produtos
  UPDATE public.categories SET 
    image_url = 'https://img.usecurling.com/p/400/300?q=products',
    translation_key = 'category.produtos'
  WHERE translation_key = 'category.produtos' OR name ILIKE 'Produtos';

  -- Update Servicos (Fallback)
  UPDATE public.categories SET 
    image_url = 'https://img.usecurling.com/p/400/300?q=services',
    translation_key = 'category.servicos'
  WHERE translation_key = 'category.servicos' OR name ILIKE 'Serviços' OR name ILIKE 'Servicos';

END $$;
