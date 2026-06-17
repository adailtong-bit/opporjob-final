ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_materials" ON public.materials;
CREATE POLICY "authenticated_select_materials" ON public.materials FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_materials" ON public.materials;
CREATE POLICY "anon_select_materials" ON public.materials FOR SELECT TO anon USING (true);

DO $$
DECLARE
  v_vendor1 UUID;
  v_vendor2 UUID;
BEGIN
  -- Insert mock vendors for ads
  IF NOT EXISTS (SELECT 1 FROM vendors WHERE name = 'Home Depot') THEN
    v_vendor1 := gen_random_uuid();
    INSERT INTO vendors (id, name, status, created_at, updated_at) VALUES (v_vendor1, 'Home Depot', 'active', NOW(), NOW());
  ELSE
    SELECT id INTO v_vendor1 FROM vendors WHERE name = 'Home Depot' LIMIT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM vendors WHERE name = 'Lowe''s') THEN
    v_vendor2 := gen_random_uuid();
    INSERT INTO vendors (id, name, status, created_at, updated_at) VALUES (v_vendor2, 'Lowe''s', 'active', NOW(), NOW());
  ELSE
    SELECT id INTO v_vendor2 FROM vendors WHERE name = 'Lowe''s' LIMIT 1;
  END IF;

  -- Insert Active Campaigns
  INSERT INTO advertising_campaigns (id, advertiser_id, title, media_url, target_url, status, start_date, end_date, specifications, price, tier, created_at, updated_at)
  SELECT 
    gen_random_uuid(), v_vendor1, 'Home Depot Tools', 'https://img.usecurling.com/i?q=home-depot', 'https://www.homedepot.com', 'active', NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days', '{"category": "Ferramentas"}'::jsonb, 100, 'premium', NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM advertising_campaigns WHERE title = 'Home Depot Tools');

  INSERT INTO advertising_campaigns (id, advertiser_id, title, media_url, target_url, status, start_date, end_date, specifications, price, tier, created_at, updated_at)
  SELECT 
    gen_random_uuid(), v_vendor2, 'Lowe''s Painting', 'https://img.usecurling.com/i?q=lowes', 'https://www.lowes.com', 'active', NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days', '{"category": "Pintura"}'::jsonb, 100, 'premium', NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM advertising_campaigns WHERE title = 'Lowe''s Painting');

  INSERT INTO advertising_campaigns (id, advertiser_id, title, media_url, target_url, status, start_date, end_date, specifications, price, tier, created_at, updated_at)
  SELECT 
    gen_random_uuid(), v_vendor1, 'Home Depot Electrical', 'https://img.usecurling.com/i?q=home-depot', 'https://www.homedepot.com', 'active', NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days', '{"category": "Elétrica"}'::jsonb, 100, 'premium', NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM advertising_campaigns WHERE title = 'Home Depot Electrical');

  -- Insert Base Materials
  IF NOT EXISTS (SELECT 1 FROM materials LIMIT 1) THEN
    INSERT INTO materials (id, name, category, price, stock, unit) VALUES
      (gen_random_uuid(), 'Fio Elétrico 2.5mm', 'Elétrica', 120.00, 50, 'rolo'),
      (gen_random_uuid(), 'Disjuntor 20A', 'Elétrica', 15.00, 100, 'un'),
      (gen_random_uuid(), 'Tubo PVC 100mm', 'Hidráulica', 45.00, 200, 'barra'),
      (gen_random_uuid(), 'Cimento CP II 50kg', 'Alvenaria', 32.90, 500, 'saco'),
      (gen_random_uuid(), 'Tijolo Cerâmico 14x19x29', 'Alvenaria', 1.85, 10000, 'un'),
      (gen_random_uuid(), 'Tinta Acrílica Branca 18L', 'Pintura', 250.00, 30, 'lata'),
      (gen_random_uuid(), 'Furadeira de Impacto', 'Ferramentas', 350.00, 10, 'un');
  END IF;

END $$;
