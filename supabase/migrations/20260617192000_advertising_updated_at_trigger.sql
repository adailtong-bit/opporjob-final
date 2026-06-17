CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_advertising_campaigns_updated_at ON public.advertising_campaigns;
CREATE TRIGGER set_advertising_campaigns_updated_at
  BEFORE UPDATE ON public.advertising_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.set_current_timestamp_updated_at();
