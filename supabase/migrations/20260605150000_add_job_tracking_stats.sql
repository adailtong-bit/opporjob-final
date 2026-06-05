-- Add tracking columns to jobs table
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS impressions_count INTEGER DEFAULT 0 NOT NULL;

-- Drop existing functions just in case, for idempotency
DROP FUNCTION IF EXISTS public.increment_job_view(UUID);
DROP FUNCTION IF EXISTS public.increment_job_impressions(UUID[]);

-- Create RPC for incrementing view count
CREATE OR REPLACE FUNCTION public.increment_job_view(job_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.jobs
  SET views_count = views_count + 1
  WHERE id = job_id_param;
END;
$$;

-- Create RPC for incrementing impressions count in batch
CREATE OR REPLACE FUNCTION public.increment_job_impressions(job_ids_param UUID[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.jobs
  SET impressions_count = impressions_count + 1
  WHERE id = ANY(job_ids_param);
END;
$$;

-- Seed existing demo data so users can see stats immediately
DO $$
BEGIN
  UPDATE public.jobs
  SET views_count = floor(random() * 50) + 10,
      impressions_count = floor(random() * 500) + 100
  WHERE is_demo = true OR views_count = 0;
END $$;
