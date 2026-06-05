ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS priority_weight INTEGER DEFAULT 1;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS early_access_hours INTEGER DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.construction_plans WHERE name = 'Básico PF') THEN
    INSERT INTO public.construction_plans (name, description, price, billing_cycle, target_audience, priority_weight, early_access_hours, visibility_boost, active)
    VALUES ('Básico PF', 'Plano gratuito para pessoa física.', 0, 'monthly', 'contractor_pf', 1, 0, 1, true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.construction_plans WHERE name = 'Premium PJ') THEN
    INSERT INTO public.construction_plans (name, description, price, billing_cycle, target_audience, priority_weight, early_access_hours, visibility_boost, active)
    VALUES ('Premium PJ', 'Plano premium para empresas com acesso antecipado.', 99.90, 'monthly', 'contractor_pj', 10, 24, 5, true);
  END IF;
END $$;
