CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.project_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    estimated_amount NUMERIC NOT NULL DEFAULT 0,
    actual_amount NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    document_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    expiry_date TIMESTAMPTZ,
    file_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_partners (
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (project_id, vendor_id)
);

-- Enable RLS
ALTER TABLE public.project_budgets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "project_budgets_all" ON public.project_budgets;
CREATE POLICY "project_budgets_all" ON public.project_budgets FOR ALL USING (true);

ALTER TABLE public.project_compliance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "project_compliance_all" ON public.project_compliance;
CREATE POLICY "project_compliance_all" ON public.project_compliance FOR ALL USING (true);

ALTER TABLE public.project_partners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "project_partners_all" ON public.project_partners;
CREATE POLICY "project_partners_all" ON public.project_partners FOR ALL USING (true);

-- Seed Professional Demo Data
DO $$
DECLARE
    v_user_id UUID;
    v_project_id UUID := '11111111-1111-1111-1111-111111111111'::uuid;
    v_vendor1_id UUID := '22222222-2222-2222-2222-222222222221'::uuid;
    v_vendor2_id UUID := '22222222-2222-2222-2222-222222222222'::uuid;
    v_vendor3_id UUID := '22222222-2222-2222-2222-222222222223'::uuid;
BEGIN
    -- Ensure User adailtong@gmail.com exists
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
            v_user_id, '00000000-0000-0000-0000-000000000000', 'adailtong@gmail.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
            '{"provider": "email", "providers": ["email"]}', '{"name": "Adailton"}', false, 'authenticated', 'authenticated',
            '', '', '', '', '', NULL, '', '', ''
        );
    END IF;

    INSERT INTO public.profiles (id, email, name, role) 
    VALUES (v_user_id, 'adailtong@gmail.com', 'Adailton', 'admin') 
    ON CONFLICT (id) DO UPDATE SET is_admin = true;

    -- Seed Project
    INSERT INTO public.projects (id, owner_id, name, description, status, total_budget, progress, is_demo)
    VALUES (v_project_id, v_user_id, 'Residencial Alphaville (DEMO)', 'Construção de residência de alto padrão (Fase de Fundação/Estrutura)', 'in_progress', 1500000, 35, true)
    ON CONFLICT (id) DO UPDATE SET is_demo = true, status = 'in_progress', progress = 35;

    -- Seed Vendors
    INSERT INTO public.vendors (id, name, category, status, email, phone) VALUES
    (v_vendor1_id, 'Construtora Alfa', 'Construção Civil', 'active', 'contato@alfa.com', '(11) 99999-1111'),
    (v_vendor2_id, 'Elétrica Luz', 'Instalações Elétricas', 'active', 'vendas@eletricaluz.com', '(11) 98888-2222'),
    (v_vendor3_id, 'Hidráulica Água Boa', 'Instalações Hidráulicas', 'active', 'orcamento@aguaboa.com', '(11) 97777-3333')
    ON CONFLICT (id) DO NOTHING;

    -- Clean up related entities for idempotency
    DELETE FROM public.project_partners WHERE project_id = v_project_id;
    DELETE FROM public.project_budgets WHERE project_id = v_project_id;
    DELETE FROM public.project_compliance WHERE project_id = v_project_id;
    DELETE FROM public.invoices WHERE project_id = v_project_id;

    -- Project Partners
    INSERT INTO public.project_partners (project_id, vendor_id, role) VALUES
    (v_project_id, v_vendor1_id, 'Empreiteiro Principal'),
    (v_project_id, v_vendor2_id, 'Instalações Elétricas'),
    (v_project_id, v_vendor3_id, 'Instalações Hidráulicas');

    -- Project Budgets
    INSERT INTO public.project_budgets (project_id, category, estimated_amount, actual_amount, status) VALUES
    (v_project_id, 'Fundação', 150000, 155000, 'over_budget'),
    (v_project_id, 'Estrutura', 400000, 390000, 'on_track'),
    (v_project_id, 'Elétrica', 80000, 20000, 'pending'),
    (v_project_id, 'Hidráulica', 60000, 15000, 'pending'),
    (v_project_id, 'Acabamento', 300000, 0, 'pending');

    -- Project Compliance
    INSERT INTO public.project_compliance (project_id, document_name, status, expiry_date) VALUES
    (v_project_id, 'Alvará de Construção', 'compliant', NOW() + INTERVAL '180 days'),
    (v_project_id, 'Licença Ambiental', 'expired', NOW() - INTERVAL '10 days'),
    (v_project_id, 'Seguro de Obra (Risco de Engenharia)', 'compliant', NOW() + INTERVAL '300 days');

    -- Invoices
    INSERT INTO public.invoices (project_id, payer_id, amount, status, description, type, due_date) VALUES
    (v_project_id, v_user_id, 50000, 'paid', 'Pagamento 1 - Fundação', 'service', NOW() - INTERVAL '30 days'),
    (v_project_id, v_user_id, 105000, 'paid', 'Pagamento 2 - Fundação Final', 'service', NOW() - INTERVAL '15 days'),
    (v_project_id, v_user_id, 80000, 'pending', 'Sinal - Estrutura Metálica', 'service', NOW() + INTERVAL '5 days'),
    (v_project_id, v_user_id, 20000, 'overdue', 'Materiais Elétricos - Fase 1', 'material', NOW() - INTERVAL '2 days');

END $$;
