-- Unifica as regras de negócio de assinaturas e planos de obras
ALTER TABLE public.construction_plans
ADD COLUMN IF NOT EXISTS validity_days INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS push_lead_time_hours INTEGER DEFAULT 24,
ADD COLUMN IF NOT EXISTS push_message_text TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS priority_weight INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS early_access_hours INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS visibility_boost INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS skill_matching_rule TEXT DEFAULT 'flexible',
ADD COLUMN IF NOT EXISTS skill_weight INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS popular BOOLEAN DEFAULT false;
