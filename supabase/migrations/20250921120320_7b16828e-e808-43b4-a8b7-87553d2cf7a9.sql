-- Fix remaining security issues by updating all existing function search paths

-- Update generate_block_hash function
CREATE OR REPLACE FUNCTION generate_block_hash(data jsonb, previous_hash text DEFAULT ''::text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN encode(sha256(concat(data::text, previous_hash, extract(epoch from now())::text)::bytea), 'hex');
END;
$$;

-- Update validate_geofencing function
CREATE OR REPLACE FUNCTION validate_geofencing(coordinates jsonb, species text, harvest_date timestamp with time zone)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    zone_record RECORD;
    harvest_month INTEGER;
    restrictions JSONB;
    start_month INTEGER;
    end_month INTEGER;
BEGIN
    harvest_month := EXTRACT(MONTH FROM harvest_date);
    
    -- Find matching approved zone (simplified polygon check)
    SELECT az.id, az.seasonal_restrictions
    INTO zone_record
    FROM approved_zones az
    WHERE species = ANY(az.species_allowed)
    LIMIT 1; -- Simplified for now, should implement proper polygon containment
    
    -- Check if zone found
    IF zone_record.id IS NULL THEN
        RAISE EXCEPTION 'No approved harvesting zone found for species: %', species;
    END IF;
    
    -- Check seasonal restrictions
    IF zone_record.seasonal_restrictions ? species THEN
        restrictions := zone_record.seasonal_restrictions->species;
        start_month := (restrictions->>'start_month')::integer;
        end_month := (restrictions->>'end_month')::integer;
        
        -- Handle year-crossing seasons (e.g., Oct-Mar: 10-12, 1-3)
        IF start_month > end_month THEN
            IF NOT (harvest_month >= start_month OR harvest_month <= end_month) THEN
                RAISE EXCEPTION 'Harvest outside allowed seasonal window for species: %', species;
            END IF;
        ELSE
            IF NOT (harvest_month >= start_month AND harvest_month <= end_month) THEN
                RAISE EXCEPTION 'Harvest outside allowed seasonal window for species: %', species;
            END IF;
        END IF;
    END IF;
    
    RETURN zone_record.id;
END;
$$;

-- Update validate_quality_threshold function
CREATE OR REPLACE FUNCTION validate_quality_threshold(test_type text, test_result jsonb, threshold_min numeric DEFAULT NULL::numeric, threshold_max numeric DEFAULT NULL::numeric)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    test_value DECIMAL;
BEGIN
    test_value := (test_result->>'value')::decimal;
    
    -- Check minimum threshold
    IF threshold_min IS NOT NULL AND test_value < threshold_min THEN
        RETURN false;
    END IF;
    
    -- Check maximum threshold  
    IF threshold_max IS NOT NULL AND test_value > threshold_max THEN
        RETURN false;
    END IF;
    
    RETURN true;
END;
$$;

-- Update validate_collection_event function
CREATE OR REPLACE FUNCTION validate_collection_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    validated_zone_id UUID;
    hash_data JSONB;
BEGIN
    -- Validate geo-fencing and seasonal restrictions
    validated_zone_id := validate_geofencing(
        NEW.coordinates,
        NEW.species,
        NEW.harvest_timestamp
    );
    
    -- Set validated zone
    NEW.zone_id := validated_zone_id;
    
    -- Generate block hash
    hash_data := jsonb_build_object(
        'collector_id', NEW.collector_id,
        'species', NEW.species,
        'coordinates', NEW.coordinates,
        'quantity', NEW.quantity,
        'timestamp', NEW.harvest_timestamp
    );
    
    NEW.block_hash := generate_block_hash(hash_data, COALESCE(NEW.previous_hash, ''));
    NEW.is_validated := true;
    
    RETURN NEW;
END;
$$;

-- Update validate_quality_test function
CREATE OR REPLACE FUNCTION validate_quality_test()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    hash_data JSONB;
BEGIN
    -- Validate against thresholds
    NEW.passed := validate_quality_threshold(
        NEW.test_type,
        NEW.test_result,
        NEW.threshold_min,
        NEW.threshold_max
    );
    
    -- Generate block hash
    hash_data := jsonb_build_object(
        'lab_id', NEW.lab_id,
        'test_type', NEW.test_type,
        'test_result', NEW.test_result,
        'timestamp', NEW.test_timestamp
    );
    
    NEW.block_hash := generate_block_hash(hash_data, NEW.previous_hash);
    
    RETURN NEW;
END;
$$;