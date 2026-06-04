-- 1. Create a reliable seed user for testing
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin", "role": "contractor"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, -- Phone MUST be NULL to avoid unique constraint errors
      '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role, is_admin, entity_type)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Admin', 'contractor', true, 'individual')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- 2. Create favorites table for vendors
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, vendor_id)
);

-- RLS Policies for favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "favorites_select" ON public.favorites;
CREATE POLICY "favorites_select" ON public.favorites 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_insert" ON public.favorites;
CREATE POLICY "favorites_insert" ON public.favorites 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_delete" ON public.favorites;
CREATE POLICY "favorites_delete" ON public.favorites 
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
