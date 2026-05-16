ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS portfolio_photos JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS priced_services JSONB DEFAULT '[]'::jsonb;
