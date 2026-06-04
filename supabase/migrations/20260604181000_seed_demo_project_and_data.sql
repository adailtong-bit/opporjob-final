DO $$
DECLARE
  v_project_id uuid := 'd0000000-0000-0000-0000-000000000001'::uuid;
  v_vendor_1_id uuid := 'v0000000-0000-0000-0000-000000000001'::uuid;
  v_vendor_2_id uuid := 'v0000000-0000-0000-0000-000000000002'::uuid;
  v_owner_id uuid;
BEGIN
  -- Optionally find a user to own the project (the first one)
  SELECT id INTO v_owner_id FROM auth.users LIMIT 1;

  -- Cleanup existing demo project data for idempotency
  DELETE FROM public.project_updates WHERE project_id = v_project_id;
  DELETE FROM public.invoices WHERE project_id = v_project_id;
  DELETE FROM public.project_compliance WHERE project_id = v_project_id;
  DELETE FROM public.project_budgets WHERE project_id = v_project_id;
  DELETE FROM public.project_partners WHERE project_id = v_project_id;
  
  -- 1. Create a Demo Project
  INSERT INTO public.projects (id, owner_id, name, description, status, total_budget, progress, is_demo, created_at, updated_at)
  VALUES (
    v_project_id, 
    v_owner_id,
    'Residencial Villa - Phase 1', 
    'Projeto de demonstração para exibição das funcionalidades da plataforma.', 
    'in_progress', 
    500000.00, 
    35.5, 
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    is_demo = EXCLUDED.is_demo,
    progress = EXCLUDED.progress,
    total_budget = EXCLUDED.total_budget;

  -- 2. Create Vendors
  INSERT INTO public.vendors (id, name, email, phone, category, status)
  VALUES 
    (v_vendor_1_id, 'BuildCorp Supplies', 'contato@buildcorp.com', '+55 11 99999-1111', 'Material', 'active'),
    (v_vendor_2_id, 'StructEng Services', 'eng@structeng.com', '+55 11 99999-2222', 'Service', 'active')
  ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name;

  -- 3. Link Vendors to Project Partners
  INSERT INTO public.project_partners (project_id, vendor_id, role)
  VALUES 
    (v_project_id, v_vendor_1_id, 'Fornecedor de Materiais'),
    (v_project_id, v_vendor_2_id, 'Engenharia Estrutural')
  ON CONFLICT (project_id, vendor_id) DO NOTHING;

  -- 4. Create Project Budgets
  INSERT INTO public.project_budgets (id, project_id, category, estimated_amount, actual_amount, status)
  VALUES
    (gen_random_uuid(), v_project_id, 'Fundação', 50000.00, 48000.00, 'on_track'),
    (gen_random_uuid(), v_project_id, 'Estrutura', 120000.00, 125000.00, 'over_budget'),
    (gen_random_uuid(), v_project_id, 'Acabamento', 80000.00, 10000.00, 'on_track'),
    (gen_random_uuid(), v_project_id, 'Instalações Elétricas', 40000.00, 0.00, 'pending')
  ON CONFLICT DO NOTHING;

  -- 5. Create Project Compliance Documents
  INSERT INTO public.project_compliance (id, project_id, document_name, status, expiry_date)
  VALUES
    (gen_random_uuid(), v_project_id, 'Alvará de Construção', 'compliant', NOW() + INTERVAL '180 days'),
    (gen_random_uuid(), v_project_id, 'Licença Ambiental', 'expired', NOW() - INTERVAL '10 days'),
    (gen_random_uuid(), v_project_id, 'Seguro de Obra', 'compliant', NOW() + INTERVAL '30 days')
  ON CONFLICT DO NOTHING;

  -- 6. Create Invoices
  INSERT INTO public.invoices (id, project_id, vendor_id, amount, status, type, description, due_date)
  VALUES
    (gen_random_uuid(), v_project_id, v_vendor_1_id, 25000.00, 'paid', 'service', 'Materiais de Fundação', NOW() - INTERVAL '15 days'),
    (gen_random_uuid(), v_project_id, v_vendor_2_id, 15000.00, 'pending', 'service', 'Consultoria Estrutural', NOW() + INTERVAL '5 days'),
    (gen_random_uuid(), v_project_id, v_vendor_1_id, 30000.00, 'overdue', 'service', 'Concreto Usinado', NOW() - INTERVAL '2 days')
  ON CONFLICT DO NOTHING;

  -- 7. Create Project Updates
  INSERT INTO public.project_updates (id, project_id, title, description, photos, created_at)
  VALUES
    (gen_random_uuid(), v_project_id, 'Fundação Concluída', 'A fase de fundação foi finalizada com sucesso. Iniciando preparativos para a estrutura.', '["https://img.usecurling.com/p/600/400?q=construction%20foundation"]'::jsonb, NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), v_project_id, 'Início da Estrutura', 'Chegada dos materiais para início da montagem estrutural.', '["https://img.usecurling.com/p/600/400?q=construction%20structure"]'::jsonb, NOW() - INTERVAL '1 days')
  ON CONFLICT DO NOTHING;

END $$;
