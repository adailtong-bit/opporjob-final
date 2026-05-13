DO $$
BEGIN
  -- Create construction_plans table to equalize the plans globally
  CREATE TABLE IF NOT EXISTS public.construction_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    billing_cycle TEXT NOT NULL DEFAULT 'monthly',
    max_projects INTEGER,
    work_size TEXT,
    complexity TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    active BOOLEAN DEFAULT true,
    target_audience TEXT DEFAULT 'contractor',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Create invoices table to manage billing dynamically
  CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID,
    project_id UUID,
    task_id TEXT,
    payer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending',
    description TEXT,
    type TEXT DEFAULT 'service',
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
END $$;

ALTER TABLE public.construction_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_cplans" ON public.construction_plans;
CREATE POLICY "public_read_cplans" ON public.construction_plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_all_cplans" ON public.construction_plans;
CREATE POLICY "admin_all_cplans" ON public.construction_plans 
  USING (is_admin() = true) WITH CHECK (is_admin() = true);

DROP POLICY IF EXISTS "invoices_select" ON public.invoices;
CREATE POLICY "invoices_select" ON public.invoices FOR SELECT 
  USING (auth.uid() = payer_id OR auth.uid() = receiver_id OR is_admin() = true);

DROP POLICY IF EXISTS "invoices_insert" ON public.invoices;
CREATE POLICY "invoices_insert" ON public.invoices FOR INSERT 
  WITH CHECK (auth.uid() = payer_id OR auth.uid() = receiver_id OR is_admin() = true);

DROP POLICY IF EXISTS "invoices_update" ON public.invoices;
CREATE POLICY "invoices_update" ON public.invoices FOR UPDATE 
  USING (auth.uid() = payer_id OR auth.uid() = receiver_id OR is_admin() = true);

DO $$
BEGIN
  -- Equalizing default options
  INSERT INTO public.construction_plans (id, name, description, price, billing_cycle, max_projects, work_size, complexity, features, target_audience)
  VALUES 
    ('11111111-1111-1111-1111-111111111111'::uuid, 'Basic', 'For small contractors', 99.00, 'monthly', 3, 'Small', 'Low', '["Task Management", "Daily Logs"]', 'contractor'),
    ('22222222-2222-2222-2222-222222222222'::uuid, 'Professional', 'For mid-size companies', 299.00, 'monthly', 10, 'Medium', 'Medium', '["Task Management", "Daily Logs", "Financials"]', 'contractor'),
    ('33333333-3333-3333-3333-333333333333'::uuid, 'Advanced', 'For large constructors', 599.00, 'monthly', 50, 'Large', 'High', '["Task Management", "Daily Logs", "Financials", "Advanced Reports"]', 'contractor'),
    ('44444444-4444-4444-4444-444444444444'::uuid, 'Enterprise', 'Unlimited', 999.00, 'monthly', 999, 'All', 'High', '["All features", "Dedicated Support"]', 'contractor')
  ON CONFLICT DO NOTHING;
END $$;
