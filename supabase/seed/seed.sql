-- ============================================================================
-- CIVOARA - DEVELOPMENT SEED SCRIPT
-- Controlled Seed Data for Departments, Wards, Routing Rules, SLAs & Test Users
-- ============================================================================

-- 1. SEED DEPARTMENTS
INSERT INTO departments (id, code, name, description, contact_email, contact_phone, is_active)
VALUES
  ('d1111111-1111-1111-1111-111111111111', 'PWD', 'Public Works Department', 'Roads, potholes, bridges, and municipal civil infrastructure.', 'pwd@civoara.gov', '+91 80 2297 5001', true),
  ('d2222222-2222-2222-2222-222222222222', 'SWM', 'Solid Waste Management', 'Garbage collection, illegal dumping, street sweeping, and sanitation.', 'swm@civoara.gov', '+91 80 2297 5002', true),
  ('d3333333-3333-3333-3333-333333333333', 'BESCOM', 'Electricity & Streetlighting', 'Streetlight maintenance, electrical hazards, and municipal illumination.', 'bescom@civoara.gov', '+91 80 2297 5003', true),
  ('d4444444-4444-4444-4444-444444444444', 'BWSSB', 'Water Supply & Sewerage', 'Water main pipe leakages, sewage overflows, and drain clogs.', 'bwssb@civoara.gov', '+91 80 2297 5004', true),
  ('d5555555-5555-5555-5555-555555555555', 'GEN', 'General Municipal Administration', 'Unassigned complaints, triage queue, and miscellaneous civic matters.', 'admin@civoara.gov', '+91 80 2297 5000', true)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 2. SEED WARDS (Demo Bengaluru polygons and coordinates)
INSERT INTO wards (id, ward_number, name, city, center_lat, center_lng, is_active)
VALUES
  ('w1010000-0000-0000-0000-000000000101', 'WARD-101', 'Central Business District', 'Bengaluru', 12.9716, 77.5946, true),
  ('w1020000-0000-0000-0000-000000000102', 'WARD-102', 'Indiranagar', 'Bengaluru', 12.9784, 77.6408, true),
  ('w1030000-0000-0000-0000-000000000103', 'WARD-103', 'Koramangala', 'Bengaluru', 12.9352, 77.6245, true),
  ('w1040000-0000-0000-0000-000000000104', 'WARD-104', 'Whitefield', 'Bengaluru', 12.9698, 77.7500, true),
  ('w1050000-0000-0000-0000-000000000105', 'WARD-105', 'Malleshwaram', 'Bengaluru', 13.0031, 77.5643, true)
ON CONFLICT (ward_number) DO UPDATE SET name = EXCLUDED.name;

-- 3. SEED SLA POLICIES (Demo Service Standards)
INSERT INTO sla_policies (id, category, version, resolution_hours, warning_threshold_hours, escalation_chain, is_active)
VALUES
  ('s1111111-1111-1111-1111-111111111111', 'pothole', 1, 48, 12, '{"level0": "officer", "level1": "supervisor", "level2": "commissioner", "level3": "admin"}'::jsonb, true),
  ('s2222222-2222-2222-2222-222222222222', 'garbage', 1, 24, 6, '{"level0": "officer", "level1": "supervisor", "level2": "commissioner", "level3": "admin"}'::jsonb, true),
  ('s3333333-3333-3333-3333-333333333333', 'broken_streetlight', 1, 72, 18, '{"level0": "officer", "level1": "supervisor", "level2": "commissioner", "level3": "admin"}'::jsonb, true),
  ('s4444444-4444-4444-4444-444444444444', 'water_leakage', 1, 12, 3, '{"level0": "officer", "level1": "supervisor", "level2": "commissioner", "level3": "admin"}'::jsonb, true),
  ('s5555555-5555-5555-5555-555555555555', 'other', 1, 96, 24, '{"level0": "officer", "level1": "supervisor", "level2": "commissioner", "level3": "admin"}'::jsonb, true)
ON CONFLICT (category, version) DO UPDATE SET resolution_hours = EXCLUDED.resolution_hours;

-- 4. SEED ROUTING RULES (Priority 2 = Fallback Rules)
INSERT INTO routing_rules (id, category, ward_id, department_id, priority, is_active)
VALUES
  ('r1111111-1111-1111-1111-111111111111', 'pothole', NULL, 'd1111111-1111-1111-1111-111111111111', 2, true),
  ('r2222222-2222-2222-2222-222222222222', 'garbage', NULL, 'd2222222-2222-2222-2222-222222222222', 2, true),
  ('r3333333-3333-3333-3333-333333333333', 'broken_streetlight', NULL, 'd3333333-3333-3333-3333-333333333333', 2, true),
  ('r4444444-4444-4444-4444-444444444444', 'water_leakage', NULL, 'd4444444-4444-4444-4444-444444444444', 2, true),
  ('r5555555-5555-5555-5555-555555555555', 'other', NULL, 'd5555555-5555-5555-5555-555555555555', 2, true)
ON CONFLICT (id) DO NOTHING;

-- Exact Category + Ward routing rule (Priority 1) for Ward 101 Potholes
INSERT INTO routing_rules (id, category, ward_id, department_id, priority, is_active)
VALUES
  ('r1010000-0000-0000-0000-000000000101', 'pothole', 'w1010000-0000-0000-0000-000000000101', 'd1111111-1111-1111-1111-111111111111', 1, true)
ON CONFLICT (id) DO NOTHING;

-- 5. SEED INITIAL ORGANIZATION VERSION
INSERT INTO organization_versions (id, version_number, description, effective_date)
VALUES
  ('ov111111-1111-1111-1111-111111111111', 1, 'Initial Municipal Baseline Organization 2026', NOW())
ON CONFLICT (version_number) DO NOTHING;
