ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url TEXT;

INSERT INTO public.categories (id, name, slug, type, translation_key, image_url)
VALUES 
  ('1', 'Renovations', 'renovations', 'job', 'category.reform', 'https://img.usecurling.com/p/400/300?q=home%20renovation'),
  ('2', 'Construction', 'construction', 'job', 'category.construction', 'https://img.usecurling.com/p/400/300?q=construction%20site'),
  ('3', 'IT & Programming', 'it-programming', 'job', 'category.ti', 'https://img.usecurling.com/p/400/300?q=programming%20code'),
  ('4', 'Design', 'design', 'job', 'category.design', 'https://img.usecurling.com/p/400/300?q=web%20design'),
  ('5', 'Marketing', 'marketing', 'job', 'category.marketing', 'https://img.usecurling.com/p/400/300?q=digital%20marketing'),
  ('6', 'Sales & Products', 'sales-products', 'marketplace', 'category.sales', 'https://img.usecurling.com/p/400/300?q=retail%20products'),
  ('7', 'Rentals', 'rentals', 'rental', 'category.rental', 'https://img.usecurling.com/p/400/300?q=equipment%20rental'),
  ('8', 'Donation', 'donation', 'donation', 'category.donation', 'https://img.usecurling.com/p/400/300?q=charity%20donation'),
  ('9', 'Home Services', 'home-services', 'job', 'category.home_services', 'https://img.usecurling.com/p/400/300?q=home%20services'),
  ('10', 'Auto Services', 'auto-services', 'job', 'category.auto_services', 'https://img.usecurling.com/p/400/300?q=auto%20repair'),
  ('11', 'Professional & Personal Services', 'professional-personal-services', 'job', 'category.prof_personal', 'https://img.usecurling.com/p/400/300?q=professional%20services')
ON CONFLICT (id) DO UPDATE SET image_url = EXCLUDED.image_url;
