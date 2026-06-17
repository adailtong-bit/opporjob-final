-- Add dependency and approval_status to project_stages
ALTER TABLE public.project_stages ADD COLUMN IF NOT EXISTS dependency_id UUID REFERENCES public.project_stages(id);
ALTER TABLE public.project_stages ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'tech_approved', 'finance_approved', 'completed'));

-- Add retention fields to invoices
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS retention_amount NUMERIC DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS is_retention_release BOOLEAN DEFAULT FALSE;

-- Add retention percentage to projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS retention_percentage NUMERIC DEFAULT 0;

-- Create purchase_orders
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES public.profiles(id),
  manager_id UUID REFERENCES public.profiles(id),
  finance_id UUID REFERENCES public.profiles(id),
  vendor_id UUID REFERENCES public.vendors(id),
  status TEXT DEFAULT 'pending_manager' CHECK (status IN ('pending_manager', 'pending_finance', 'ordered', 'delivered', 'cancelled', 'rejected')),
  total_amount NUMERIC DEFAULT 0,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create purchase_order_items
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  material_id TEXT,
  material_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL
);

-- RLS for purchase_orders
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "purchase_orders_select" ON public.purchase_orders;
CREATE POLICY "purchase_orders_select" ON public.purchase_orders FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "purchase_orders_insert" ON public.purchase_orders;
CREATE POLICY "purchase_orders_insert" ON public.purchase_orders FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "purchase_orders_update" ON public.purchase_orders;
CREATE POLICY "purchase_orders_update" ON public.purchase_orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "purchase_orders_delete" ON public.purchase_orders;
CREATE POLICY "purchase_orders_delete" ON public.purchase_orders FOR DELETE TO authenticated USING (true);

-- RLS for purchase_order_items
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "purchase_order_items_select" ON public.purchase_order_items;
CREATE POLICY "purchase_order_items_select" ON public.purchase_order_items FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "purchase_order_items_insert" ON public.purchase_order_items;
CREATE POLICY "purchase_order_items_insert" ON public.purchase_order_items FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "purchase_order_items_update" ON public.purchase_order_items;
CREATE POLICY "purchase_order_items_update" ON public.purchase_order_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "purchase_order_items_delete" ON public.purchase_order_items;
CREATE POLICY "purchase_order_items_delete" ON public.purchase_order_items FOR DELETE TO authenticated USING (true);
