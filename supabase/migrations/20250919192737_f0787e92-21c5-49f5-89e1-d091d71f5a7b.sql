-- Create core blockchain-inspired data models for Ayurvedic herb traceability

-- Approved harvesting zones for geo-fencing validation
CREATE TABLE public.approved_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  polygon JSONB NOT NULL, -- GeoJSON polygon for zone boundaries
  species_allowed TEXT[] NOT NULL,
  seasonal_restrictions JSONB, -- {species: {start_month: 1, end_month: 12}}
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Farmers/Collectors registration
CREATE TABLE public.collectors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  license_number TEXT UNIQUE NOT NULL,
  certification_type TEXT CHECK (certification_type IN ('organic', 'conventional', 'wild-harvest')),
  approved_zones UUID[] REFERENCES public.approved_zones(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Processing facilities
CREATE TABLE public.facilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  facility_type TEXT NOT NULL,
  location JSONB NOT NULL, -- {lat, lng, address}
  license_number TEXT UNIQUE NOT NULL,
  certifications TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Testing laboratories
CREATE TABLE public.laboratories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  accreditation_number TEXT UNIQUE NOT NULL,
  location JSONB NOT NULL,
  test_capabilities TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Immutable blockchain-style collection events
CREATE TABLE public.collection_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collector_id UUID NOT NULL REFERENCES public.collectors(id),
  species TEXT NOT NULL,
  botanical_name TEXT NOT NULL,
  coordinates JSONB NOT NULL, -- {lat, lng}
  zone_id UUID REFERENCES public.approved_zones(id),
  quantity DECIMAL(10,3) NOT NULL,
  quality_metrics JSONB, -- Initial quality data
  harvest_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  block_hash TEXT NOT NULL,
  previous_hash TEXT,
  merkle_root TEXT,
  validator_signature TEXT,
  is_validated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Processing steps in the supply chain
CREATE TABLE public.processing_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_event_id UUID NOT NULL REFERENCES public.collection_events(id),
  facility_id UUID NOT NULL REFERENCES public.facilities(id),
  step_type TEXT NOT NULL CHECK (step_type IN ('drying', 'grinding', 'extraction', 'formulation', 'packaging')),
  environmental_conditions JSONB, -- temperature, humidity, etc.
  start_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  end_timestamp TIMESTAMP WITH TIME ZONE,
  operator_id TEXT NOT NULL,
  parameters JSONB, -- step-specific parameters
  block_hash TEXT NOT NULL,
  previous_hash TEXT NOT NULL,
  is_validated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Quality test results
CREATE TABLE public.quality_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_event_id UUID REFERENCES public.collection_events(id),
  processing_step_id UUID REFERENCES public.processing_steps(id),
  lab_id UUID NOT NULL REFERENCES public.laboratories(id),
  test_type TEXT NOT NULL CHECK (test_type IN ('moisture', 'pesticide', 'heavy_metals', 'dna_barcoding', 'microbial', 'potency')),
  test_result JSONB NOT NULL, -- {value, unit, status}
  certificate_hash TEXT NOT NULL,
  threshold_min DECIMAL(10,3),
  threshold_max DECIMAL(10,3),
  passed BOOLEAN NOT NULL,
  test_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  block_hash TEXT NOT NULL,
  previous_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Final provenance bundles (products)
CREATE TABLE public.provenance_bundles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_number TEXT UNIQUE NOT NULL,
  product_name TEXT NOT NULL,
  collection_events UUID[] NOT NULL, -- Array of collection event IDs
  processing_steps UUID[] NOT NULL, -- Array of processing step IDs
  quality_tests UUID[] NOT NULL, -- Array of quality test IDs
  final_product_data JSONB NOT NULL,
  qr_code TEXT UNIQUE NOT NULL,
  manufacturing_date TIMESTAMP WITH TIME ZONE NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  block_hash TEXT NOT NULL,
  merkle_root TEXT NOT NULL,
  is_finalized BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.approved_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laboratories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provenance_bundles ENABLE ROW LEVEL SECURITY;

-- Create policies for read access (adjust based on your auth requirements)
CREATE POLICY "Allow read access to approved zones" ON public.approved_zones FOR SELECT USING (true);
CREATE POLICY "Allow read access to collectors" ON public.collectors FOR SELECT USING (true);
CREATE POLICY "Allow read access to facilities" ON public.facilities FOR SELECT USING (true);
CREATE POLICY "Allow read access to laboratories" ON public.laboratories FOR SELECT USING (true);
CREATE POLICY "Allow read access to collection events" ON public.collection_events FOR SELECT USING (true);
CREATE POLICY "Allow read access to processing steps" ON public.processing_steps FOR SELECT USING (true);
CREATE POLICY "Allow read access to quality tests" ON public.quality_tests FOR SELECT USING (true);
CREATE POLICY "Allow read access to provenance bundles" ON public.provenance_bundles FOR SELECT USING (true);

-- Function to generate block hash (blockchain-style)
CREATE OR REPLACE FUNCTION public.generate_block_hash(data JSONB, previous_hash TEXT DEFAULT '')
RETURNS TEXT AS $$
BEGIN
  RETURN encode(sha256(concat(data::text, previous_hash, extract(epoch from now())::text)::bytea), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate geo-fencing
CREATE OR REPLACE FUNCTION public.validate_geofencing(
  coordinates JSONB,
  species TEXT,
  harvest_date TIMESTAMP WITH TIME ZONE
)
RETURNS UUID AS $$
DECLARE
  zone_id UUID;
  zone_polygon JSONB;
  seasonal_restrictions JSONB;
  harvest_month INTEGER;
BEGIN
  harvest_month := EXTRACT(MONTH FROM harvest_date);
  
  -- Find matching approved zone
  SELECT az.id, az.polygon, az.seasonal_restrictions
  INTO zone_id, zone_polygon, seasonal_restrictions
  FROM public.approved_zones az
  WHERE species = ANY(az.species_allowed)
  AND ST_Contains(
    ST_GeomFromGeoJSON(az.polygon),
    ST_Point((coordinates->>'lng')::float, (coordinates->>'lat')::float)
  )
  LIMIT 1;
  
  -- Check if zone found
  IF zone_id IS NULL THEN
    RAISE EXCEPTION 'Collection coordinates not within approved harvesting zone for species: %', species;
  END IF;
  
  -- Check seasonal restrictions
  IF seasonal_restrictions ? species THEN
    DECLARE
      restrictions JSONB := seasonal_restrictions->species;
      start_month INTEGER := (restrictions->>'start_month')::integer;
      end_month INTEGER := (restrictions->>'end_month')::integer;
    BEGIN
      IF NOT (harvest_month >= start_month AND harvest_month <= end_month) THEN
        RAISE EXCEPTION 'Harvest outside allowed seasonal window for species: %', species;
      END IF;
    END;
  END IF;
  
  RETURN zone_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate quality thresholds
CREATE OR REPLACE FUNCTION public.validate_quality_threshold(
  test_type TEXT,
  test_result JSONB,
  threshold_min DECIMAL DEFAULT NULL,
  threshold_max DECIMAL DEFAULT NULL
)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for collection event validation
CREATE OR REPLACE FUNCTION public.validate_collection_event()
RETURNS TRIGGER AS $$
DECLARE
  validated_zone_id UUID;
  hash_data JSONB;
BEGIN
  -- Validate geo-fencing and seasonal restrictions
  validated_zone_id := public.validate_geofencing(
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
  
  NEW.block_hash := public.generate_block_hash(hash_data, COALESCE(NEW.previous_hash, ''));
  NEW.is_validated := true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for quality test validation
CREATE OR REPLACE FUNCTION public.validate_quality_test()
RETURNS TRIGGER AS $$
DECLARE
  hash_data JSONB;
BEGIN
  -- Validate against thresholds
  NEW.passed := public.validate_quality_threshold(
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
  
  NEW.block_hash := public.generate_block_hash(hash_data, NEW.previous_hash);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER validate_collection_before_insert
  BEFORE INSERT ON public.collection_events
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_collection_event();

CREATE TRIGGER validate_quality_before_insert
  BEFORE INSERT ON public.quality_tests
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_quality_test();

-- Create indexes for performance
CREATE INDEX idx_collection_events_species ON public.collection_events(species);
CREATE INDEX idx_collection_events_coordinates ON public.collection_events USING GIN(coordinates);
CREATE INDEX idx_collection_events_harvest_date ON public.collection_events(harvest_timestamp);
CREATE INDEX idx_quality_tests_type ON public.quality_tests(test_type);
CREATE INDEX idx_quality_tests_passed ON public.quality_tests(passed);

-- Insert sample approved zones
INSERT INTO public.approved_zones (name, region, polygon, species_allowed, seasonal_restrictions) VALUES
(
  'Western Ghats Organic Zone',
  'Kerala',
  '{"type":"Polygon","coordinates":[[[76.0,10.0],[76.5,10.0],[76.5,10.5],[76.0,10.5],[76.0,10.0]]]}',
  ARRAY['Turmeric', 'Ashwagandha', 'Brahmi'],
  '{"Turmeric": {"start_month": 1, "end_month": 4}, "Ashwagandha": {"start_month": 10, "end_month": 3}}'
),
(
  'Himalayan Medicinal Zone',
  'Uttarakhand',
  '{"type":"Polygon","coordinates":[[[78.0,30.0],[78.5,30.0],[78.5,30.5],[78.0,30.5],[78.0,30.0]]]}',
  ARRAY['Rhodiola', 'Cordyceps', 'Neem'],
  '{"Rhodiola": {"start_month": 6, "end_month": 9}, "Cordyceps": {"start_month": 5, "end_month": 8}}'
);