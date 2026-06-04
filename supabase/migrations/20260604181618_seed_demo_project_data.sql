DO $$
DECLARE
  demo_owner_id uuid;
  demo_project_id uuid;
  vendor_1_id uuid;
  vendor_2_id uuid;
BEGIN
  -- Get the admin user or the first user
  SELECT id INTO demo_owner_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
  IF demo_owner_id IS NULL THEN
    SELECT id INTO demo_owner_id FROM auth.users LIMIT 1;
  END IF;

  IF demo_owner_id IS NULL THEN
    RETURN; -- No users to own the project
  END IF;

  -- Create or find the demo project
  SELECT id INTO demo_project_id FROM public.projects WHERE name = 'Residencial Villa - Phase 1' LIMIT 1;
  
  IF demo_project_id IS NULL THEN
    demo_project_id := gen_random_uuid();
    INSERT INTO public.projects (id, name, description, status, total_budget, progress, is_demo, owner_id)
    VALUES (demo_project_id, 'Residencial Villa - Phase 1', 'Projeto de demonstração completo com todos os módulos preenchidos.', 'in_progress', 1500000.00, 45, true, demo_owner_id);
  END IF;

  -- Create Vendors
  IF NOT EXISTS (SELECT 1 FROM public.vendors WHERE email = 'contato@alpha.com') THEN
    vendor_1_id := gen_random_uuid();
    INSERT INTO public.vendors (id, name, email, phone, category, status, owner_id)
    VALUES (vendor_1_id, 'Construtora Alpha', 'contato@alpha.com', '(11) 99999-1111', 'Construction', 'active', demo_owner_id);
  ELSE
    SELECT id INTO vendor_1_id FROM public.vendors WHERE email = 'contato@alpha.com' LIMIT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.vendors WHERE email = 'eletrica@omega.com') THEN
    vendor_2_id := gen_random_uuid();
    INSERT INTO public.vendors (id, name, email, phone, category, status, owner_id)
    VALUES (vendor_2_id, 'Elétrica Ômega', 'eletrica@omega.com', '(11) 99999-2222', 'Electrical', 'active', demo_owner_id);
  ELSE
    SELECT id INTO vendor_2_id FROM public.vendors WHERE email = 'eletrica@omega.com' LIMIT 1;
  END IF;

  -- Link Partners
  IF NOT EXISTS (SELECT 1 FROM public.project_partners WHERE project_id = demo_project_id AND vendor_id = vendor_1_id) THEN
    INSERT INTO public.project_partners (project_id, vendor_id, role)
    VALUES (demo_project_id, vendor_1_id, 'Empreiteira Principal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.project_partners WHERE project_id = demo_project_id AND vendor_id = vendor_2_id) THEN
    INSERT INTO public.project_partners (project_id, vendor_id, role)
    VALUES (demo_project_id, vendor_2_id, 'Instalações Elétricas');
  END IF;

  -- Project Budgets
  IF NOT EXISTS (SELECT 1 FROM public.project_budgets WHERE project_id = demo_project_id AND category = 'Fundação') THEN
    INSERT INTO public.project_budgets (project_id, category, estimated_amount, actual_amount, status)
    VALUES (demo_project_id, 'Fundação', 150000.00, 155000.00, 'over_budget');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.project_budgets WHERE project_id = demo_project_id AND category = 'Estrutura') THEN
    INSERT INTO public.project_budgets (project_id, category, estimated_amount, actual_amount, status)
    VALUES (demo_project_id, 'Estrutura', 400000.00, 350000.00, 'on_track');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.project_budgets WHERE project_id = demo_project_id AND category = 'Acabamento') THEN
    INSERT INTO public.project_budgets (project_id, category, estimated_amount, actual_amount, status)
    VALUES (demo_project_id, 'Acabamento', 300000.00, 0.00, 'pending');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.project_budgets WHERE project_id = demo_project_id AND category = 'Instalações') THEN
    INSERT INTO public.project_budgets (project_id, category, estimated_amount, actual_amount, status)
    VALUES (demo_project_id, 'Instalações', 200000.00, 50000.00, 'on_track');
  END IF;

  -- Compliance Documents
  IF NOT EXISTS (SELECT 1 FROM public.project_compliance WHERE project_id = demo_project_id AND document_name = 'Alvará de Construção') THEN
    INSERT INTO public.project_compliance (project_id, document_name, status, expiry_date)
    VALUES (demo_project_id, 'Alvará de Construção', 'compliant', NOW() + INTERVAL '180 days');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.project_compliance WHERE project_id = demo_project_id AND document_name = 'Licença Ambiental') THEN
    INSERT INTO public.project_compliance (project_id, document_name, status, expiry_date)
    VALUES (demo_project_id, 'Licença Ambiental', 'expired', NOW() - INTERVAL '15 days');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.project_compliance WHERE project_id = demo_project_id AND document_name = 'Seguro de Obra') THEN
    INSERT INTO public.project_compliance (project_id, document_name, status, expiry_date)
    VALUES (demo_project_id, 'Seguro de Obra', 'compliant', NOW() + INTERVAL '10 days');
  END IF;

  -- Invoices
  IF NOT EXISTS (SELECT 1 FROM public.invoices WHERE project_id = demo_project_id AND description = 'Pagamento Fase 1 - Fundação') THEN
    INSERT INTO public.invoices (project_id, vendor_id, amount, currency, status, description, type, due_date)
    VALUES (demo_project_id, vendor_1_id, 155000.00, 'BRL', 'paid', 'Pagamento Fase 1 - Fundação', 'service', NOW() - INTERVAL '30 days');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.invoices WHERE project_id = demo_project_id AND description = 'Pagamento Fase 2 - Estrutura') THEN
    INSERT INTO public.invoices (project_id, vendor_id, amount, currency, status, description, type, due_date)
    VALUES (demo_project_id, vendor_1_id, 100000.00, 'BRL', 'pending', 'Pagamento Fase 2 - Estrutura', 'service', NOW() + INTERVAL '5 days');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.invoices WHERE project_id = demo_project_id AND description = 'Materiais Elétricos Iniciais') THEN
    INSERT INTO public.invoices (project_id, vendor_id, amount, currency, status, description, type, due_date)
    VALUES (demo_project_id, vendor_2_id, 50000.00, 'BRL', 'overdue', 'Materiais Elétricos Iniciais', 'material', NOW() - INTERVAL '2 days');
  END IF;

  -- Project Updates
  IF NOT EXISTS (SELECT 1 FROM public.project_updates WHERE project_id = demo_project_id AND title = 'Início das Obras') THEN
    INSERT INTO public.project_updates (project_id, title, description, photos)
    VALUES (demo_project_id, 'Início das Obras', 'Terreno preparado e fundação iniciada com sucesso.', '["https://img.usecurling.com/p/600/400?q=construction%20site"]'::jsonb);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.project_updates WHERE project_id = demo_project_id AND title = 'Fundação Concluída') THEN
    INSERT INTO public.project_updates (project_id, title, description, photos)
    VALUES (demo_project_id, 'Fundação Concluída', 'Concretagem da fundação finalizada. Iniciando a montagem da estrutura.', '["https://img.usecurling.com/p/600/400?q=concrete%20foundation"]'::jsonb);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.project_updates WHERE project_id = demo_project_id AND title = 'Estrutura em Andamento') THEN
    INSERT INTO public.project_updates (project_id, title, description, photos)
    VALUES (demo_project_id, 'Estrutura em Andamento', 'Pilares e vigas do primeiro pavimento concretados.', '["https://img.usecurling.com/p/600/400?q=building%20structure"]'::jsonb);
  END IF;

END $$;
