DO $$
BEGIN
  -- Insert or update default marketing_content to English
  INSERT INTO public.marketing_content (id, key, title, subtitle, features) VALUES
    (gen_random_uuid(), 'home_hero', 'Build, renovate and innovate.', 'Complete platform for projects and experts.', '[{"title": "Global Reach", "desc": "Connect with top talent worldwide."}, {"title": "Secure Payments", "desc": "Escrow protection for every transaction."}]'::jsonb)
  ON CONFLICT (key) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    features = EXCLUDED.features;

  -- Insert or update default construction_plans to English
  -- We don't have a unique key on name, so we just insert if the table is empty or update by looking up names
  IF NOT EXISTS (SELECT 1 FROM public.construction_plans WHERE name = 'Basic') THEN
    INSERT INTO public.construction_plans (name, description, price, billing_cycle, max_projects, work_size, complexity, features, active) VALUES
      ('Basic', 'Essential tools for small contractors.', 0, 'monthly', 3, 'Small', 'Low', '["3 Projects", "Basic Support", "Standard Listings"]'::jsonb, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.construction_plans WHERE name = 'Premium') THEN
    INSERT INTO public.construction_plans (name, description, price, billing_cycle, max_projects, work_size, complexity, features, active, popular) VALUES
      ('Premium', 'Advanced tools for growing companies.', 99.99, 'monthly', 20, 'Medium', 'Medium', '["20 Projects", "Priority Support", "Featured Listings", "Advanced Reports"]'::jsonb, true, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.construction_plans WHERE name = 'Enterprise') THEN
    INSERT INTO public.construction_plans (name, description, price, billing_cycle, max_projects, work_size, complexity, features, active) VALUES
      ('Enterprise', 'Full-scale solution for large builders.', 299.99, 'monthly', 9999, 'Large', 'High', '["Unlimited Projects", "24/7 Dedicated Support", "Top Placement", "API Access"]'::jsonb, true);
  END IF;
END $$;
