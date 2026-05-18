INSERT INTO public.site_settings (key, value) 
VALUES ('category_mappings', '[]'::jsonb) 
ON CONFLICT (key) DO NOTHING;
