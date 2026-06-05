-- Add subscription tracking fields to profiles if not present
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

-- Ensure invoices have a type column and a proper default
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='invoices' AND column_name='type'
  ) THEN
    ALTER TABLE public.invoices ADD COLUMN type TEXT DEFAULT 'service';
  END IF;
END $$;

-- Trigger to sync subscription_status based on plan invoice payment
CREATE OR REPLACE FUNCTION public.handle_subscription_payment()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'paid' AND NEW.type = 'subscription' THEN
    UPDATE public.profiles
    SET subscription_status = 'active',
        subscription_end_date = NOW() + INTERVAL '30 days'
    WHERE id = NEW.payer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_subscription_paid ON public.invoices;
CREATE TRIGGER on_subscription_paid
  AFTER UPDATE OF status ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.handle_subscription_payment();
