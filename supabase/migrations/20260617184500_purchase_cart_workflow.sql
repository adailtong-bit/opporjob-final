DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('purchase_receipts', 'purchase_receipts', true)
    ON CONFLICT (id) DO NOTHING;
END $$;

DROP POLICY IF EXISTS "Give public access to purchase receipts" ON storage.objects;
CREATE POLICY "Give public access to purchase receipts" ON storage.objects FOR SELECT USING (bucket_id = 'purchase_receipts');

DROP POLICY IF EXISTS "Allow authenticated uploads to purchase receipts" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to purchase receipts" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'purchase_receipts');

DROP POLICY IF EXISTS "Allow authenticated updates to purchase receipts" ON storage.objects;
CREATE POLICY "Allow authenticated updates to purchase receipts" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'purchase_receipts');

CREATE OR REPLACE FUNCTION public.confirm_purchase_delivery(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order record;
    v_item record;
BEGIN
    SELECT * INTO v_order FROM public.purchase_orders WHERE id = p_order_id;
    
    IF v_order.id IS NULL THEN
        RAISE EXCEPTION 'Order not found';
    END IF;

    IF v_order.status = 'delivered' THEN
        RETURN;
    END IF;

    -- Update order status
    UPDATE public.purchase_orders SET status = 'delivered', updated_at = NOW() WHERE id = p_order_id;

    -- Update stock for each item
    FOR v_item IN SELECT * FROM public.purchase_order_items WHERE purchase_order_id = p_order_id LOOP
        IF v_item.material_id IS NOT NULL THEN
            UPDATE public.materials 
            SET stock = COALESCE(stock, 0) + v_item.quantity
            WHERE id = v_item.material_id::uuid;
        END IF;
    END LOOP;

    -- Create invoice for the project ledger
    INSERT INTO public.invoices (
        project_id,
        payer_id,
        amount,
        status,
        type,
        description,
        receipt_url,
        created_at,
        updated_at,
        payment_date
    ) VALUES (
        v_order.project_id,
        v_order.requester_id,
        v_order.total_amount,
        'paid',
        'material_purchase',
        'Material Purchase Order #' || SUBSTRING(p_order_id::text FROM 1 FOR 8),
        v_order.receipt_url,
        NOW(),
        NOW(),
        NOW()
    );
END;
$;
