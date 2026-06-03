DO $$
BEGIN
  ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS completion_photos JSONB DEFAULT '[]'::jsonb;
  ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS completion_comments TEXT;
END $$;

CREATE OR REPLACE FUNCTION public.handle_job_completion()
RETURNS trigger AS $$
DECLARE
  v_bid RECORD;
BEGIN
  IF OLD.status != 'completed' AND NEW.status = 'completed' AND NEW.accepted_bid_id IS NOT NULL THEN
    
    SELECT amount, executor_id INTO v_bid
    FROM public.bids
    WHERE id = NEW.accepted_bid_id;

    IF FOUND THEN
      INSERT INTO public.invoices (
        job_id,
        payer_id,
        receiver_id,
        amount,
        status,
        type,
        currency,
        description
      ) VALUES (
        NEW.id,
        NEW.owner_id,
        v_bid.executor_id,
        v_bid.amount,
        'pending',
        'service',
        'USD',
        'Invoice for completed job: ' || NEW.title
      );
    END IF;

  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_job_completed ON public.jobs;
CREATE TRIGGER on_job_completed
  AFTER UPDATE OF status ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.handle_job_completion();

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
      '{"name": "Adailton G"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, is_admin)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton G', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
