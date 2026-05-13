CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_site_settings" ON public.site_settings;
CREATE POLICY "public_read_site_settings" ON public.site_settings 
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "admin_all_site_settings" ON public.site_settings;
CREATE POLICY "admin_all_site_settings" ON public.site_settings 
  FOR ALL TO authenticated USING (is_admin());

INSERT INTO public.site_settings (key, value) VALUES (
  'footer',
  '{"aboutUs": "We are a platform dedicated to bringing the best deals and opportunities to our users through geolocation.", "ourCompany": "OPPORJOB is a technology company focused on connecting local businesses with consumers.", "ourMission": "Our mission is to empower local commerce and help users save money on their everyday purchases.", "contactEmail": "contact@opporjob.com", "contactPhone": "+1 234 567 8900", "contactAddress": "123 Tech Street, Suite 456, City, Country", "copyright": "© 2026 OPPORJOB. All rights reserved."}'::jsonb
) ON CONFLICT (key) DO NOTHING;
