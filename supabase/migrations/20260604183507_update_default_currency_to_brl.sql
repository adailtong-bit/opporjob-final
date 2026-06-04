ALTER TABLE public.jobs ALTER COLUMN currency SET DEFAULT 'BRL'::text;
ALTER TABLE public.bids ALTER COLUMN currency SET DEFAULT 'BRL'::text;
ALTER TABLE public.invoices ALTER COLUMN currency SET DEFAULT 'BRL'::text;

UPDATE public.jobs SET currency = 'BRL' WHERE currency = 'USD' OR currency IS NULL;
UPDATE public.bids SET currency = 'BRL' WHERE currency = 'USD' OR currency IS NULL;
UPDATE public.invoices SET currency = 'BRL' WHERE currency = 'USD' OR currency IS NULL;
