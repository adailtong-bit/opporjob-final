DO $$
DECLARE
  v_user_id uuid;
  v_project_id uuid := '11111111-1111-1111-1111-111111111111'::uuid;
  v_vendor_id uuid := '22222222-2222-2222-2222-222222222222'::uuid;
BEGIN
  -- Ensure admin user exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
  
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
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;

  INSERT INTO public.profiles (id, email, name, role, is_admin)
  VALUES (v_user_id, 'adailtong@gmail.com', 'Administrador', 'admin', true)
  ON CONFLICT (id) DO NOTHING;

  -- Seed Demo Project
  IF NOT EXISTS (SELECT 1 FROM public.projects WHERE id = v_project_id) THEN
    INSERT INTO public.projects (id, name, description, status, total_budget, progress, is_demo, owner_id)
    VALUES (
      v_project_id,
      'Modern Eco-Villa Construction - Demo',
      'A state-of-the-art sustainable villa featuring solar integration, smart home technologies, and eco-friendly materials.',
      'in_progress',
      1250000.00,
      35.5,
      true,
      v_user_id
    );
  END IF;

  -- Project Updates
  IF NOT EXISTS (SELECT 1 FROM public.project_updates WHERE project_id = v_project_id) THEN
    INSERT INTO public.project_updates (project_id, title, description, photos)
    VALUES 
      (v_project_id, 'Site Preparation', 'Site clearing and leveling completed. Temporary fencing installed.', '["https://img.usecurling.com/p/800/600?q=construction%20site"]'::jsonb),
      (v_project_id, 'Foundation Completion', 'Concrete pouring for the foundation finished successfully. Curing in progress.', '["https://img.usecurling.com/p/800/600?q=concrete%20foundation"]'::jsonb),
      (v_project_id, 'Structural Framing', 'First floor framing in progress. Using sustainable timber.', '["https://img.usecurling.com/p/800/600?q=wood%20framing"]'::jsonb);
  END IF;

  -- Equipment
  IF NOT EXISTS (SELECT 1 FROM public.equipment WHERE project_id = v_project_id) THEN
    INSERT INTO public.equipment (name, type, status, location, project_id)
    VALUES 
      ('Caterpillar Excavator 320', 'Heavy Machinery', 'in_use', 'Site A', v_project_id),
      ('Concrete Mixer Pro', 'Light Equipment', 'available', 'Site A', v_project_id),
      ('Scissor Lift 19ft', 'Lift', 'in_use', 'Site A', v_project_id);
  END IF;

  -- Materials
  INSERT INTO public.materials (id, name, category, price, unit, stock)
  VALUES 
    (gen_random_uuid(), 'Structural Steel Beam', 'Structure', 150.00, 'unit', 100),
    (gen_random_uuid(), 'Eco-Friendly Cement', 'Foundation', 12.50, 'bag', 500)
  ON CONFLICT DO NOTHING;

  -- Vendor
  IF NOT EXISTS (SELECT 1 FROM public.vendors WHERE id = v_vendor_id) THEN
    INSERT INTO public.vendors (id, name, email, category, status)
    VALUES (v_vendor_id, 'EcoBuild Suppliers Ltd', 'contact@ecobuild.com', 'Materials', 'active');
  END IF;

  -- Invoices
  IF NOT EXISTS (SELECT 1 FROM public.invoices WHERE project_id = v_project_id) THEN
    INSERT INTO public.invoices (project_id, payer_id, receiver_id, vendor_id, amount, currency, status, description, type, due_date)
    VALUES 
      (v_project_id, v_user_id, NULL, v_vendor_id, 15000.00, 'USD', 'paid', 'Initial structural steel delivery', 'material', NOW() + INTERVAL '10 days'),
      (v_project_id, v_user_id, NULL, v_vendor_id, 6250.00, 'USD', 'pending', 'Eco-friendly cement batch 1', 'material', NOW() + INTERVAL '15 days');
  END IF;

END $$;
