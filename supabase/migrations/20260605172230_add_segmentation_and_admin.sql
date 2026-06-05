DO $$
BEGIN
  ALTER TABLE public.construction_plans ADD COLUMN IF NOT EXISTS entity_type text DEFAULT 'both';
  ALTER TABLE public.construction_plans ADD COLUMN IF NOT EXISTS target_audience text DEFAULT 'both';
END $$;

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
      new_user_id, '00000000-0000-0000-0000-000000000000', 'adailtong@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Admin", "role": "admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, is_admin, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Admin Adailton', true, 'admin')
    ON CONFLICT (id) DO UPDATE SET is_admin = true, role = 'admin';
  ELSE
    UPDATE public.profiles SET is_admin = true, role = 'admin' WHERE email = 'adailtong@gmail.com';
  END IF;
END $$;

-- Ensure RLS on invoices
DROP POLICY IF EXISTS "admin_all_invoices" ON public.invoices;
CREATE POLICY "admin_all_invoices" ON public.invoices FOR ALL TO authenticated USING (public.is_admin() = true);

DROP POLICY IF EXISTS "auth_read_invoices" ON public.invoices;
CREATE POLICY "auth_read_invoices" ON public.invoices FOR SELECT TO authenticated
  USING (
    auth.uid() = payer_id OR auth.uid() = receiver_id OR public.is_admin() = true
  );

DROP POLICY IF EXISTS "invoices_insert" ON public.invoices;
CREATE POLICY "invoices_insert" ON public.invoices FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = payer_id OR auth.uid() = receiver_id OR public.is_admin() = true);

DROP POLICY IF EXISTS "invoices_update" ON public.invoices;
CREATE POLICY "invoices_update" ON public.invoices FOR UPDATE TO authenticated
  USING (auth.uid() = payer_id OR auth.uid() = receiver_id OR public.is_admin() = true);

-- Construction plans RLS
DROP POLICY IF EXISTS "admin_all_cplans" ON public.construction_plans;
CREATE POLICY "admin_all_cplans" ON public.construction_plans FOR ALL TO authenticated
  USING (public.is_admin() = true) WITH CHECK (public.is_admin() = true);

DROP POLICY IF EXISTS "public_read_cplans" ON public.construction_plans;
CREATE POLICY "public_read_cplans" ON public.construction_plans FOR SELECT TO public USING (true);
