DO $$
BEGIN
  -- Update existing records to standard native english concepts
  UPDATE public.profiles SET entity_type = 'individual' WHERE entity_type = 'pf';
  UPDATE public.profiles SET entity_type = 'company' WHERE entity_type = 'pj';
  UPDATE public.profiles SET country = 'US' WHERE country IS NULL;
END $$;

-- Update the handle_new_user function to use 'individual' and 'US' as defaults instead of Brazil base
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, name, role, entity_type, phone, country, street, "number", complement, neighborhood, city, state, zip_code, bank, agency, account, document
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'contractor'),
    COALESCE(NEW.raw_user_meta_data->>'entityType', 'individual'),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'country', 'US'),
    NEW.raw_user_meta_data->>'street',
    NEW.raw_user_meta_data->>'number',
    NEW.raw_user_meta_data->>'complement',
    NEW.raw_user_meta_data->>'neighborhood',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'state',
    NEW.raw_user_meta_data->>'zipCode',
    NEW.raw_user_meta_data->>'bank',
    NEW.raw_user_meta_data->>'agency',
    NEW.raw_user_meta_data->>'account',
    NEW.raw_user_meta_data->>'document'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
