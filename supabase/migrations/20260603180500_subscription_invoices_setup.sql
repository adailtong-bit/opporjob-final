-- Create an index to quickly lookup subscriptions by user and status
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_status ON public.invoices (payer_id, type, status);

-- Ensure RLS policies allow the user to view their own invoices 
-- (Dropping first ensures idempotency)
DROP POLICY IF EXISTS "invoices_select" ON public.invoices;

CREATE POLICY "invoices_select" ON public.invoices
  FOR SELECT TO public
  USING (
    (auth.uid() = payer_id) 
    OR (auth.uid() = receiver_id) 
    OR (is_admin() = true)
  );
