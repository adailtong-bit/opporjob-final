DO $$
BEGIN
  -- Home Services
  INSERT INTO public.subcategories (id, category_id, name, slug) VALUES 
    ('sub-9-17', '9', 'Plumbing', 'plumbing'),
    ('sub-9-18', '9', 'Remediation Services', 'remediation-services'),
    ('sub-9-19', '9', 'Swimming Pool Cleaning, Maintenance, and Inspection', 'swimming-pool-cleaning-maintenance-inspection'),
    ('sub-9-20', '9', 'TV Mounting', 'tv-mounting'),
    ('sub-9-21', '9', 'Windows and Doors', 'windows-and-doors'),
    ('sub-9-22', '9', 'Roofing', 'roofing'),
    ('sub-9-23', '9', 'Welding', 'welding')
  ON CONFLICT (id) DO NOTHING;

  -- Auto Services
  INSERT INTO public.subcategories (id, category_id, name, slug) VALUES 
    ('sub-10-3', '10', 'Transportation', 'transportation'),
    ('sub-10-4', '10', 'Vehicle Towing', 'vehicle-towing')
  ON CONFLICT (id) DO NOTHING;

  -- Professional & Personal Services
  INSERT INTO public.subcategories (id, category_id, name, slug) VALUES 
    ('sub-11-8', '11', 'Pet Care', 'pet-care'),
    ('sub-11-9', '11', 'Pet Grooming', 'pet-grooming'),
    ('sub-11-10', '11', 'Photography', 'photography'),
    ('sub-11-11', '11', 'Security and Body Guard Services', 'security-and-body-guard-services')
  ON CONFLICT (id) DO NOTHING;
END $$;
