-- Add is_demo column to jobs and projects
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;

DO $$
DECLARE
  v_user_id uuid;
  v_project_id uuid;
BEGIN
  -- 1. Get or create seed user
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com';
  
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id, '00000000-0000-0000-0000-000000000000', 'adailtong@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Admin", "role": "contractor"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
    INSERT INTO public.profiles (id, email, name, role, is_admin, entity_type)
    VALUES (v_user_id, 'adailtong@gmail.com', 'Admin', 'contractor', true, 'individual')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- 2. Ensure basic categories exist
  INSERT INTO public.categories (id, name, slug, type)
  VALUES 
    ('cat-services', 'Services', 'services', 'job'),
    ('cat-sales', 'Sales', 'sales', 'product'),
    ('cat-exchanges', 'Exchanges', 'exchanges', 'product'),
    ('cat-construction', 'Construction', 'construction', 'project')
  ON CONFLICT (id) DO NOTHING;

  -- 3. Insert 2 Service jobs
  INSERT INTO public.jobs (id, title, description, budget, location, category, photos, owner_id, owner_name, status, is_demo, type, listing_type, external_id)
  VALUES 
    (gen_random_uuid(), 'Premium Electrical Installation', 'Complete rewiring for a 3-bedroom modern home. High-end fixtures and smart home integration required.', 4500, 'New York, NY', 'Services', '["https://img.usecurling.com/p/800/600?q=electrical%20installation"]'::jsonb, v_user_id, 'Admin', 'open', true, 'fixed', 'service', 'demo-job-1'),
    (gen_random_uuid(), 'Modern Interior Painting', 'Interior painting for a commercial office space. Approx 2000 sq ft. Premium eco-friendly paint.', 2800, 'Los Angeles, CA', 'Services', '["https://img.usecurling.com/p/800/600?q=interior%20painting"]'::jsonb, v_user_id, 'Admin', 'open', true, 'fixed', 'service', 'demo-job-2')
  ON CONFLICT (external_id) DO NOTHING;

  -- 4. Insert 2 Sale/Exchange jobs
  INSERT INTO public.jobs (id, title, description, budget, location, category, photos, owner_id, owner_name, status, is_demo, type, listing_type, external_id)
  VALUES 
    (gen_random_uuid(), 'Surplus High-Grade Ceramic Tiles', '100 boxes of premium Italian ceramic tiles left over from a hotel project. Selling at a 40% discount.', 1200, 'Miami, FL', 'Sales', '["https://img.usecurling.com/p/800/600?q=ceramic%20tiles"]'::jsonb, v_user_id, 'Admin', 'open', true, 'fixed', 'product', 'demo-job-3'),
    (gen_random_uuid(), 'Exchange: Concrete Mixer for Scaffolding', 'Looking to exchange a lightly used 3.5 cubic feet concrete mixer for heavy-duty steel scaffolding.', 0, 'Chicago, IL', 'Exchanges', '["https://img.usecurling.com/p/800/600?q=concrete%20mixer"]'::jsonb, v_user_id, 'Admin', 'open', true, 'fixed', 'product', 'demo-job-4')
  ON CONFLICT (external_id) DO NOTHING;

  -- 5. Insert 1 Full Project
  v_project_id := 'd0000000-0000-0000-0000-000000000001'::uuid;
  INSERT INTO public.projects (id, name, description, total_budget, progress, status, owner_id, photos, is_demo)
  VALUES (
    v_project_id, 
    'Luxury Coastal Villa - Phase 1', 
    'Foundation, framing, and roofing for a 5-bedroom coastal villa.', 
    150000, 
    35, 
    'in_progress', 
    v_user_id, 
    '["https://img.usecurling.com/p/800/600?q=coastal%20villa%20construction"]'::jsonb, 
    true
  ) ON CONFLICT (id) DO NOTHING;

  -- 6. Insert 3 Project Updates for the demo project
  IF NOT EXISTS (SELECT 1 FROM public.project_updates WHERE project_id = v_project_id) THEN
    INSERT INTO public.project_updates (project_id, title, description, photos, created_at)
    VALUES 
      (v_project_id, 'Site Preparation & Excavation', 'Site cleared and excavation completed for the main foundation.', '["https://img.usecurling.com/p/800/600?q=excavation"]'::jsonb, NOW() - INTERVAL '30 days'),
      (v_project_id, 'Foundation Poured', 'Concrete foundation poured and cured. Plumbing rough-ins installed.', '["https://img.usecurling.com/p/800/600?q=concrete%20foundation"]'::jsonb, NOW() - INTERVAL '15 days'),
      (v_project_id, 'Framing Commenced', 'First floor timber framing is 50% complete. Weather cooperating.', '["https://img.usecurling.com/p/800/600?q=timber%20framing"]'::jsonb, NOW() - INTERVAL '2 days');
  END IF;

END $$;
