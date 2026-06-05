-- Create advertising_campaigns table
CREATE TABLE IF NOT EXISTS public.advertising_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  media_url TEXT,
  target_url TEXT,
  status TEXT DEFAULT 'draft',
  tier TEXT,
  specifications JSONB DEFAULT '{}'::jsonb,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  price NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.advertising_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_advertising_campaigns" ON public.advertising_campaigns;
CREATE POLICY "admin_all_advertising_campaigns" ON public.advertising_campaigns
  FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "public_read_advertising_campaigns" ON public.advertising_campaigns;
CREATE POLICY "public_read_advertising_campaigns" ON public.advertising_campaigns
  FOR SELECT TO public USING (status = 'active');

-- Initialize site_settings
INSERT INTO public.site_settings (key, value)
VALUES (
  'ads_pricing_matrix',
  '{"tiers": {"Bronze": 50, "Silver": 100, "Gold": 200, "Premium": 500}, "regions": {"BR": 1, "US": 1.5, "Other": 1.2}, "categories": {"Construction": 1.5, "Maintenance": 1.2, "Cleaning": 1.0, "Technology": 2.0}}'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- Seed Advertiser and Ad
DO $$
DECLARE
  v_advertiser_id UUID := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.vendors WHERE email = 'ads@example.com') THEN
    INSERT INTO public.vendors (id, name, email, phone, document, category, status, street, city, state, zip_code, bank_data)
    VALUES (
      v_advertiser_id,
      'Acme Corp Advertisements',
      'ads@example.com',
      '+15551234567',
      '12-3456789',
      'advertiser',
      'active',
      '123 Main St',
      'New York',
      'NY',
      '10001',
      '{"bank": "Chase", "agency": "001", "account": "123456-7"}'::jsonb
    );

    INSERT INTO public.advertising_campaigns (advertiser_id, title, media_url, target_url, status, tier, start_date, end_date, price, specifications)
    VALUES (
      v_advertiser_id,
      'Summer Sale 2026',
      'https://img.usecurling.com/p/800/400?q=summer',
      'https://example.com/sale',
      'active',
      'Premium',
      NOW(),
      NOW() + INTERVAL '30 days',
      500.00,
      '{"region": "US", "category": "Technology", "segment": "all", "width": "1080", "height": "1080"}'::jsonb
    );
  END IF;
END $$;
