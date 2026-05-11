CREATE OR REPLACE FUNCTION public.lock_paid_invoices()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'paid' THEN
      IF NEW.amount != OLD.amount OR NEW.vendor_id IS DISTINCT FROM OLD.vendor_id OR NEW.project_id IS DISTINCT FROM OLD.project_id THEN
        RAISE EXCEPTION 'Cannot modify critical fields (amount, vendor, project) of a paid invoice.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS enforce_paid_invoice_lock ON public.invoices;
CREATE TRIGGER enforce_paid_invoice_lock
BEFORE UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.lock_paid_invoices();

DROP TRIGGER IF EXISTS audit_invoices ON public.invoices;
CREATE TRIGGER audit_invoices
AFTER INSERT OR UPDATE OR DELETE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
