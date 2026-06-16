-- Function to calculate the global rating average of the platform
CREATE OR REPLACE FUNCTION public.get_global_rating_average()
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_s_global numeric;
BEGIN
    SELECT COALESCE(AVG(rating), 5.0) INTO v_s_global FROM public.reviews;
    RETURN ROUND(v_s_global, 2);
END;
$$;

-- Function to calculate the Bayesian rating for a specific target user
CREATE OR REPLACE FUNCTION public.get_bayesian_rating(p_target_id UUID)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_k numeric := 10.0;
    v_v numeric;
    v_s_base numeric;
    v_s_global numeric;
    v_final numeric;
BEGIN
    -- Get global average
    SELECT COALESCE(AVG(rating), 5.0) INTO v_s_global FROM public.reviews;
    
    -- Get user reviews count and average
    SELECT COUNT(*), COALESCE(AVG(rating), 5.0) 
    INTO v_v, v_s_base 
    FROM public.reviews 
    WHERE target_id = p_target_id;
    
    IF v_v = 0 THEN
        RETURN ROUND(v_s_global, 1);
    END IF;
    
    v_final := ((v_v * v_s_base) + (v_k * v_s_global)) / (v_v + v_k);
    
    RETURN ROUND(v_final, 1);
END;
$$;
