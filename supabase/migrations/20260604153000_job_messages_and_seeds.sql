CREATE TABLE IF NOT EXISTS public.job_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.job_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "job_messages_select" ON public.job_messages;
CREATE POLICY "job_messages_select" ON public.job_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j 
      WHERE j.id = job_messages.job_id 
      AND (j.owner_id = auth.uid() OR j.accepted_bid_id IN (SELECT id FROM public.bids WHERE executor_id = auth.uid()))
    )
  );

DROP POLICY IF EXISTS "job_messages_insert" ON public.job_messages;
CREATE POLICY "job_messages_insert" ON public.job_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.jobs j 
      WHERE j.id = job_messages.job_id 
      AND (j.owner_id = auth.uid() OR j.accepted_bid_id IN (SELECT id FROM public.bids WHERE executor_id = auth.uid()))
    )
  );

-- Seed Data for test user
DO $$
DECLARE
  v_user_id UUID;
  v_job_id UUID;
  v_bid_id UUID;
BEGIN
  -- Insert adailtong@gmail.com if not exists
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
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (v_user_id, 'adailtong@gmail.com', 'Adailton', 'executor')
    ON CONFLICT (id) DO NOTHING;
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
  END IF;
  
  -- Create dummy job and invoice
  IF v_user_id IS NOT NULL THEN
    v_job_id := gen_random_uuid();
    INSERT INTO public.jobs (id, title, description, type, category, location, budget, owner_id, status)
    VALUES (v_job_id, 'Test Job for Earnings (Dashboard)', 'Dummy job for earning validation', 'fixed', 'Technology', 'Remote', 1500.00, v_user_id, 'in_progress');

    v_bid_id := gen_random_uuid();
    INSERT INTO public.bids (id, job_id, executor_id, executor_name, amount, description, status)
    VALUES (v_bid_id, v_job_id, v_user_id, 'Adailton', 1500.00, 'I can do this', 'accepted');

    UPDATE public.jobs SET accepted_bid_id = v_bid_id WHERE id = v_job_id;

    INSERT INTO public.invoices (id, job_id, payer_id, receiver_id, amount, status, type, currency, description)
    VALUES (gen_random_uuid(), v_job_id, v_user_id, v_user_id, 1500.00, 'paid', 'service', 'USD', 'Invoice for Test Job')
    ON CONFLICT DO NOTHING;

    INSERT INTO public.job_messages (job_id, sender_id, content)
    VALUES 
      (v_job_id, v_user_id, 'Hello, I will start working on this now.'),
      (v_job_id, v_user_id, 'Let me know if you need anything else.')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
