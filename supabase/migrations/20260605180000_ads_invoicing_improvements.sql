DO $$
BEGIN
  ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS financial_email TEXT;
END $$;

DO $$
BEGIN
  INSERT INTO public.site_settings (key, value)
  VALUES (
    'ads_pricing_matrix',
    '{
      "tiers": [
        {"id": "1", "name": "Basic", "basePrice": 100},
        {"id": "2", "name": "Silver", "basePrice": 250},
        {"id": "3", "name": "Gold", "basePrice": 500},
        {"id": "4", "name": "Platinum", "basePrice": 1000}
      ],
      "regions": [
        {"id": "1", "name": "Brazil (BR)", "multiplier": 1.0},
        {"id": "2", "name": "United States (US)", "multiplier": 1.5},
        {"id": "3", "name": "Global", "multiplier": 2.0}
      ],
      "categories": [
        {"id": "1", "name": "Construction", "multiplier": 1.2},
        {"id": "2", "name": "Technology", "multiplier": 1.5},
        {"id": "3", "name": "Maintenance", "multiplier": 1.0}
      ]
    }'::jsonb
  )
  ON CONFLICT (key) DO NOTHING;
END $$;

CREATE OR REPLACE FUNCTION public.handle_ad_completion()
RETURNS trigger AS $$
DECLARE
  v_vendor RECORD;
  v_admin_id UUID;
  v_region TEXT;
BEGIN
  IF OLD.status NOT IN ('completed', 'expired') AND NEW.status IN ('completed', 'expired') THEN
    
    SELECT owner_id INTO v_vendor FROM public.vendors WHERE id = NEW.advertiser_id;
    
    SELECT id INTO v_admin_id FROM public.profiles WHERE is_admin = true LIMIT 1;
    
    v_region := COALESCE(NEW.specifications->>'region', 'Global');
    
    IF v_vendor.owner_id IS NOT NULL THEN
      INSERT INTO public.invoices (
        job_id,
        project_id,
        payer_id,
        receiver_id,
        vendor_id,
        amount,
        status,
        type,
        currency,
        description,
        due_date
      ) VALUES (
        NULL,
        NULL,
        v_vendor.owner_id,
        v_admin_id,
        NEW.advertiser_id,
        NEW.price,
        'pending',
        'advertising',
        'USD',
        'Advertising Campaign: ' || NEW.title || ' | Period: ' || COALESCE(NEW.start_date::date::text, 'N/A') || ' to ' || COALESCE(NEW.end_date::date::text, 'N/A') || ' | Tier: ' || COALESCE(NEW.tier, 'N/A') || ' | Region: ' || v_region,
        NOW() + INTERVAL '15 days'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_ad_completed ON public.advertising_campaigns;
CREATE TRIGGER on_ad_completed
AFTER UPDATE OF status ON public.advertising_campaigns
FOR EACH ROW EXECUTE FUNCTION public.handle_ad_completion();

DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_net;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'pg_net extension not available, automated emails might not trigger silently.';
END $$;

CREATE OR REPLACE FUNCTION public.trigger_invoice_email_webhook()
RETURNS trigger AS $$
DECLARE
  v_url TEXT := 'https://yhyiwrerqojrqjvlumov.supabase.co/functions/v1/send-invoice-email';
  v_payload JSONB;
  v_req_id BIGINT;
BEGIN
  IF NEW.type = 'advertising' THEN
    v_payload := jsonb_build_object(
      'record', to_jsonb(NEW),
      'type', 'INSERT'
    );
    
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
      BEGIN
        SELECT net.http_post(
          url := v_url,
          headers := '{"Content-Type": "application/json"}'::jsonb,
          body := v_payload
        ) INTO v_req_id;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Failed to invoke webhook for email';
      END;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_invoice_created_email ON public.invoices;
CREATE TRIGGER on_invoice_created_email
AFTER INSERT ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.trigger_invoice_email_webhook();
