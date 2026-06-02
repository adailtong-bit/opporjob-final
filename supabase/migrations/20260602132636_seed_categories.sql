DO $$
BEGIN
  -- Insert base categories
  INSERT INTO public.categories (id, name, slug, type, translation_key) VALUES
    ('1', 'Renovations', 'renovations', 'job', 'category.reform'),
    ('2', 'Construction', 'construction', 'job', 'category.construction'),
    ('3', 'IT & Programming', 'it-programming', 'job', 'category.ti'),
    ('4', 'Design', 'design', 'job', 'category.design'),
    ('5', 'Marketing', 'marketing', 'job', 'category.marketing'),
    ('6', 'Sales & Products', 'sales-products', 'marketplace', 'category.sales'),
    ('7', 'Rentals', 'rentals', 'rental', 'category.rental'),
    ('8', 'Donation', 'donation', 'donation', 'category.donation'),
    ('9', 'Home Services', 'home-services', 'job', 'category.home_services'),
    ('10', 'Auto Services', 'auto-services', 'job', 'category.auto_services'),
    ('11', 'Professional & Personal Services', 'professional-personal-services', 'job', 'category.prof_personal')
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    type = EXCLUDED.type,
    translation_key = EXCLUDED.translation_key;

  -- Insert subcategories
  INSERT INTO public.subcategories (id, category_id, name, slug, translation_key) VALUES
    ('sub-1-1', '1', 'Painting', 'painting', 'subcat.painting'),
    ('sub-1-2', '1', 'Drywall Installation', 'drywall-installation', 'subcat.drywall'),
    ('sub-1-3', '1', 'Cabinet Installation', 'cabinet-installation', 'subcat.cabinets'),
    ('sub-1-4', '1', 'Electrician', 'electrician', 'subcat.electrician'),
    ('sub-1-5', '1', 'Flooring Installer', 'flooring-installer', 'subcat.flooring'),
    ('sub-2-1', '2', 'Masonry', 'masonry', 'subcat.masonry'),
    ('sub-2-2', '2', 'Roofing', 'roofing', 'subcat.roofing'),
    ('sub-2-3', '2', 'Foundation', 'foundation', 'subcat.foundation'),
    ('sub-2-4', '2', 'Ironwork', 'ironwork', 'subcat.ironwork'),
    ('sub-3-1', '3', 'Web Development', 'web-development', 'subcat.webdev'),
    ('sub-3-2', '3', 'Mobile Apps', 'mobile-apps', 'subcat.mobile'),
    ('sub-3-3', '3', 'UI/UX Design', 'ui-ux-design', 'subcat.uiux'),
    ('sub-3-4', '3', 'IT Support', 'it-support', 'subcat.itsupport'),
    ('sub-4-1', '4', 'Visual Identity', 'visual-identity', 'subcat.visualid'),
    ('sub-4-2', '4', 'Web Design', 'web-design', 'subcat.webdesign'),
    ('sub-4-3', '4', 'Illustration', 'illustration', 'subcat.illustration'),
    ('sub-5-1', '5', 'SEO', 'seo', 'subcat.seo'),
    ('sub-5-2', '5', 'Traffic Management', 'traffic-management', 'subcat.traffic'),
    ('sub-5-3', '5', 'Social Media', 'social-media', 'subcat.socialmedia'),
    ('sub-6-1', '6', 'Electronics', 'electronics', 'subcat.electronics'),
    ('sub-6-2', '6', 'Furniture', 'furniture', 'subcat.furniture'),
    ('sub-6-3', '6', 'Tools', 'tools', 'subcat.tools'),
    ('sub-7-1', '7', 'Equipment', 'equipment', 'subcat.equipment'),
    ('sub-7-2', '7', 'Vehicles', 'vehicles', 'subcat.vehicles'),
    ('sub-7-3', '7', 'Spaces', 'spaces', 'subcat.spaces'),
    ('sub-8-1', '8', 'Leftover Materials', 'leftover-materials', 'subcat.leftovers'),
    ('sub-8-2', '8', 'Clothes & PPE', 'clothes-ppe', 'subcat.clothes_ppe')
  ON CONFLICT (id) DO UPDATE SET
    category_id = EXCLUDED.category_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    translation_key = EXCLUDED.translation_key;
END $$;
