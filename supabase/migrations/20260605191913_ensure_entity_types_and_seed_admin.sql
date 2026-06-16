-- Add/update missing fields if necessary to support PJ/PF in vendors and profiles
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS document TEXT;

-- Seed Data for Super Admin (adailtong@gmail.com)
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Insert user into auth.users if not exists
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
      crypt('Skip@Pass123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton", "role": "admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'adailtong@gmail.com';
  END IF;

  -- Upsert into profiles to make sure role is admin and is_admin is true
  INSERT INTO public.profiles (id, email, name, role, is_admin, entity_type)
  VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton (Admin)', 'admin', true, 'pf')
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    is_admin = true;

END $$;
