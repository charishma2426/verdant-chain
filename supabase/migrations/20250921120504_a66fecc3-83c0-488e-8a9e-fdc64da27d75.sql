-- First, create sample user profiles (these would normally be created via auth registration)
-- Note: In a real scenario, these would be created when users sign up through auth
INSERT INTO profiles (id, company_id, role, full_name, employee_id, is_active) VALUES
    ('770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'farmer', 'John Green', 'EMP-001', true),
    ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'farmer', 'Sarah Valley', 'EMP-002', true),
    ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'testing_unit', 'Dr. Mike Pure', 'LAB-001', true),
    ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'manufacturing_unit', 'Lisa Herbal', 'MFG-001', true),
    ('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'packaging_unit', 'Tom Secure', 'PKG-001', true),
    ('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'admin', 'Admin User', 'ADM-001', true);

-- Now insert the sample herb batches
INSERT INTO herb_batches (id, farmer_company_id, created_by, herb_name, herb_type, variety, quantity_kg, geo_location, soil_moisture, dht_data, sample_test_data, harvest_date, batch_code, status) VALUES
    ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'Basil', 'Culinary Herb', 'Sweet Basil', 25.50, '{"lat": 38.5816, "lng": -121.4944, "address": "123 Farm Road, Sacramento, CA"}', 15.2, '{"temperature": 22.5, "humidity": 65.3}', '{"ph": 6.8, "organic_matter": 3.2}', '2024-01-15', 'GF-BSL-240115-001', 'sent_to_testing'),
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Lavender', 'Medicinal Herb', 'English Lavender', 18.75, '{"lat": 36.7378, "lng": -119.7871, "address": "456 Valley Lane, Fresno, CA"}', 12.8, '{"temperature": 24.1, "humidity": 58.7}', '{"ph": 7.1, "organic_matter": 2.8}', '2024-01-20', 'VH-LAV-240120-001', 'testing_complete'),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'Mint', 'Culinary Herb', 'Peppermint', 32.25, '{"lat": 38.5816, "lng": -121.4944, "address": "123 Farm Road, Sacramento, CA"}', 18.5, '{"temperature": 21.8, "humidity": 72.1}', '{"ph": 6.9, "organic_matter": 3.5}', '2024-01-25', 'GF-MNT-240125-001', 'harvested');

-- Insert sample test results
INSERT INTO test_results (id, herb_batch_id, testing_company_id, tested_by, quantity_received_kg, quantity_approved_kg, quantity_wasted_kg, test_parameters, quality_grade, test_date, manufacturing_company_id, batch_qr_code, status) VALUES
    ('880e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 25.50, 24.10, 1.40, '{"moisture": 8.2, "pesticides": "none_detected", "heavy_metals": "within_limits", "microbial": "pass"}', 'A', '2024-01-18 10:30:00+00', '550e8400-e29b-41d4-a716-446655440003', 'QR-PTL-BSL-240118-001', 'sent_to_manufacturing'),
    ('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 18.75, 17.50, 1.25, '{"moisture": 9.1, "pesticides": "none_detected", "heavy_metals": "within_limits", "microbial": "pass"}', 'A', '2024-01-23 14:15:00+00', '550e8400-e29b-41d4-a716-446655440003', 'QR-PTL-LAV-240123-001', 'tested');

-- Insert sample manufacturing records
INSERT INTO manufacturing_records (id, manufacturing_company_id, created_by, test_result_ids, product_name, product_type, composition_details, total_herb_quantity_used_kg, final_product_quantity, manufacturing_date, batch_code, sensor_data, status) VALUES
    ('990e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', '{880e8400-e29b-41d4-a716-446655440000}', 'Basil Essential Oil', 'Essential Oil', '{"basil_extract": 95, "carrier_oil": 5, "processing_method": "steam_distillation"}', 24.10, 2.41, '2024-01-20 09:00:00+00', 'HMC-BEO-240120-001', '{"temperature": 100, "pressure": 1.2, "duration_hours": 4}', 'sent_to_packaging');

-- Insert sample packaged products
INSERT INTO packaged_products (id, manufacturing_record_id, packaging_company_id, packaged_by, product_qr_code, package_details, verification_status, packaging_date, expiry_date, cost_breakdown, final_status) VALUES
    ('aa0e8400-e29b-41d4-a716-446655440000', '990e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', 'QR-SPS-BEO-240122-001', '{"bottle_size": "30ml", "bottle_type": "amber_glass", "label": "premium", "weight_grams": 85}', 'verified', '2024-01-22 11:00:00+00', '2026-01-22', '{"raw_materials": 45.50, "manufacturing": 12.30, "packaging": 8.20, "total": 66.00}', 'packaged');