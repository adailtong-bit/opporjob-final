DO $$
BEGIN
  ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_review_per_job'
  ) THEN
    ALTER TABLE public.reviews ADD CONSTRAINT unique_review_per_job UNIQUE (job_id, reviewer_id, target_id);
  END IF;
END $$;

DROP POLICY IF EXISTS "auth_insert_reviews" ON public.reviews;
DROP POLICY IF EXISTS "auth_update_reviews" ON public.reviews;
DROP POLICY IF EXISTS "auth_delete_reviews" ON public.reviews;
DROP POLICY IF EXISTS "public_read_reviews" ON public.reviews;

CREATE POLICY "auth_insert_reviews" ON public.reviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "auth_update_reviews" ON public.reviews
  FOR UPDATE TO authenticated USING (auth.uid() = reviewer_id);

CREATE POLICY "auth_delete_reviews" ON public.reviews
  FOR DELETE TO authenticated USING (auth.uid() = reviewer_id);

CREATE POLICY "public_read_reviews" ON public.reviews
  FOR SELECT TO public USING (true);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own push subscriptions" ON public.push_subscriptions;

CREATE POLICY "Users can manage their own push subscriptions" ON public.push_subscriptions
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
