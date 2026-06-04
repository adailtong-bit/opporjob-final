-- Add currency to jobs to preserve financial integrity across languages
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE public.bids ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
