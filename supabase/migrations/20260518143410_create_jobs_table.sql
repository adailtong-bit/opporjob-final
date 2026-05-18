CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'fixed',
  category TEXT,
  sub_category TEXT,
  location TEXT,
  budget NUMERIC DEFAULT 0,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_name TEXT,
  status TEXT DEFAULT 'open',
  source TEXT DEFAULT 'internal',
  external_id TEXT UNIQUE,
  photos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  executor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  executor_name TEXT,
  amount NUMERIC DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_jobs" ON public.jobs;
CREATE POLICY "public_read_jobs" ON public.jobs FOR SELECT USING (true);

DROP POLICY IF EXISTS "auth_insert_jobs" ON public.jobs;
CREATE POLICY "auth_insert_jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = owner_id OR owner_id IS NULL);

DROP POLICY IF EXISTS "auth_update_jobs" ON public.jobs;
CREATE POLICY "auth_update_jobs" ON public.jobs FOR UPDATE USING (auth.uid() = owner_id OR is_admin());

DROP POLICY IF EXISTS "auth_delete_jobs" ON public.jobs;
CREATE POLICY "auth_delete_jobs" ON public.jobs FOR DELETE USING (auth.uid() = owner_id OR is_admin());

DROP POLICY IF EXISTS "public_read_bids" ON public.bids;
CREATE POLICY "public_read_bids" ON public.bids FOR SELECT USING (true);

DROP POLICY IF EXISTS "auth_insert_bids" ON public.bids;
CREATE POLICY "auth_insert_bids" ON public.bids FOR INSERT WITH CHECK (auth.uid() = executor_id);
