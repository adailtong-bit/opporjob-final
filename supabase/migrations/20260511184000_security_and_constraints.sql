-- Auditoria e Segurança - Ajuste de Restrições e RLS

DO $block$
BEGIN
    -- Projetos: Orçamento não pode ser negativo
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_project_budget_positive' AND conrelid = 'public.projects'::regclass
    ) THEN
        ALTER TABLE public.projects ADD CONSTRAINT check_project_budget_positive CHECK (total_budget >= 0);
    END IF;

    -- Materiais: Preço e Estoque não podem ser negativos
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_material_price_positive' AND conrelid = 'public.materials'::regclass
    ) THEN
        ALTER TABLE public.materials ADD CONSTRAINT check_material_price_positive CHECK (price >= 0);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_material_stock_positive' AND conrelid = 'public.materials'::regclass
    ) THEN
        ALTER TABLE public.materials ADD CONSTRAINT check_material_stock_positive CHECK (stock >= 0);
    END IF;

    -- Invoices: Valor não pode ser negativo
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_invoice_amount_positive' AND conrelid = 'public.invoices'::regclass
    ) THEN
        ALTER TABLE public.invoices ADD CONSTRAINT check_invoice_amount_positive CHECK (amount >= 0);
    END IF;
END $block$;

-- Reforço nas Políticas de RLS da tabela Invoices
DROP POLICY IF EXISTS "invoices_select" ON public.invoices;
CREATE POLICY "invoices_select" ON public.invoices 
FOR SELECT USING (
  auth.uid() = payer_id OR 
  auth.uid() = receiver_id OR 
  public.is_admin()
);

DROP POLICY IF EXISTS "invoices_insert" ON public.invoices;
CREATE POLICY "invoices_insert" ON public.invoices 
FOR INSERT WITH CHECK (
  (auth.uid() = payer_id OR auth.uid() = receiver_id OR public.is_admin()) AND
  amount >= 0
);

DROP POLICY IF EXISTS "invoices_update" ON public.invoices;
CREATE POLICY "invoices_update" ON public.invoices 
FOR UPDATE USING (
  (auth.uid() = payer_id OR auth.uid() = receiver_id OR public.is_admin())
) WITH CHECK (
  amount >= 0
);
