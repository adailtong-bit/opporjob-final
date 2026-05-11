-- Add new corporate and logistical fields to vendors table
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS street text;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS number text;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS neighborhood text;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS zip_code text;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS pix_key text;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS bank_data jsonb DEFAULT '{}'::jsonb;

-- Add Accounts Payable tracking fields to invoices table
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_date timestamp with time zone;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS receipt_url text;

-- Seed mock data to show the new Payables feature
DO $$
DECLARE
  mock_vendor_id uuid;
  current_user_id uuid;
BEGIN
  SELECT id INTO current_user_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;

  IF current_user_id IS NOT NULL THEN
    -- Check if we already seeded this mock vendor to keep idempotent
    IF NOT EXISTS (SELECT 1 FROM public.vendors WHERE document = '12.345.678/0001-90') THEN
      mock_vendor_id := gen_random_uuid();
      INSERT INTO public.vendors (id, name, email, phone, document, category, website, street, pix_key)
      VALUES (
        mock_vendor_id, 'Distribuidora Premium S/A', 'vendas@premium.com', '(11) 99999-9999', '12.345.678/0001-90', 'Materiais Elétricos', 'www.premium.com', 'Avenida Principal, 123', 'CNPJ: 12.345.678/0001-90'
      );

      -- Insert mock payables (invoices) linked to this vendor
      INSERT INTO public.invoices (id, payer_id, vendor_id, amount, status, description, type, due_date, payment_date)
      VALUES 
      (gen_random_uuid(), current_user_id, mock_vendor_id, 4500.00, 'pending', 'Fatura #001 - Fios e Cabos', 'payable', NOW() + INTERVAL '10 days', NULL),
      (gen_random_uuid(), current_user_id, mock_vendor_id, 1200.50, 'paid', 'Fatura #002 - Disjuntores', 'payable', NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days'),
      (gen_random_uuid(), current_user_id, mock_vendor_id, 890.00, 'processing', 'Fatura #003 - Conexões', 'payable', NOW() + INTERVAL '2 days', NULL);
    END IF;
  END IF;
END $$;
