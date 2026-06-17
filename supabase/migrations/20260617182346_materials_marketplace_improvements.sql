DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed user (adailtong@gmail.com)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, is_admin)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton Admin', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Categories
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE id = 'cat-marketplace-materials') THEN
    INSERT INTO public.categories (id, name, slug, type, translation_key)
    VALUES ('cat-marketplace-materials', 'Materiais de Construção', 'materiais-construcao', 'marketplace', 'market.category');
  END IF;

  -- 20+ Subcategories
  INSERT INTO public.subcategories (id, category_id, name, slug, translation_key) VALUES 
  ('sub-mat-1', 'cat-marketplace-materials', 'Elétrica', 'eletrica', 'market.category.electrical'),
  ('sub-mat-2', 'cat-marketplace-materials', 'Hidráulica', 'hidraulica', 'market.category.hydraulic'),
  ('sub-mat-3', 'cat-marketplace-materials', 'Alvenaria', 'alvenaria', 'market.category.masonry'),
  ('sub-mat-4', 'cat-marketplace-materials', 'Pintura', 'pintura', 'market.category.painting'),
  ('sub-mat-5', 'cat-marketplace-materials', 'Ferramentas', 'ferramentas', 'market.category.tools'),
  ('sub-mat-6', 'cat-marketplace-materials', 'Acabamento', 'acabamento', NULL),
  ('sub-mat-7', 'cat-marketplace-materials', 'Ferragens', 'ferragens', NULL),
  ('sub-mat-8', 'cat-marketplace-materials', 'Madeiras', 'madeiras', NULL),
  ('sub-mat-9', 'cat-marketplace-materials', 'Cobertura', 'cobertura', NULL),
  ('sub-mat-10', 'cat-marketplace-materials', 'Impermeabilização', 'impermeabilizacao', NULL),
  ('sub-mat-11', 'cat-marketplace-materials', 'Fixação', 'fixacao', NULL),
  ('sub-mat-12', 'cat-marketplace-materials', 'Iluminação', 'iluminacao', NULL),
  ('sub-mat-13', 'cat-marketplace-materials', 'EPIs', 'epis', NULL),
  ('sub-mat-14', 'cat-marketplace-materials', 'Climatização', 'climatizacao', NULL),
  ('sub-mat-15', 'cat-marketplace-materials', 'Saneamento', 'saneamento', NULL),
  ('sub-mat-16', 'cat-marketplace-materials', 'Gesso e Drywall', 'gesso-drywall', NULL),
  ('sub-mat-17', 'cat-marketplace-materials', 'Portas e Janelas', 'portas-janelas', NULL),
  ('sub-mat-18', 'cat-marketplace-materials', 'Pisos e Revestimentos', 'pisos-revestimentos', NULL),
  ('sub-mat-19', 'cat-marketplace-materials', 'Louças e Metais', 'loucas-metais', NULL),
  ('sub-mat-20', 'cat-marketplace-materials', 'Argamassas e Rejuntes', 'argamassas-rejuntes', NULL),
  ('sub-mat-21', 'cat-marketplace-materials', 'Fundação', 'fundacao', NULL)
  ON CONFLICT (id) DO NOTHING;

  -- Materials Seed
  IF NOT EXISTS (SELECT 1 FROM public.materials LIMIT 1) THEN
    INSERT INTO public.materials (id, name, category, price, stock, unit) VALUES
    (gen_random_uuid(), 'Cimento Votorantim 50kg', 'Alvenaria', 32.90, 100, 'saco'),
    (gen_random_uuid(), 'Tijolo 8 Furos', 'Alvenaria', 1.20, 5000, 'unidade'),
    (gen_random_uuid(), 'Cabo Flexível 2.5mm', 'Elétrica', 150.00, 20, 'rolo 100m'),
    (gen_random_uuid(), 'Tubo PVC 100mm', 'Hidráulica', 45.00, 50, 'barra 6m'),
    (gen_random_uuid(), 'Tinta Acrílica Suvinil 18L', 'Pintura', 350.00, 10, 'lata'),
    (gen_random_uuid(), 'Furadeira Bosch 500W', 'Ferramentas', 250.00, 5, 'unidade');
  END IF;
END $$;

-- Fix RLS for materials table to allow admins to insert
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_materials" ON public.materials;
CREATE POLICY "public_select_materials" ON public.materials
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "admin_all_materials" ON public.materials;
CREATE POLICY "admin_all_materials" ON public.materials
  FOR ALL TO authenticated USING (is_admin() = true);

-- Fix RLS for purchase_orders to allow users to insert
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_insert_purchase_orders" ON public.purchase_orders;
CREATE POLICY "auth_insert_purchase_orders" ON public.purchase_orders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "auth_select_purchase_orders" ON public.purchase_orders;
CREATE POLICY "auth_select_purchase_orders" ON public.purchase_orders
  FOR SELECT TO authenticated USING (auth.uid() = requester_id OR is_admin() = true);

-- Fix RLS for purchase_order_items to allow users to insert items on their orders
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_insert_purchase_order_items" ON public.purchase_order_items;
CREATE POLICY "auth_insert_purchase_order_items" ON public.purchase_order_items
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.purchase_orders WHERE id = purchase_order_id AND requester_id = auth.uid())
  );

DROP POLICY IF EXISTS "auth_select_purchase_order_items" ON public.purchase_order_items;
CREATE POLICY "auth_select_purchase_order_items" ON public.purchase_order_items
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.purchase_orders WHERE id = purchase_order_id AND requester_id = auth.uid())
    OR is_admin() = true
  );
