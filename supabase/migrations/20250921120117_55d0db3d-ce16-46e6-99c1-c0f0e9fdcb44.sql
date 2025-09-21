-- Create user roles enum
CREATE TYPE user_role AS ENUM ('admin', 'farmer', 'testing_unit', 'manufacturing_unit', 'packaging_unit');

-- Create companies table for different business entities
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company_type user_role NOT NULL,
    license_number TEXT UNIQUE,
    contact_email TEXT,
    contact_phone TEXT,
    address JSONB,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profiles table extending auth.users
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    full_name TEXT,
    employee_id TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, employee_id)
);

-- Create herb_batches table (Farmer input)
CREATE TABLE herb_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_company_id UUID NOT NULL REFERENCES companies(id),
    created_by UUID NOT NULL REFERENCES profiles(id),
    herb_name TEXT NOT NULL,
    herb_type TEXT NOT NULL,
    variety TEXT,
    quantity_kg DECIMAL(10,2) NOT NULL,
    geo_location JSONB NOT NULL, -- {lat, lng, address}
    soil_moisture DECIMAL(5,2),
    dht_data JSONB, -- {temperature, humidity}
    sample_test_data JSONB,
    harvest_date DATE NOT NULL,
    batch_code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'harvested' CHECK (status IN ('harvested', 'sent_to_testing', 'testing_complete')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create test_results table (Testing Unit input)
CREATE TABLE test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    herb_batch_id UUID NOT NULL REFERENCES herb_batches(id),
    testing_company_id UUID NOT NULL REFERENCES companies(id),
    tested_by UUID NOT NULL REFERENCES profiles(id),
    quantity_received_kg DECIMAL(10,2) NOT NULL,
    quantity_approved_kg DECIMAL(10,2) NOT NULL,
    quantity_wasted_kg DECIMAL(10,2) NOT NULL,
    test_parameters JSONB NOT NULL, -- detailed test results
    quality_grade TEXT NOT NULL CHECK (quality_grade IN ('A', 'B', 'C', 'rejected')),
    test_date TIMESTAMPTZ NOT NULL,
    manufacturing_company_id UUID REFERENCES companies(id), -- where it's sent
    batch_qr_code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'tested' CHECK (status IN ('received', 'testing', 'tested', 'sent_to_manufacturing')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (quantity_approved_kg + quantity_wasted_kg = quantity_received_kg)
);

-- Create manufacturing_records table (Manufacturing Unit input)
CREATE TABLE manufacturing_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manufacturing_company_id UUID NOT NULL REFERENCES companies(id),
    created_by UUID NOT NULL REFERENCES profiles(id),
    test_result_ids UUID[] NOT NULL, -- array of test_result IDs used
    product_name TEXT NOT NULL,
    product_type TEXT NOT NULL,
    composition_details JSONB NOT NULL, -- detailed composition
    total_herb_quantity_used_kg DECIMAL(10,2) NOT NULL,
    final_product_quantity DECIMAL(10,2) NOT NULL,
    manufacturing_date TIMESTAMPTZ NOT NULL,
    batch_code TEXT UNIQUE NOT NULL,
    sensor_data JSONB, -- manufacturing sensor data
    status TEXT DEFAULT 'manufactured' CHECK (status IN ('in_progress', 'manufactured', 'sent_to_packaging')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create packaged_products table (Packaging Unit input)
CREATE TABLE packaged_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manufacturing_record_id UUID NOT NULL REFERENCES manufacturing_records(id),
    packaging_company_id UUID NOT NULL REFERENCES companies(id),
    packaged_by UUID NOT NULL REFERENCES profiles(id),
    product_qr_code TEXT UNIQUE NOT NULL,
    package_details JSONB NOT NULL, -- size, weight, packaging type
    verification_status TEXT DEFAULT 'verified' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    packaging_date TIMESTAMPTZ NOT NULL,
    expiry_date DATE,
    cost_breakdown JSONB, -- detailed cost information
    final_status TEXT DEFAULT 'packaged' CHECK (final_status IN ('packaged', 'shipped', 'delivered')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit_logs table for admin tracking
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE herb_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE packaged_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT role FROM profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION get_user_company_id(user_id UUID)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT company_id FROM profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT role = 'admin' FROM profiles WHERE id = user_id;
$$;

-- RLS Policies for companies
CREATE POLICY "Admins can view all companies" ON companies
    FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own company" ON companies
    FOR SELECT USING (id = get_user_company_id(auth.uid()));

-- RLS Policies for profiles
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (id = auth.uid());

-- RLS Policies for herb_batches
CREATE POLICY "Admins can view all herb batches" ON herb_batches
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Farmers can manage their own herb batches" ON herb_batches
    FOR ALL USING (farmer_company_id = get_user_company_id(auth.uid()) AND get_user_role(auth.uid()) = 'farmer');

CREATE POLICY "Testing units can view herb batches sent to them" ON herb_batches
    FOR SELECT USING (get_user_role(auth.uid()) = 'testing_unit' AND status IN ('sent_to_testing', 'testing_complete'));

-- RLS Policies for test_results
CREATE POLICY "Admins can view all test results" ON test_results
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Testing units can manage their own test results" ON test_results
    FOR ALL USING (testing_company_id = get_user_company_id(auth.uid()) AND get_user_role(auth.uid()) = 'testing_unit');

CREATE POLICY "Manufacturing units can view test results sent to them" ON test_results
    FOR SELECT USING (manufacturing_company_id = get_user_company_id(auth.uid()) AND get_user_role(auth.uid()) = 'manufacturing_unit');

CREATE POLICY "Farmers can view test results of their herbs" ON test_results
    FOR SELECT USING (
        get_user_role(auth.uid()) = 'farmer' AND 
        EXISTS (SELECT 1 FROM herb_batches WHERE id = herb_batch_id AND farmer_company_id = get_user_company_id(auth.uid()))
    );

-- RLS Policies for manufacturing_records
CREATE POLICY "Admins can view all manufacturing records" ON manufacturing_records
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Manufacturing units can manage their own records" ON manufacturing_records
    FOR ALL USING (manufacturing_company_id = get_user_company_id(auth.uid()) AND get_user_role(auth.uid()) = 'manufacturing_unit');

CREATE POLICY "Packaging units can view manufacturing records sent to them" ON manufacturing_records
    FOR SELECT USING (get_user_role(auth.uid()) = 'packaging_unit' AND status = 'sent_to_packaging');

-- RLS Policies for packaged_products
CREATE POLICY "Admins can view all packaged products" ON packaged_products
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Packaging units can manage their own packaged products" ON packaged_products
    FOR ALL USING (packaging_company_id = get_user_company_id(auth.uid()) AND get_user_role(auth.uid()) = 'packaging_unit');

-- RLS Policies for audit_logs
CREATE POLICY "Only admins can view audit logs" ON audit_logs
    FOR ALL USING (is_admin(auth.uid()));

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert into profiles table - role and company_id will be set separately by admin
    INSERT INTO profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
    RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_herb_batches_updated_at BEFORE UPDATE ON herb_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_results_updated_at BEFORE UPDATE ON test_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_manufacturing_records_updated_at BEFORE UPDATE ON manufacturing_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packaged_products_updated_at BEFORE UPDATE ON packaged_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();