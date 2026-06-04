DO $$
DECLARE
  v_admin_id uuid;
  v_project_id uuid := 'd0000000-0000-0000-0000-000000000001'::uuid;
  v_vendor_id uuid := 'd0000000-0000-0000-0000-000000000002'::uuid;
BEGIN
  -- Fetch the admin user id
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
  
  -- 1. Insert Main Project Record
  IF NOT EXISTS (SELECT 1 FROM public.projects WHERE id = v_project_id) THEN
    INSERT INTO public.projects (
      id, owner_id, name, description, status, total_budget, progress, is_demo, photos
    ) VALUES (
      v_project_id,
      v_admin_id,
      'Residencial Aurora - Exemplo Completo',
      'Construção de um edifício residencial de alto padrão com 10 andares e área de lazer completa.',
      'in_progress',
      1500000.00,
      45,
      true,
      '["https://img.usecurling.com/p/800/600?q=construction%20site", "https://img.usecurling.com/p/800/600?q=building%20foundation"]'::jsonb
    );
  END IF;

  -- 2. Insert Detailed Project Milestones (Updates)
  IF NOT EXISTS (SELECT 1 FROM public.project_updates WHERE project_id = v_project_id) THEN
    INSERT INTO public.project_updates (project_id, title, description, photos) VALUES
    (v_project_id, 'Phase 1: Planning & Foundation', 'Soil analysis and concrete pouring. The foundation is set securely according to structural designs.', '["https://img.usecurling.com/p/800/600?q=concrete%20foundation", "https://img.usecurling.com/p/800/600?q=excavator"]'::jsonb),
    (v_project_id, 'Phase 2: Structural Framing', 'Timber and Steel framing installation. First three floors have been erected.', '["https://img.usecurling.com/p/800/600?q=steel%20framing", "https://img.usecurling.com/p/800/600?q=construction%20crane"]'::jsonb),
    (v_project_id, 'Phase 3: Installations', 'Electrical wiring and plumbing routing in the lower levels.', '["https://img.usecurling.com/p/800/600?q=electrical%20wiring", "https://img.usecurling.com/p/800/600?q=plumbing%20pipes"]'::jsonb),
    (v_project_id, 'Phase 4: Exterior & Roofing', 'Shingle installation and external painting started on the sample unit.', '["https://img.usecurling.com/p/800/600?q=roofing", "https://img.usecurling.com/p/800/600?q=external%20painting"]'::jsonb),
    (v_project_id, 'Phase 5: Finishing', 'Floor tiling and interior lighting preparations.', '["https://img.usecurling.com/p/800/600?q=floor%20tiling", "https://img.usecurling.com/p/800/600?q=interior%20lighting"]'::jsonb);
  END IF;

  -- 3. Insert Resource & Equipment Allocation
  IF NOT EXISTS (SELECT 1 FROM public.equipment WHERE project_id = v_project_id) THEN
    INSERT INTO public.equipment (project_id, name, type, status, location) VALUES
    (v_project_id, 'Excavator CAT 320', 'Heavy Machinery', 'in_use', 'Site A - North'),
    (v_project_id, 'Concrete Mixer 400L', 'Machinery', 'in_use', 'Site B - Central'),
    (v_project_id, 'Scaffolding System', 'Support', 'available', 'Storage Area');
  END IF;

  -- Ensure we have a vendor to associate invoices
  IF NOT EXISTS (SELECT 1 FROM public.vendors WHERE id = v_vendor_id) THEN
    INSERT INTO public.vendors (id, name, category, status) VALUES (v_vendor_id, 'Construtora Alpha S.A.', 'Material', 'active');
  END IF;

  -- 4. Insert Financial Tracking Demo (Invoices)
  IF NOT EXISTS (SELECT 1 FROM public.invoices WHERE project_id = v_project_id) THEN
    INSERT INTO public.invoices (project_id, vendor_id, amount, currency, status, description, type, payer_id) VALUES
    (v_project_id, v_vendor_id, 25000.00, 'USD', 'paid', 'Initial Materials (Cement, Steel)', 'material', v_admin_id),
    (v_project_id, v_vendor_id, 12000.00, 'USD', 'paid', 'Excavator Rental - Month 1', 'equipment', v_admin_id),
    (v_project_id, v_vendor_id, 8500.00, 'USD', 'pending', 'Plumbing Supplies Batch 1', 'material', v_admin_id),
    (v_project_id, v_vendor_id, 45000.00, 'USD', 'pending', 'Structural Steel Frames', 'material', v_admin_id);
  END IF;
END $$;
