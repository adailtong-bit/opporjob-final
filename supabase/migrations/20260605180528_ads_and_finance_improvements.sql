DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Seed user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, is_admin)
    VALUES (v_user_id, 'adailtong@gmail.com', 'Administrator', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Add company_name and tax_id to vendors if not exists
  ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS company_name text;
  ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS tax_id text;
  
  -- Site settings
  INSERT INTO public.site_settings (key, value)
  VALUES (
    'ads_pricing_matrix',
    '{"tiers": {"Tier 1 (Premium)": 500, "Tier 2 (Standard)": 200, "Tier 3 (Basic)": 50}, "regions": {"Global": 1.5, "National": 1.2, "Local": 1.0}, "categories": {"Technology": 2.0, "Construction": 1.5, "Maintenance": 1.2, "General": 1.0}}'::jsonb
  ) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

  INSERT INTO public.site_settings (key, value)
  VALUES (
    'ads_categories',
    '["Technology", "Construction", "Maintenance", "General", "Advertising"]'::jsonb
  ) ON CONFLICT (key) DO NOTHING;
END $$;

CREATE OR REPLACE FUNCTION public.handle_ad_completion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_vendor RECORD;
  v_admin_id UUID;
  v_region TEXT;
  v_tier TEXT;
  v_category TEXT;
BEGIN
  IF OLD.status NOT IN ('completed', 'expired') AND NEW.status IN ('completed', 'expired') THEN
    
    SELECT * INTO v_vendor FROM public.vendors WHERE id = NEW.advertiser_id;
    
    SELECT id INTO v_admin_id FROM public.profiles WHERE is_admin = true LIMIT 1;
    
    v_region := COALESCE(NEW.specifications->>'region', 'Global');
    v_category := COALESCE(NEW.specifications->>'category', 'General');
    v_tier := COALESCE(NEW.tier, 'N/A');
    
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
        'Campaign: ' || NEW.title || ' | Period: ' || COALESCE(NEW.start_date::date::text, 'N/A') || ' to ' || COALESCE(NEW.end_date::date::text, 'N/A') || ' | Tier: ' || v_tier || ' | Category: ' || v_category,
        NOW() + INTERVAL '15 days'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;
