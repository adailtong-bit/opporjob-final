DO $block$
DECLARE
  admin_id UUID;
  proj_id UUID;
BEGIN
  -- Get admin user
  SELECT id INTO admin_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
  
  IF admin_id IS NULL THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, 
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, 
      is_super_admin, role, aud, 
      confirmation_token, recovery_token, email_change_token_new, 
      email_change, email_change_token_current, 
      phone, phone_change, phone_change_token, reauthentication_token
    )
    VALUES (
      admin_id, '00000000-0000-0000-0000-000000000000', 'adailtong@gmail.com', crypt('Skip@Pass123!', gen_salt('bf')), NOW(), 
      NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Admin"}', 
      false, 'authenticated', 'authenticated', 
      '', '', '', '', '', NULL, '', '', ''
    )
    ON CONFLICT (email) DO NOTHING;
    
    SELECT id INTO admin_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
    
    INSERT INTO public.profiles (id, email, name, is_admin)
    VALUES (admin_id, 'adailtong@gmail.com', 'Administrador', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- 1. Jobs - Desapego (Sales/Product)
  INSERT INTO public.jobs (id, title, description, type, category, sub_category, location, budget, owner_id, owner_name, status, source, photos, listing_type, is_demo)
  VALUES 
  ('11111111-1111-1111-1111-100000000001'::uuid, 'Professional Grade Circular Saw', 'High-performance circular saw ideal for heavy-duty woodworking. Rarely used, excellent condition. Perfect for contractors and DIY enthusiasts.', 'fixed', 'Tools', 'Saws', 'New York, NY', 120.00, admin_id, 'Adailton G', 'open', 'internal', '["https://img.usecurling.com/p/600/600?q=circular%20saw"]'::jsonb, 'product', true),
  ('11111111-1111-1111-1111-100000000002'::uuid, 'Premium Ceramic Tiles Pallet', 'Leftover high-end ceramic tiles from a luxury renovation project. Covers approximately 500 sq ft. Elegant marble finish.', 'fixed', 'Materials', 'Tiles', 'Los Angeles, CA', 450.00, admin_id, 'Adailton G', 'open', 'internal', '["https://img.usecurling.com/p/600/600?q=ceramic%20tiles"]'::jsonb, 'product', true)
  ON CONFLICT (id) DO NOTHING;

  -- 2. Jobs - Doação (Donations)
  INSERT INTO public.jobs (id, title, description, type, category, sub_category, location, budget, owner_id, owner_name, status, source, photos, listing_type, is_demo)
  VALUES
  ('11111111-1111-1111-1111-200000000001'::uuid, 'Leftover Premium Interior Paint', '5 gallons of high-quality interior eggshell paint. Neutral beige tone. Free to a good home or community project.', 'fixed', 'Materials', 'Paint', 'Chicago, IL', 0.00, admin_id, 'Adailton G', 'open', 'internal', '["https://img.usecurling.com/p/600/600?q=paint%20cans"]'::jsonb, 'donation', true),
  ('11111111-1111-1111-1111-200000000002'::uuid, 'Reclaimed Vintage Bricks', 'Pallet of authentic reclaimed red bricks. Excellent for rustic landscaping or accent walls. Must pick up.', 'fixed', 'Materials', 'Masonry', 'Houston, TX', 0.00, admin_id, 'Adailton G', 'open', 'internal', '["https://img.usecurling.com/p/600/600?q=red%20bricks"]'::jsonb, 'donation', true)
  ON CONFLICT (id) DO NOTHING;

  -- 3. Jobs - Vagas (Job Openings)
  INSERT INTO public.jobs (id, title, description, type, category, sub_category, location, budget, owner_id, owner_name, status, source, photos, listing_type, is_demo)
  VALUES
  ('11111111-1111-1111-1111-300000000001'::uuid, 'Senior Commercial Electrician', 'Seeking a highly skilled commercial electrician for a large-scale high-rise project. Competitive pay, great benefits, and long-term contract.', 'hourly', 'Construction', 'Electrical', 'Miami, FL', 45.00, admin_id, 'Adailton G', 'open', 'internal', '["https://img.usecurling.com/p/600/600?q=electrician"]'::jsonb, 'job', true),
  ('11111111-1111-1111-1111-300000000002'::uuid, 'Experienced Site Supervisor', 'Looking for an experienced Site Supervisor to manage luxury residential builds. Must have 10+ years of experience and strong leadership skills.', 'fixed', 'Construction', 'Management', 'Seattle, WA', 85000.00, admin_id, 'Adailton G', 'open', 'internal', '["https://img.usecurling.com/p/600/600?q=construction%20site"]'::jsonb, 'job', true)
  ON CONFLICT (id) DO NOTHING;

  -- 4. Jobs - Serviços (Services)
  INSERT INTO public.jobs (id, title, description, type, category, sub_category, location, budget, owner_id, owner_name, status, source, photos, listing_type, is_demo)
  VALUES
  ('11111111-1111-1111-1111-400000000001'::uuid, 'Expert Drywall Installation & Finishing', 'Professional drywall installation, taping, and finishing services. We guarantee flawless walls ready for premium paint. Fast and clean execution.', 'fixed', 'Construction', 'Drywall', 'Boston, MA', 1500.00, admin_id, 'Adailton G', 'open', 'internal', '["https://img.usecurling.com/p/600/600?q=drywall"]'::jsonb, 'service', true),
  ('11111111-1111-1111-1111-400000000002'::uuid, '24/7 Emergency Hydraulic Maintenance', 'Rapid response plumbing and hydraulic maintenance. From leak detection to full pipe replacement, our certified experts handle it all.', 'hourly', 'Maintenance', 'Plumbing', 'Austin, TX', 120.00, admin_id, 'Adailton G', 'open', 'internal', '["https://img.usecurling.com/p/600/600?q=plumber"]'::jsonb, 'service', true)
  ON CONFLICT (id) DO NOTHING;

  -- 5. Jobs - Locação (Rentals)
  INSERT INTO public.jobs (id, title, description, type, category, sub_category, location, budget, owner_id, owner_name, status, source, photos, listing_type, is_demo)
  VALUES
  ('11111111-1111-1111-1111-500000000001'::uuid, 'Heavy-Duty Scaffolding Set Rental', 'Complete set of industrial-grade scaffolding. Safe, easy to assemble, and OSHA compliant. Available for weekly or monthly rental.', 'fixed', 'Equipment', 'Scaffolding', 'Denver, CO', 350.00, admin_id, 'Adailton G', 'open', 'internal', '["https://img.usecurling.com/p/600/600?q=scaffolding"]'::jsonb, 'rental', true),
  ('11111111-1111-1111-1111-500000000002'::uuid, 'High-Efficiency Concrete Mixer - Daily Rental', 'Top-tier portable concrete mixer for medium to large pours. Ensures perfect consistency and saves hours of manual labor. Delivery available.', 'fixed', 'Equipment', 'Mixers', 'Atlanta, GA', 75.00, admin_id, 'Adailton G', 'open', 'internal', '["https://img.usecurling.com/p/600/600?q=concrete%20mixer"]'::jsonb, 'rental', true)
  ON CONFLICT (id) DO NOTHING;

  -- 6. Projects - Construction Management Showcase
  proj_id := '22222222-2222-2222-2222-100000000001'::uuid;
  INSERT INTO public.projects (id, owner_id, name, description, status, total_budget, progress, photos, is_demo)
  VALUES
  (proj_id, admin_id, 'Luxury Villa Renovation', 'Comprehensive renovation of a 5-bedroom coastal luxury villa. Upgrading all systems, expanding the master suite, and installing premium smart-home features. Precision and excellence at every stage.', 'in_progress', 1250000.00, 65, '["https://img.usecurling.com/p/800/600?q=luxury%20villa"]'::jsonb, true)
  ON CONFLICT (id) DO NOTHING;

  -- Project Updates
  INSERT INTO public.project_updates (id, project_id, title, description, photos)
  VALUES
  ('33333333-3333-3333-3333-100000000001'::uuid, proj_id, 'Foundation & Demolition Completed', 'Successfully cleared the old structures and reinforced the foundation. The site is now ready for framing.', '["https://img.usecurling.com/p/800/600?q=foundation"]'::jsonb),
  ('33333333-3333-3333-3333-100000000002'::uuid, proj_id, 'Plumbing & Electrical Installation', 'Rough-in plumbing and electrical systems have been successfully installed and inspected. Passing all codes with flying colors.', '["https://img.usecurling.com/p/800/600?q=electrical%20wiring"]'::jsonb),
  ('33333333-3333-3333-3333-100000000003'::uuid, proj_id, 'Interior Finishing Commenced', 'Drywall is up, and premium finishes are being applied. Custom cabinetry arrival is scheduled for next week.', '["https://img.usecurling.com/p/800/600?q=interior%20finishing"]'::jsonb)
  ON CONFLICT (id) DO NOTHING;

END $block$;
