DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- 1. Initial User Seed (Idempotent)
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
      '{"name": "Adailton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;
  
  -- Ensure admin profile
  INSERT INTO public.profiles (id, email, name, role, is_admin)
  SELECT id, email, raw_user_meta_data->>'name', 'admin', true
  FROM auth.users
  WHERE email = 'adailtong@gmail.com'
  ON CONFLICT (id) DO UPDATE SET is_admin = true, role = 'admin';
END $$;

-- 2. Structural Additions for Security & Logic
ALTER TABLE public.bids ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS accepted_bid_id uuid REFERENCES public.bids(id) ON DELETE SET NULL;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS progress numeric DEFAULT 0 CHECK (progress >= 0 AND progress <= 100);
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS progress numeric DEFAULT 0 CHECK (progress >= 0 AND progress <= 100);

-- Vendors ownership for RLS
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id);
UPDATE public.vendors 
SET owner_id = (SELECT id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1) 
WHERE owner_id IS NULL;

-- 3. Data Privacy & RLS Hardening

-- Bids Policy (Only executor, job owner, or admin can read)
DROP POLICY IF EXISTS "public_read_bids" ON public.bids;
DROP POLICY IF EXISTS "authenticated_read_bids" ON public.bids;
CREATE POLICY "authenticated_read_bids" ON public.bids
  FOR SELECT TO authenticated
  USING (
    auth.uid() = executor_id
    OR auth.uid() IN (SELECT owner_id FROM public.jobs WHERE id = job_id)
    OR public.is_admin()
  );

-- Vendors Policy (Only owner or admin can read/write)
DROP POLICY IF EXISTS "vendors_select" ON public.vendors;
CREATE POLICY "vendors_select" ON public.vendors
  FOR SELECT TO authenticated
  USING ( owner_id = auth.uid() OR public.is_admin() );
  
DROP POLICY IF EXISTS "vendors_insert" ON public.vendors;
CREATE POLICY "vendors_insert" ON public.vendors
  FOR INSERT TO authenticated
  WITH CHECK ( owner_id = auth.uid() OR public.is_admin() );
  
DROP POLICY IF EXISTS "vendors_update" ON public.vendors;
CREATE POLICY "vendors_update" ON public.vendors
  FOR UPDATE TO authenticated
  USING ( owner_id = auth.uid() OR public.is_admin() );
  
DROP POLICY IF EXISTS "vendors_delete" ON public.vendors;
CREATE POLICY "vendors_delete" ON public.vendors
  FOR DELETE TO authenticated
  USING ( owner_id = auth.uid() OR public.is_admin() );

-- 4. Atomic Transaction Logic (Award Job RPC)
CREATE OR REPLACE FUNCTION public.award_job(job_id_param UUID, bid_id_param UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_job_status text;
  v_job_owner uuid;
BEGIN
  -- Lock job row
  SELECT status, owner_id INTO v_job_status, v_job_owner
  FROM public.jobs
  WHERE id = job_id_param
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job not found';
  END IF;

  IF v_job_owner != auth.uid() AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF v_job_status != 'open' THEN
    RAISE EXCEPTION 'Job is not open';
  END IF;

  -- Atomically reject others and accept the selected bid
  UPDATE public.bids
  SET status = CASE WHEN id = bid_id_param THEN 'accepted' ELSE 'rejected' END
  WHERE job_id = job_id_param;

  -- Update job status and link accepted bid
  UPDATE public.jobs
  SET status = 'in_progress',
      accepted_bid_id = bid_id_param
  WHERE id = job_id_param;

  RETURN true;
END;
$function$;

-- 5. Audit Logs Trigger for Bids (Financial Traceability)
DROP TRIGGER IF EXISTS audit_bids ON public.bids;
CREATE TRIGGER audit_bids
  AFTER INSERT OR UPDATE OR DELETE ON public.bids
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- 6. Auth Integrity: Fix nulls in auth.users tokens
UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE
  confirmation_token IS NULL OR recovery_token IS NULL
  OR email_change_token_new IS NULL OR email_change IS NULL
  OR email_change_token_current IS NULL
  OR phone_change IS NULL OR phone_change_token IS NULL
  OR reauthentication_token IS NULL;
