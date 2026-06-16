-- Migration file for admin settings and master user
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state_registration TEXT;

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Seed adailtong@gmail.com
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
      '{"name": "Adailton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, is_admin, role, entity_type)
    VALUES (v_user_id, 'adailtong@gmail.com', 'Adailton', true, 'admin', 'pj')
    ON CONFLICT (id) DO UPDATE SET is_admin = true, role = 'admin', entity_type = 'pj';
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com';
    UPDATE public.profiles SET is_admin = true, role = 'admin', entity_type = 'pj' WHERE id = v_user_id;
  END IF;
END $$;

-- Ensure audit_logs RLS is strictly for admins
DROP POLICY IF EXISTS "audit_logs_select" ON public.audit_logs;
CREATE POLICY "audit_logs_select" ON public.audit_logs FOR SELECT TO authenticated USING (is_admin());
