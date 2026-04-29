CREATE TABLE IF NOT EXISTS public.marketing_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.marketing_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_marketing" ON public.marketing_content;
CREATE POLICY "public_read_marketing" ON public.marketing_content 
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "admin_all_marketing" ON public.marketing_content;
CREATE POLICY "admin_all_marketing" ON public.marketing_content 
  FOR ALL TO authenticated USING (is_admin());

INSERT INTO public.marketing_content (key, title, subtitle, features) VALUES (
  'login_page',
  'Build, renovate and innovate.',
  'Complete platform for projects, specialized professionals, tasks, opportunities, and construction site management.',
  '[{"title": "Specialized Professionals", "desc": "Find the best talent for your projects."}, {"title": "Tasks & Opportunities", "desc": "Manage every step with precision."}, {"title": "Construction Site Management", "desc": "Full control over your equipment and team."}]'::jsonb
) ON CONFLICT (key) DO NOTHING;
