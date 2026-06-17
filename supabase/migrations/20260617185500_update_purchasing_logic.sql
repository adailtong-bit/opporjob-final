-- 1. Seed initial user
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, is_admin)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- 2. Setup permissive RLS for purchase orders
DO $$
BEGIN
  DROP POLICY IF EXISTS "auth_insert_purchase_orders" ON public.purchase_orders;
  DROP POLICY IF EXISTS "auth_select_purchase_orders" ON public.purchase_orders;
  DROP POLICY IF EXISTS "auth_update_purchase_orders" ON public.purchase_orders;
  DROP POLICY IF EXISTS "purchase_orders_delete" ON public.purchase_orders;
  DROP POLICY IF EXISTS "purchase_orders_insert" ON public.purchase_orders;
  DROP POLICY IF EXISTS "purchase_orders_select" ON public.purchase_orders;
  DROP POLICY IF EXISTS "purchase_orders_update" ON public.purchase_orders;

  CREATE POLICY "auth_insert_purchase_orders" ON public.purchase_orders
    FOR INSERT TO authenticated WITH CHECK (true);

  CREATE POLICY "auth_select_purchase_orders" ON public.purchase_orders
    FOR SELECT TO authenticated USING (true);

  CREATE POLICY "auth_update_purchase_orders" ON public.purchase_orders
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
    
  DROP POLICY IF EXISTS "auth_insert_purchase_order_items" ON public.purchase_order_items;
  DROP POLICY IF EXISTS "auth_select_purchase_order_items" ON public.purchase_order_items;
  DROP POLICY IF EXISTS "auth_update_purchase_order_items" ON public.purchase_order_items;
  DROP POLICY IF EXISTS "purchase_order_items_delete" ON public.purchase_order_items;
  DROP POLICY IF EXISTS "purchase_order_items_insert" ON public.purchase_order_items;
  DROP POLICY IF EXISTS "purchase_order_items_select" ON public.purchase_order_items;
  DROP POLICY IF EXISTS "purchase_order_items_update" ON public.purchase_order_items;

  CREATE POLICY "auth_insert_purchase_order_items" ON public.purchase_order_items
    FOR INSERT TO authenticated WITH CHECK (true);

  CREATE POLICY "auth_select_purchase_order_items" ON public.purchase_order_items
    FOR SELECT TO authenticated USING (true);
END $$;

-- 3. Create or Replace the confirm_purchase_delivery RPC
CREATE OR REPLACE FUNCTION public.confirm_purchase_delivery(p_order_id uuid)
RETURNS void AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
BEGIN
  -- Get order
  SELECT * INTO v_order FROM public.purchase_orders WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF v_order.status = 'delivered' THEN
    RETURN; -- Already delivered
  END IF;

  -- Update status
  UPDATE public.purchase_orders SET status = 'delivered' WHERE id = p_order_id;

  -- Insert invoice
  INSERT INTO public.invoices (
    project_id,
    payer_id,
    vendor_id,
    amount,
    status,
    type,
    currency,
    description,
    due_date
  ) VALUES (
    v_order.project_id,
    v_order.requester_id,
    v_order.vendor_id,
    v_order.total_amount,
    'paid',
    'material_purchase',
    'USD',
    'Material purchase delivery - Order #' || substring(p_order_id::text from 1 for 8),
    NOW()
  );

  -- Decrease material stock
  FOR v_item IN SELECT * FROM public.purchase_order_items WHERE purchase_order_id = p_order_id LOOP
    IF v_item.material_id IS NOT NULL AND v_item.material_id != '' THEN
      BEGIN
        UPDATE public.materials 
        SET stock = GREATEST(stock - v_item.quantity, 0)
        WHERE id = v_item.material_id::uuid;
      EXCEPTION WHEN invalid_text_representation THEN
        -- ignore invalid uuid
      END;
    END IF;
  END LOOP;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
