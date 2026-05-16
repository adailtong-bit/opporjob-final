DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      target_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      rating NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_reviews_target_id ON public.reviews(target_id);
  CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);

  ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "public_read_reviews" ON public.reviews;
  CREATE POLICY "public_read_reviews" ON public.reviews
    FOR SELECT TO public USING (true);

  DROP POLICY IF EXISTS "auth_insert_reviews" ON public.reviews;
  CREATE POLICY "auth_insert_reviews" ON public.reviews
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);
    
  DROP POLICY IF EXISTS "auth_update_reviews" ON public.reviews;
  CREATE POLICY "auth_update_reviews" ON public.reviews
    FOR UPDATE TO authenticated USING (auth.uid() = reviewer_id);

  DROP POLICY IF EXISTS "auth_delete_reviews" ON public.reviews;
  CREATE POLICY "auth_delete_reviews" ON public.reviews
    FOR DELETE TO authenticated USING (auth.uid() = reviewer_id);
END $$;
