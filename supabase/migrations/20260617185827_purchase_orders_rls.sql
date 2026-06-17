DO $$
BEGIN
  DROP POLICY IF EXISTS "auth_insert_purchase_orders" ON public.purchase_orders;
  DROP POLICY IF EXISTS "auth_select_purchase_orders" ON public.purchase_orders;
  DROP POLICY IF EXISTS "auth_update_purchase_orders" ON public.purchase_orders;
  DROP POLICY IF EXISTS "auth_insert_purchase_order_items" ON public.purchase_order_items;
  DROP POLICY IF EXISTS "auth_select_purchase_order_items" ON public.purchase_order_items;
END $$;

CREATE POLICY "auth_insert_purchase_orders" ON public.purchase_orders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "auth_select_purchase_orders" ON public.purchase_orders
  FOR SELECT TO authenticated USING (
    auth.uid() = requester_id OR 
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_id AND projects.owner_id = auth.uid())
  );

CREATE POLICY "auth_update_purchase_orders" ON public.purchase_orders
  FOR UPDATE TO authenticated USING (
    auth.uid() = requester_id OR 
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_id AND projects.owner_id = auth.uid())
  );

CREATE POLICY "auth_insert_purchase_order_items" ON public.purchase_order_items
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.purchase_orders 
      WHERE purchase_orders.id = purchase_order_id AND purchase_orders.requester_id = auth.uid()
    )
  );

CREATE POLICY "auth_select_purchase_order_items" ON public.purchase_order_items
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.purchase_orders 
      WHERE purchase_orders.id = purchase_order_id AND (
        purchase_orders.requester_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM public.projects WHERE projects.id = purchase_orders.project_id AND projects.owner_id = auth.uid())
      )
    )
  );
