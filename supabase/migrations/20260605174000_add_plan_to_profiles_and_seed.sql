-- Adicionar plan_id à tabela profiles se não existir, para garantir vínculo da assinatura
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.construction_plans(id) ON DELETE SET NULL;

-- Seedar dados básicos de planos na tabela construction_plans
DO $$
BEGIN
  -- Create a default Provider PF Plan
  INSERT INTO public.construction_plans (id, name, description, price, billing_cycle, active, target_audience, entity_type, features, early_access_hours, priority_weight, validity_days, currency)
  VALUES (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Plano Profissional PF',
    'Plano focado em profissionais autônomos.',
    29.90, 'monthly', true, 'provider', 'pf',
    '["Busca ilimitada", "Contato direto com cliente", "Destaque nas buscas"]'::jsonb,
    24, 2, 30, 'BRL'
  ) ON CONFLICT (id) DO NOTHING;

  -- Create a default Provider PJ Plan
  INSERT INTO public.construction_plans (id, name, description, price, billing_cycle, active, target_audience, entity_type, features, early_access_hours, priority_weight, validity_days, currency)
  VALUES (
    '22222222-2222-2222-2222-222222222222'::uuid,
    'Plano Empresa PJ',
    'Plano corporativo para prestadores de serviço.',
    99.90, 'monthly', true, 'provider', 'pj',
    '["Múltiplos usuários", "Relatórios avançados", "Prioridade máxima"]'::jsonb,
    48, 5, 30, 'BRL'
  ) ON CONFLICT (id) DO NOTHING;

  -- Create a default Advertiser PF Plan
  INSERT INTO public.construction_plans (id, name, description, price, billing_cycle, active, target_audience, entity_type, features, early_access_hours, priority_weight, validity_days, visibility_boost, currency)
  VALUES (
    '33333333-3333-3333-3333-333333333333'::uuid,
    'Anunciante Básico',
    'Para pessoas físicas publicarem vagas.',
    0.00, 'monthly', true, 'advertiser', 'pf',
    '["Até 3 vagas simultâneas", "Suporte padrão"]'::jsonb,
    0, 1, 30, 1, 'BRL'
  ) ON CONFLICT (id) DO NOTHING;

  -- Create a default Advertiser PJ Plan
  INSERT INTO public.construction_plans (id, name, description, price, billing_cycle, active, target_audience, entity_type, features, early_access_hours, priority_weight, validity_days, visibility_boost, currency)
  VALUES (
    '44444444-4444-4444-4444-444444444444'::uuid,
    'Anunciante Corporativo',
    'Para empresas com alto volume de contratações.',
    199.90, 'monthly', true, 'advertiser', 'pj',
    '["Vagas ilimitadas", "Gestão de equipe", "Integração API"]'::jsonb,
    0, 10, 30, 5, 'BRL'
  ) ON CONFLICT (id) DO NOTHING;
END $$;
