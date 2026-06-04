DO $$
DECLARE
  v_user_id uuid;
  v_project_id uuid;
  v_vendor_1 uuid;
  v_vendor_2 uuid;
BEGIN
  -- 1. Create or get user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
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
      '{"name": "Adailton Manager"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
    INSERT INTO public.profiles (id, email, name, role, is_admin)
    VALUES (v_user_id, 'adailtong@gmail.com', 'Adailton Manager', 'contractor', true)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com';
  END IF;

  -- 2. Create or get project
  SELECT id INTO v_project_id FROM public.projects WHERE name = 'Residencial Aurora - Demo' AND owner_id = v_user_id LIMIT 1;
  IF v_project_id IS NULL THEN
    v_project_id := gen_random_uuid();
    INSERT INTO public.projects (id, owner_id, name, description, status, total_budget, progress, is_demo)
    VALUES (v_project_id, v_user_id, 'Residencial Aurora - Demo', 'Projeto de construção de edifício residencial.', 'in_progress', 1500000, 35, true);
  END IF;

  -- 3. Create or get vendors
  SELECT id INTO v_vendor_1 FROM public.vendors WHERE name = 'Construtora Alfa' AND owner_id = v_user_id LIMIT 1;
  IF v_vendor_1 IS NULL THEN
    v_vendor_1 := gen_random_uuid();
    INSERT INTO public.vendors (id, owner_id, name, email, category) VALUES (v_vendor_1, v_user_id, 'Construtora Alfa', 'alfa@example.com', 'Empreiteira');
  END IF;

  SELECT id INTO v_vendor_2 FROM public.vendors WHERE name = 'Elétrica Beta' AND owner_id = v_user_id LIMIT 1;
  IF v_vendor_2 IS NULL THEN
    v_vendor_2 := gen_random_uuid();
    INSERT INTO public.vendors (id, owner_id, name, email, category) VALUES (v_vendor_2, v_user_id, 'Elétrica Beta', 'beta@example.com', 'Elétrica');
  END IF;

  -- 4. Seed project_budgets
  IF NOT EXISTS (SELECT 1 FROM public.project_budgets WHERE project_id = v_project_id AND category = 'Fundação') THEN
    INSERT INTO public.project_budgets (project_id, category, estimated_amount, actual_amount, status) VALUES
    (v_project_id, 'Fundação', 150000, 155000, 'over_budget'),
    (v_project_id, 'Estrutura', 400000, 380000, 'under_budget'),
    (v_project_id, 'Acabamento', 300000, 100000, 'on_track');
  END IF;

  -- 5. Seed project_compliance
  IF NOT EXISTS (SELECT 1 FROM public.project_compliance WHERE project_id = v_project_id AND document_name = 'Alvará de Construção') THEN
    INSERT INTO public.project_compliance (project_id, document_name, status, expiry_date, file_url) VALUES
    (v_project_id, 'Alvará de Construção', 'compliant', NOW() + INTERVAL '180 days', 'https://example.com/doc1.pdf'),
    (v_project_id, 'Seguro de Obra', 'compliant', NOW() + INTERVAL '30 days', 'https://example.com/doc2.pdf'),
    (v_project_id, 'Licença Ambiental', 'expired', NOW() - INTERVAL '10 days', 'https://example.com/doc3.pdf');
  END IF;

  -- 6. Seed project_partners
  IF NOT EXISTS (SELECT 1 FROM public.project_partners WHERE project_id = v_project_id AND vendor_id = v_vendor_1) THEN
    INSERT INTO public.project_partners (project_id, vendor_id, role) VALUES
    (v_project_id, v_vendor_1, 'Empreiteiro Principal'),
    (v_project_id, v_vendor_2, 'Subempreiteiro de Elétrica');
  END IF;

  -- 7. Seed project_updates
  IF NOT EXISTS (SELECT 1 FROM public.project_updates WHERE project_id = v_project_id AND title = 'Início da Terraplanagem') THEN
    INSERT INTO public.project_updates (project_id, title, description, photos) VALUES
    (v_project_id, 'Início da Terraplanagem', 'Começamos a limpeza e preparação do terreno.', '["https://img.usecurling.com/p/800/600?q=excavator"]'),
    (v_project_id, 'Conclusão da Laje do 1º Pavimento', 'A concretagem foi finalizada com sucesso.', '["https://img.usecurling.com/p/800/600?q=concrete"]');
  END IF;

  -- 8. Seed invoices
  IF NOT EXISTS (SELECT 1 FROM public.invoices WHERE project_id = v_project_id AND description = 'Fatura de Fundação') THEN
    INSERT INTO public.invoices (project_id, payer_id, receiver_id, vendor_id, amount, status, type, description, due_date) VALUES
    (v_project_id, v_user_id, v_user_id, v_vendor_1, 50000, 'paid', 'service', 'Fatura de Fundação', NOW() - INTERVAL '5 days'),
    (v_project_id, v_user_id, v_user_id, v_vendor_2, 12000, 'pending', 'service', 'Fatura Parcial Elétrica', NOW() + INTERVAL '10 days'),
    (v_project_id, v_user_id, v_user_id, v_vendor_1, 35000, 'overdue', 'service', 'Fatura de Estrutura', NOW() - INTERVAL '2 days');
  END IF;

END $$;

-- Ensure RLS is active and correct
ALTER TABLE public.project_budgets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_read_project_budgets" ON public.project_budgets;
CREATE POLICY "auth_read_project_budgets" ON public.project_budgets FOR SELECT TO authenticated USING (true);

ALTER TABLE public.project_compliance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_read_project_compliance" ON public.project_compliance;
CREATE POLICY "auth_read_project_compliance" ON public.project_compliance FOR SELECT TO authenticated USING (true);

ALTER TABLE public.project_partners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_read_project_partners" ON public.project_partners;
CREATE POLICY "auth_read_project_partners" ON public.project_partners FOR SELECT TO authenticated USING (true);

ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_read_project_updates" ON public.project_updates;
CREATE POLICY "auth_read_project_updates" ON public.project_updates FOR SELECT TO authenticated USING (true);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_read_invoices" ON public.invoices;
CREATE POLICY "auth_read_invoices" ON public.invoices FOR SELECT TO authenticated USING (
  auth.uid() = payer_id OR auth.uid() = receiver_id OR
  EXISTS (SELECT 1 FROM public.projects WHERE id = invoices.project_id AND owner_id = auth.uid()) OR is_admin()
);
