DO $$
DECLARE
  v_owner_id uuid;
  v_executor_id uuid;
  v_job_id uuid := '11111111-1111-1111-1111-111111111111'::uuid;
  v_bid_id uuid := '22222222-2222-2222-2222-222222222222'::uuid;
  v_invoice_id uuid := '33333333-3333-3333-3333-333333333333'::uuid;
BEGIN
  -- Insert/Get owner (Adailton)
  SELECT id INTO v_owner_id FROM auth.users WHERE email = 'adailtong@gmail.com';
  IF NOT FOUND THEN
    v_owner_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone,
      phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_owner_id, '00000000-0000-0000-0000-000000000000', 'adailtong@gmail.com',
      crypt('Skip@Pass123', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Adailton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
    INSERT INTO public.profiles (id, email, name, is_admin)
    VALUES (v_owner_id, 'adailtong@gmail.com', 'Adailton', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Insert/Get executor
  SELECT id INTO v_executor_id FROM auth.users WHERE email = 'executor@example.com';
  IF NOT FOUND THEN
    v_executor_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone,
      phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_executor_id, '00000000-0000-0000-0000-000000000000', 'executor@example.com',
      crypt('Skip@Pass123', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Executor Pro"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
    INSERT INTO public.profiles (id, email, name, is_admin)
    VALUES (v_executor_id, 'executor@example.com', 'Executor Pro', false)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Insert Job (completed)
  INSERT INTO public.jobs (
    id, title, description, type, category, location, budget, owner_id, owner_name, status, completion_photos, completion_comments
  ) VALUES (
    v_job_id,
    'Complete Kitchen Renovation',
    'Full kitchen remodeling including cabinets and plumbing.',
    'fixed',
    'Renovations',
    'Orlando, FL',
    5000,
    v_owner_id,
    'Adailton',
    'completed',
    '["https://img.usecurling.com/p/600/400?q=kitchen", "https://img.usecurling.com/p/600/400?q=renovation"]'::jsonb,
    'All cabinets installed. Plumbing tested with zero leaks. Final touches completed as per specifications.'
  ) ON CONFLICT (id) DO NOTHING;

  -- Insert Bid
  INSERT INTO public.bids (
    id, job_id, executor_id, executor_name, amount, description, status
  ) VALUES (
    v_bid_id,
    v_job_id,
    v_executor_id,
    'Executor Pro',
    5000,
    'I can do this in 2 weeks.',
    'accepted'
  ) ON CONFLICT (id) DO NOTHING;

  -- Ensure Job has the accepted bid id (in case job was created without it first due to FK constraints)
  UPDATE public.jobs SET accepted_bid_id = v_bid_id WHERE id = v_job_id;

  -- Insert Invoice (pending)
  INSERT INTO public.invoices (
    id, job_id, payer_id, receiver_id, amount, currency, status, description, type
  ) VALUES (
    v_invoice_id,
    v_job_id,
    v_owner_id,
    v_executor_id,
    5000,
    'USD',
    'pending',
    'Invoice for completed job: Complete Kitchen Renovation',
    'service'
  ) ON CONFLICT (id) DO NOTHING;

END $$;
