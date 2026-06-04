DO $block$
BEGIN
  -- Add currency to construction_plans
  ALTER TABLE public.construction_plans ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

  -- Change defaults for existing tables
  ALTER TABLE public.jobs ALTER COLUMN currency SET DEFAULT 'USD';
  ALTER TABLE public.invoices ALTER COLUMN currency SET DEFAULT 'USD';
  ALTER TABLE public.bids ALTER COLUMN currency SET DEFAULT 'USD';

  -- Update existing data safely
  UPDATE public.jobs SET currency = 'USD' WHERE currency = 'BRL' OR currency IS NULL;
  UPDATE public.invoices SET currency = 'USD' WHERE currency = 'BRL' OR currency IS NULL;
  UPDATE public.bids SET currency = 'USD' WHERE currency = 'BRL' OR currency IS NULL;
  UPDATE public.construction_plans SET currency = 'USD' WHERE currency = 'BRL' OR currency IS NULL;
END $block$;
