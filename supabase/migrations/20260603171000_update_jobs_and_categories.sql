DO $$
BEGIN
  -- Add listing_type to jobs to support product, service, and desapego flows
  ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS listing_type TEXT;

  -- Create storage bucket for job-photos
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('job-photos', 'job-photos', true)
  ON CONFLICT (id) DO NOTHING;

  -- Insert basic categories specifically requested
  INSERT INTO public.categories (id, name, slug, type, translation_key) VALUES
    ('cat-produtos', 'Produtos', 'produtos', 'product', 'category.produtos'),
    ('cat-servicos', 'Serviços', 'servicos', 'service', 'category.servicos'),
    ('cat-desapego', 'Desapego', 'desapego', 'desapego', 'category.desapego')
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own objects" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own objects" ON storage.objects;

-- Create policies for job-photos bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'job-photos');
CREATE POLICY "Authenticated Users can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'job-photos');
CREATE POLICY "Users can update their own objects" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'job-photos' AND owner = auth.uid());
CREATE POLICY "Users can delete their own objects" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'job-photos' AND owner = auth.uid());
