CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    document TEXT,
    category TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vendors_select" ON public.vendors;
CREATE POLICY "vendors_select" ON public.vendors
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "vendors_insert" ON public.vendors;
CREATE POLICY "vendors_insert" ON public.vendors
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "vendors_update" ON public.vendors;
CREATE POLICY "vendors_update" ON public.vendors
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "vendors_delete" ON public.vendors;
CREATE POLICY "vendors_delete" ON public.vendors
  FOR DELETE TO authenticated USING (true);

-- Seed some initial vendors
INSERT INTO public.vendors (id, name, email, phone, category) VALUES
    ('11111111-1111-1111-1111-111111111111'::uuid, 'Cimento & Cia', 'contato@cimentoecia.com', '(11) 9999-9999', 'Materiais Básicos'),
    ('22222222-2222-2222-2222-222222222222'::uuid, 'Elétrica Avançada', 'vendas@eletrica.com', '(11) 8888-8888', 'Elétrica'),
    ('33333333-3333-3333-3333-333333333333'::uuid, 'Tintas e Cores', 'atendimento@tintas.com.br', '(11) 7777-7777', 'Acabamentos')
ON CONFLICT (id) DO NOTHING;
