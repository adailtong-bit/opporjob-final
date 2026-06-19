DO $$
DECLARE
  new_admin_id uuid;
BEGIN
  -- Check if admin exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    new_admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass2025', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin Adailton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, is_admin)
    VALUES (new_admin_id, 'adailtong@gmail.com', 'Admin Adailton', true)
    ON CONFLICT (id) DO UPDATE SET is_admin = true;
  ELSE
    SELECT id INTO new_admin_id FROM auth.users WHERE email = 'adailtong@gmail.com';
    UPDATE public.profiles SET is_admin = true WHERE id = new_admin_id;
  END IF;
END $$;

-- RLS Policies for jobs to allow admin full access
DROP POLICY IF EXISTS "auth_insert_jobs" ON public.jobs;
CREATE POLICY "auth_insert_jobs" ON public.jobs 
FOR INSERT WITH CHECK (
  auth.uid() = owner_id 
  OR public.is_admin() 
  OR owner_id IS NULL
);

DROP POLICY IF EXISTS "auth_update_jobs" ON public.jobs;
CREATE POLICY "auth_update_jobs" ON public.jobs 
FOR UPDATE USING (
  auth.uid() = owner_id 
  OR public.is_admin()
);

DROP POLICY IF EXISTS "auth_delete_jobs" ON public.jobs;
CREATE POLICY "auth_delete_jobs" ON public.jobs 
FOR DELETE USING (
  auth.uid() = owner_id 
  OR public.is_admin()
);
