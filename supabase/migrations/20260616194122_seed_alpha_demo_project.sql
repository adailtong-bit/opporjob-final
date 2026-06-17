DO $$
DECLARE
  v_user_id uuid;
  v_project_id uuid := '10000000-0000-0000-0000-000000000001'::uuid;
  v_stage_1_id uuid := '10000000-0000-0000-0000-000000000011'::uuid;
  v_stage_2_id uuid := '10000000-0000-0000-0000-000000000012'::uuid;
  v_stage_3_id uuid := '10000000-0000-0000-0000-000000000013'::uuid;
  v_vendor_1_id uuid := '10000000-0000-0000-0000-000000000021'::uuid;
  v_vendor_2_id uuid := '10000000-0000-0000-0000-000000000022'::uuid;
BEGIN
  -- 1. Ensure user adailtong@gmail.com exists
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
      '{"name": "Adailton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role, is_admin)
    VALUES (v_user_id, 'adailtong@gmail.com', 'Adailton', 'admin', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- 2. Insert Demo Project
  IF NOT EXISTS (SELECT 1 FROM public.projects WHERE id = v_project_id) THEN
    INSERT INTO public.projects (
      id, owner_id, name, description, status, total_budget, progress, is_demo, retention_percentage
    ) VALUES (
      v_project_id, v_user_id, 'Alpha Project Test', 'Complete demo project for construction management validation',
      'in_progress', 150000, 33, true, 5.0
    );
  END IF;

  -- 3. Insert Stages
  IF NOT EXISTS (SELECT 1 FROM public.project_stages WHERE id = v_stage_1_id) THEN
    INSERT INTO public.project_stages (id, project_id, name, description, status, order_index, approval_status)
    VALUES (v_stage_1_id, v_project_id, 'Foundation', 'Foundation works', 'completed', 0, 'completed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.project_stages WHERE id = v_stage_2_id) THEN
    INSERT INTO public.project_stages (id, project_id, name, description, status, order_index, dependency_id, approval_status)
    VALUES (v_stage_2_id, v_project_id, 'Masonry', 'Masonry and walls', 'pending', 1, v_stage_1_id, 'pending');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.project_stages WHERE id = v_stage_3_id) THEN
    INSERT INTO public.project_stages (id, project_id, name, description, status, order_index, dependency_id, approval_status)
    VALUES (v_stage_3_id, v_project_id, 'Roofing', 'Roofing and cover', 'pending', 2, v_stage_2_id, 'pending');
  END IF;

  -- 4. Insert Compliance Documents
  DELETE FROM public.project_compliance WHERE project_id = v_project_id;
  INSERT INTO public.project_compliance (project_id, document_name, status, expiry_date)
  VALUES 
    (v_project_id, 'Building Permit', 'approved', NOW() + INTERVAL '365 days'),
    (v_project_id, 'Environmental License', 'pending', NULL);

  -- 5. Insert Vendors
  IF NOT EXISTS (SELECT 1 FROM public.vendors WHERE id = v_vendor_1_id) THEN
    INSERT INTO public.vendors (id, name, email, document, category, status)
    VALUES (v_vendor_1_id, 'Masonry Masters LLC', 'masonry@example.com', '123456789', 'Contractor', 'active');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.vendors WHERE id = v_vendor_2_id) THEN
    INSERT INTO public.vendors (id, name, email, document, category, status)
    VALUES (v_vendor_2_id, 'Electro Specialists Inc', 'electro@example.com', '987654321', 'Subcontractor', 'active');
  END IF;

  -- 6. Insert Project Partners
  INSERT INTO public.project_partners (project_id, vendor_id, role)
  VALUES 
    (v_project_id, v_vendor_1_id, 'Masonry Subcontractor'),
    (v_project_id, v_vendor_2_id, 'Electrical Specialist')
  ON CONFLICT (project_id, vendor_id) DO NOTHING;

  -- 7. Insert Financial Flow (Budgets)
  DELETE FROM public.project_budgets WHERE project_id = v_project_id;
  INSERT INTO public.project_budgets (project_id, category, estimated_amount, actual_amount, status)
  VALUES 
    (v_project_id, 'Materials', 80000, 30000, 'in_progress'),
    (v_project_id, 'Labor', 50000, 15000, 'in_progress'),
    (v_project_id, 'Equipment', 20000, 5000, 'in_progress');

  -- 8. Insert Purchase Orders
  DELETE FROM public.purchase_orders WHERE project_id = v_project_id;
  INSERT INTO public.purchase_orders (id, project_id, requester_id, vendor_id, status, total_amount)
  VALUES 
    (gen_random_uuid(), v_project_id, v_user_id, v_vendor_1_id, 'pending_manager', 15000),
    (gen_random_uuid(), v_project_id, v_user_id, v_vendor_2_id, 'pending_finance', 8500);

END $$;
