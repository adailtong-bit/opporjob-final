-- Create Contact Requests Table
CREATE TABLE IF NOT EXISTS public.contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert contact requests
DROP POLICY IF EXISTS "public_insert_contact_requests" ON public.contact_requests;
CREATE POLICY "public_insert_contact_requests" ON public.contact_requests
  FOR INSERT TO public, anon, authenticated WITH CHECK (true);

-- Allow admins to read and update contact requests
DROP POLICY IF EXISTS "admin_all_contact_requests" ON public.contact_requests;
CREATE POLICY "admin_all_contact_requests" ON public.contact_requests
  FOR ALL TO authenticated USING (public.is_admin() = true);

-- Add audit trigger to log new contact requests and updates
DROP TRIGGER IF EXISTS audit_contact_requests ON public.contact_requests;
CREATE TRIGGER audit_contact_requests
  AFTER INSERT OR UPDATE OR DELETE ON public.contact_requests
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
