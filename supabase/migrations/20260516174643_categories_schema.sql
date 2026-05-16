CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'job',
  translation_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subcategories (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  translation_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_categories" ON public.categories;
CREATE POLICY "public_read_categories" ON public.categories FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "admin_all_categories" ON public.categories;
CREATE POLICY "admin_all_categories" ON public.categories FOR ALL TO authenticated USING (is_admin() = true);

DROP POLICY IF EXISTS "public_read_subcategories" ON public.subcategories;
CREATE POLICY "public_read_subcategories" ON public.subcategories FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "admin_all_subcategories" ON public.subcategories;
CREATE POLICY "admin_all_subcategories" ON public.subcategories FOR ALL TO authenticated USING (is_admin() = true);

DO $$
BEGIN
  -- Category: Renovations
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE id = '1') THEN
    INSERT INTO public.categories (id, name, slug, type, translation_key) VALUES ('1', 'Renovations', 'renovations', 'job', 'category.reform');
    INSERT INTO public.subcategories (id, category_id, name, slug, translation_key) VALUES 
      ('sub-1-1', '1', 'Painting', 'painting', 'subcat.painting'),
      ('sub-1-2', '1', 'Drywall Installation', 'drywall-installation', 'subcat.drywall'),
      ('sub-1-3', '1', 'Cabinet Installation', 'cabinet-installation', 'subcat.cabinets'),
      ('sub-1-4', '1', 'Electrician', 'electrician', 'subcat.electrician'),
      ('sub-1-5', '1', 'Flooring Installer', 'flooring-installer', 'subcat.flooring');
  END IF;

  -- Construction
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE id = '2') THEN
    INSERT INTO public.categories (id, name, slug, type, translation_key) VALUES ('2', 'Construction', 'construction', 'job', 'category.construction');
    INSERT INTO public.subcategories (id, category_id, name, slug, translation_key) VALUES 
      ('sub-2-1', '2', 'Masonry', 'masonry', 'subcat.masonry'),
      ('sub-2-2', '2', 'Roofing', 'roofing', 'subcat.roofing'),
      ('sub-2-3', '2', 'Foundation', 'foundation', 'subcat.foundation'),
      ('sub-2-4', '2', 'Ironwork', 'ironwork', 'subcat.ironwork');
  END IF;

  -- IT & Programming
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE id = '3') THEN
    INSERT INTO public.categories (id, name, slug, type, translation_key) VALUES ('3', 'IT & Programming', 'it-programming', 'job', 'category.ti');
    INSERT INTO public.subcategories (id, category_id, name, slug, translation_key) VALUES 
      ('sub-3-1', '3', 'Web Development', 'web-development', 'subcat.webdev'),
      ('sub-3-2', '3', 'Mobile Apps', 'mobile-apps', 'subcat.mobile'),
      ('sub-3-3', '3', 'UI/UX Design', 'ui-ux-design', 'subcat.uiux'),
      ('sub-3-4', '3', 'IT Support', 'it-support', 'subcat.itsupport');
  END IF;

  -- Design
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE id = '4') THEN
    INSERT INTO public.categories (id, name, slug, type, translation_key) VALUES ('4', 'Design', 'design', 'job', 'category.design');
    INSERT INTO public.subcategories (id, category_id, name, slug, translation_key) VALUES 
      ('sub-4-1', '4', 'Visual Identity', 'visual-identity', 'subcat.visualid'),
      ('sub-4-2', '4', 'Web Design', 'web-design', 'subcat.webdesign'),
      ('sub-4-3', '4', 'Illustration', 'illustration', 'subcat.illustration');
  END IF;

  -- Marketing
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE id = '5') THEN
    INSERT INTO public.categories (id, name, slug, type, translation_key) VALUES ('5', 'Marketing', 'marketing', 'job', 'category.marketing');
    INSERT INTO public.subcategories (id, category_id, name, slug, translation_key) VALUES 
      ('sub-5-1', '5', 'SEO', 'seo', 'subcat.seo'),
      ('sub-5-2', '5', 'Traffic Management', 'traffic-management', 'subcat.traffic'),
      ('sub-5-3', '5', 'Social Media', 'social-media', 'subcat.socialmedia');
  END IF;

  -- Sales & Products
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE id = '6') THEN
    INSERT INTO public.categories (id, name, slug, type, translation_key) VALUES ('6', 'Sales & Products', 'sales-products', 'marketplace', 'category.sales');
    INSERT INTO public.subcategories (id, category_id, name, slug, translation_key) VALUES 
      ('sub-6-1', '6', 'Electronics', 'electronics', 'subcat.electronics'),
      ('sub-6-2', '6', 'Furniture', 'furniture', 'subcat.furniture'),
      ('sub-6-3', '6', 'Tools', 'tools', 'subcat.tools');
  END IF;

  -- Rentals
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE id = '7') THEN
    INSERT INTO public.categories (id, name, slug, type, translation_key) VALUES ('7', 'Rentals', 'rentals', 'rental', 'category.rental');
    INSERT INTO public.subcategories (id, category_id, name, slug, translation_key) VALUES 
      ('sub-7-1', '7', 'Equipment', 'equipment', 'subcat.equipment'),
      ('sub-7-2', '7', 'Vehicles', 'vehicles', 'subcat.vehicles'),
      ('sub-7-3', '7', 'Spaces', 'spaces', 'subcat.spaces');
  END IF;

  -- Donation
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE id = '8') THEN
    INSERT INTO public.categories (id, name, slug, type, translation_key) VALUES ('8', 'Donation', 'donation', 'donation', 'category.donation');
    INSERT INTO public.subcategories (id, category_id, name, slug, translation_key) VALUES 
      ('sub-8-1', '8', 'Leftover Materials', 'leftover-materials', 'subcat.leftovers'),
      ('sub-8-2', '8', 'Clothes & PPE', 'clothes-ppe', 'subcat.clothes_ppe');
  END IF;

  -- Home Services (NEW)
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE id = '9') THEN
    INSERT INTO public.categories (id, name, slug, type, translation_key) VALUES ('9', 'Home Services', 'home-services', 'job', 'category.home_services');
    INSERT INTO public.subcategories (id, category_id, name, slug) VALUES 
      ('sub-9-1', '9', 'Appliance Repair or Maintenance', 'appliance-repair-maintenance'),
      ('sub-9-2', '9', 'Carpentry', 'carpentry'),
      ('sub-9-3', '9', 'Concrete and Masonry', 'concrete-masonry'),
      ('sub-9-4', '9', 'Electrical', 'electrical'),
      ('sub-9-5', '9', 'Exterior Painting', 'exterior-painting'),
      ('sub-9-6', '9', 'Fence and Gate Installation or Repair', 'fence-gate-installation-repair'),
      ('sub-9-7', '9', 'Flooring', 'flooring'),
      ('sub-9-8', '9', 'Furniture Assembly', 'furniture-assembly'),
      ('sub-9-9', '9', 'General Contracting', 'general-contracting'),
      ('sub-9-10', '9', 'Handyman', 'handyman'),
      ('sub-9-11', '9', 'Home Remodeling', 'home-remodeling'),
      ('sub-9-12', '9', 'House Cleaning', 'house-cleaning'),
      ('sub-9-13', '9', 'HVAC Repair or Maintenance', 'hvac-repair-maintenance'),
      ('sub-9-14', '9', 'Interior Design', 'interior-design'),
      ('sub-9-15', '9', 'Interior Painting', 'interior-painting'),
      ('sub-9-16', '9', 'Junk Removal', 'junk-removal');
  END IF;

  -- Auto Services (NEW)
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE id = '10') THEN
    INSERT INTO public.categories (id, name, slug, type, translation_key) VALUES ('10', 'Auto Services', 'auto-services', 'job', 'category.auto_services');
    INSERT INTO public.subcategories (id, category_id, name, slug) VALUES 
      ('sub-10-1', '10', 'Auto Detailing', 'auto-detailing'),
      ('sub-10-2', '10', 'Auto Repair or Maintenance', 'auto-repair-maintenance');
  END IF;

  -- Professional & Personal Services (NEW)
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE id = '11') THEN
    INSERT INTO public.categories (id, name, slug, type, translation_key) VALUES ('11', 'Professional & Personal Services', 'professional-personal-services', 'job', 'category.prof_personal');
    INSERT INTO public.subcategories (id, category_id, name, slug) VALUES 
      ('sub-11-1', '11', 'Academic Tutoring', 'academic-tutoring'),
      ('sub-11-2', '11', 'Accounting and Financial Services', 'accounting-financial-services'),
      ('sub-11-3', '11', 'Bartending', 'bartending'),
      ('sub-11-4', '11', 'Computer and Device Repair', 'computer-device-repair'),
      ('sub-11-5', '11', 'Dog Training', 'dog-training'),
      ('sub-11-6', '11', 'Dog Walking', 'dog-walking'),
      ('sub-11-7', '11', 'Event Planning Services', 'event-planning-services');
  END IF;

END $$;
