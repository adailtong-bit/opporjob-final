CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name TEXT NOT NULL UNIQUE,
  access_level JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "permissions_read_all" ON public.permissions;
CREATE POLICY "permissions_read_all" ON public.permissions
  FOR SELECT TO public USING (true);

DO $DO$
DECLARE
  v_admin_id UUID;
  v_manager_id UUID;
  v_executor_id UUID;
  v_project_id UUID;
  v_vendor_id UUID;
  v_stage_permits UUID;
  v_stage_foundation UUID;
  v_stage_structure UUID;
  v_po_cement UUID;
  v_po_rebar UUID;
  v_po_completed UUID;
BEGIN
  -- RBAC Permissions Seed
  INSERT INTO public.permissions (role_name, access_level) VALUES
  ('Admin', '["all"]'::jsonb),
  ('Manager', '["manage_project", "approve_po"]'::jsonb),
  ('Executor', '["view_project", "update_tasks"]'::jsonb)
  ON CONFLICT (role_name) DO NOTHING;

  -- Seed User: Admin adailtong@gmail.com
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'adailtong@gmail.com';
  IF v_admin_id IS NULL THEN
    v_admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin Test", "role": "admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;

  INSERT INTO public.profiles (id, email, name, role, is_admin)
  VALUES (v_admin_id, 'adailtong@gmail.com', 'Admin Test', 'admin', true)
  ON CONFLICT (id) DO UPDATE SET is_admin = true, role = 'admin';

  -- Seed User: Manager
  SELECT id INTO v_manager_id FROM auth.users WHERE email = 'manager@test.com';
  IF v_manager_id IS NULL THEN
    v_manager_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_manager_id, '00000000-0000-0000-0000-000000000000', 'manager@test.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Project Manager", "role": "manager"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
    );
  END IF;

  INSERT INTO public.profiles (id, email, name, role)
  VALUES (v_manager_id, 'manager@test.com', 'Project Manager', 'manager')
  ON CONFLICT (id) DO NOTHING;

  -- Seed User: Executor
  SELECT id INTO v_executor_id FROM auth.users WHERE email = 'executor@test.com';
  IF v_executor_id IS NULL THEN
    v_executor_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_executor_id, '00000000-0000-0000-0000-000000000000', 'executor@test.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Site Executor", "role": "executor"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
    );
  END IF;

  INSERT INTO public.profiles (id, email, name, role)
  VALUES (v_executor_id, 'executor@test.com', 'Site Executor', 'executor')
  ON CONFLICT (id) DO NOTHING;

  -- Seed Project
  SELECT id INTO v_project_id FROM public.projects WHERE name = 'Test Villa Construction' LIMIT 1;
  IF v_project_id IS NULL THEN
    v_project_id := gen_random_uuid();
    INSERT INTO public.projects (id, owner_id, name, description, status, total_budget, progress, is_demo, retention_percentage)
    VALUES (v_project_id, v_admin_id, 'Test Villa Construction', 'Sample Residential Project demonstrating full workflow.', 'in_progress', 250000, 20, true, 10);
  END IF;

  -- Seed Vendor
  SELECT id INTO v_vendor_id FROM public.vendors WHERE name = 'Construct Materials Ltd' LIMIT 1;
  IF v_vendor_id IS NULL THEN
    v_vendor_id := gen_random_uuid();
    INSERT INTO public.vendors (id, owner_id, name, email, status)
    VALUES (v_vendor_id, v_admin_id, 'Construct Materials Ltd', 'supply@construct.com', 'active');
  END IF;

  -- Project Partners
  INSERT INTO public.project_partners (project_id, vendor_id, role)
  VALUES (v_project_id, v_vendor_id, 'Supplier')
  ON CONFLICT (project_id, vendor_id) DO NOTHING;

  -- Project Stages
  SELECT id INTO v_stage_permits FROM public.project_stages WHERE project_id = v_project_id AND name = 'Permits & Licensing' LIMIT 1;
  IF v_stage_permits IS NULL THEN
    v_stage_permits := gen_random_uuid();
    INSERT INTO public.project_stages (id, project_id, name, description, status, order_index, approval_status)
    VALUES (v_stage_permits, v_project_id, 'Permits & Licensing', 'City permits acquired', 'completed', 1, 'completed');
  END IF;

  SELECT id INTO v_stage_foundation FROM public.project_stages WHERE project_id = v_project_id AND name = 'Foundation' LIMIT 1;
  IF v_stage_foundation IS NULL THEN
    v_stage_foundation := gen_random_uuid();
    INSERT INTO public.project_stages (id, project_id, name, description, status, order_index, dependency_id, approval_status)
    VALUES (v_stage_foundation, v_project_id, 'Foundation', 'Pouring foundation concrete', 'completed', 2, v_stage_permits, 'pending');

    INSERT INTO public.project_updates (project_id, title, description, photos)
    VALUES (v_project_id, 'Foundation poured', 'Execution finished, awaiting technical approval', '["https://img.usecurling.com/p/800/600?q=construction%20foundation"]'::jsonb);
  END IF;

  SELECT id INTO v_stage_structure FROM public.project_stages WHERE project_id = v_project_id AND name = 'Main Structure' LIMIT 1;
  IF v_stage_structure IS NULL THEN
    v_stage_structure := gen_random_uuid();
    INSERT INTO public.project_stages (id, project_id, name, description, status, order_index, dependency_id, approval_status)
    VALUES (v_stage_structure, v_project_id, 'Main Structure', 'Framing and structural work', 'pending', 3, v_stage_foundation, 'pending');
  END IF;

  -- Purchase Orders
  SELECT id INTO v_po_cement FROM public.purchase_orders WHERE project_id = v_project_id AND status = 'pending_manager' LIMIT 1;
  IF v_po_cement IS NULL THEN
    v_po_cement := gen_random_uuid();
    INSERT INTO public.purchase_orders (id, project_id, requester_id, vendor_id, status, total_amount)
    VALUES (v_po_cement, v_project_id, v_admin_id, v_vendor_id, 'pending_manager', 1500);

    INSERT INTO public.purchase_order_items (id, purchase_order_id, material_name, quantity, unit_price, total_price)
    VALUES (gen_random_uuid(), v_po_cement, '100 Bags of Cement', 100, 15, 1500);
  END IF;

  SELECT id INTO v_po_rebar FROM public.purchase_orders WHERE project_id = v_project_id AND status = 'pending_finance' LIMIT 1;
  IF v_po_rebar IS NULL THEN
    v_po_rebar := gen_random_uuid();
    INSERT INTO public.purchase_orders (id, project_id, requester_id, manager_id, vendor_id, status, total_amount)
    VALUES (v_po_rebar, v_project_id, v_admin_id, v_manager_id, v_vendor_id, 'pending_finance', 4500);

    INSERT INTO public.purchase_order_items (id, purchase_order_id, material_name, quantity, unit_price, total_price)
    VALUES (gen_random_uuid(), v_po_rebar, 'Steel Rebar', 50, 90, 4500);
  END IF;

  SELECT id INTO v_po_completed FROM public.purchase_orders WHERE project_id = v_project_id AND status = 'delivered' LIMIT 1;
  IF v_po_completed IS NULL THEN
    v_po_completed := gen_random_uuid();
    INSERT INTO public.purchase_orders (id, project_id, requester_id, manager_id, finance_id, vendor_id, status, total_amount, receipt_url)
    VALUES (v_po_completed, v_project_id, v_admin_id, v_manager_id, v_admin_id, v_vendor_id, 'delivered', 800, 'https://example.com/receipt.pdf');

    INSERT INTO public.purchase_order_items (id, purchase_order_id, material_name, quantity, unit_price, total_price)
    VALUES (gen_random_uuid(), v_po_completed, 'Lumber', 40, 20, 800);
  END IF;

  -- Financial Retainage
  IF NOT EXISTS (SELECT 1 FROM public.invoices WHERE project_id = v_project_id AND description = 'Milestone Payment') THEN
    INSERT INTO public.invoices (id, project_id, payer_id, vendor_id, amount, status, type, description, retention_amount, is_retention_release)
    VALUES (gen_random_uuid(), v_project_id, v_admin_id, v_vendor_id, 10000, 'pending', 'service', 'Milestone Payment', 1000, false);
  END IF;

  -- Compliance
  IF NOT EXISTS (SELECT 1 FROM public.project_compliance WHERE project_id = v_project_id AND document_name = 'City Permits') THEN
    INSERT INTO public.project_compliance (id, project_id, document_name, status, expiry_date, file_url)
    VALUES (gen_random_uuid(), v_project_id, 'City Permits', 'approved', NOW() + INTERVAL '1 year', 'https://example.com/permit.pdf');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.project_compliance WHERE project_id = v_project_id AND document_name = 'Insurance Policy') THEN
    INSERT INTO public.project_compliance (id, project_id, document_name, status, expiry_date, file_url)
    VALUES (gen_random_uuid(), v_project_id, 'Insurance Policy', 'approved', NOW() + INTERVAL '6 months', 'https://example.com/insurance.pdf');
  END IF;

END $DO$;
