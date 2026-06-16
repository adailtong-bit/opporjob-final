-- Add entity_type to vendors
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS entity_type text DEFAULT 'pj';

-- Ensure the ads bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('ads', 'ads', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for ads bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'ads');

DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
CREATE POLICY "Auth Insert" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'ads');

DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
CREATE POLICY "Auth Update" ON storage.objects 
  FOR UPDATE TO authenticated WITH CHECK (bucket_id = 'ads');

DO $DO_BLOCK$
BEGIN
  -- Ensure adailtong@gmail.com is admin
  UPDATE public.profiles 
  SET is_admin = true, role = 'admin' 
  WHERE email = 'adailtong@gmail.com';
END $DO_BLOCK$;
