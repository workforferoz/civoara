-- ============================================================================
-- CIVOARA - MASTER DATABASE SCHEMA MIGRATION
-- Multi-Tier Municipal Accountability, Deterministic SLAs, and PostGIS Georouting
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'citizen',
    'officer',
    'supervisor',
    'commissioner',
    'admin'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE issue_category AS ENUM (
    'pothole',
    'garbage',
    'broken_streetlight',
    'water_leakage',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE issue_status AS ENUM (
    'submitted',
    'assigned',
    'in_progress',
    'escalated',
    'resolved',
    'closed',
    'pending_review'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE issue_priority AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- 1. DEPARTMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(128) NOT NULL,
  description TEXT,
  contact_email VARCHAR(128) NOT NULL,
  contact_phone VARCHAR(32),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_departments_code ON departments(code);
CREATE INDEX IF NOT EXISTS idx_departments_active ON departments(is_active);

-- ----------------------------------------------------------------------------
-- 2. WARDS (With PostGIS boundary polygons)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_number VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(128) NOT NULL,
  city VARCHAR(64) NOT NULL DEFAULT 'Bengaluru',
  boundary GEOGRAPHY(POLYGON, 4326),
  center_lat NUMERIC(10, 7) NOT NULL,
  center_lng NUMERIC(10, 7) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wards_ward_number ON wards(ward_number);
CREATE INDEX IF NOT EXISTS idx_wards_spatial_boundary ON wards USING GIST(boundary);

-- ----------------------------------------------------------------------------
-- 3. PROFILES (Linked to auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(128) NOT NULL,
  phone VARCHAR(32),
  role user_role NOT NULL DEFAULT 'citizen',
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON profiles(department_id);

-- Trigger: Prevent non-admin users from changing their own role
CREATE OR REPLACE FUNCTION check_profile_role_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is changing, ensure current executing user has admin claim or is postgres service role
  IF NEW.role <> OLD.role THEN
    IF current_setting('request.jwt.claims', true)::jsonb->>'role' <> 'service_role' THEN
      IF (SELECT role FROM profiles WHERE id = auth.uid()) <> 'admin' THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: Role modification requires administrative authority.';
      END IF;
    END IF;
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_self_escalation ON profiles;
CREATE TRIGGER trg_prevent_role_self_escalation
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_profile_role_update();

-- ----------------------------------------------------------------------------
-- 4. OFFICER ASSIGNMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS officer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  officer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  ward_id UUID REFERENCES wards(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_officer_assignments_officer ON officer_assignments(officer_id);
CREATE INDEX IF NOT EXISTS idx_officer_assignments_dept_ward ON officer_assignments(department_id, ward_id);

-- ----------------------------------------------------------------------------
-- 5. SLA POLICIES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sla_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category issue_category NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  resolution_hours INTEGER NOT NULL,
  warning_threshold_hours INTEGER NOT NULL,
  escalation_chain JSONB NOT NULL DEFAULT '{"level0": "officer", "level1": "supervisor", "level2": "commissioner", "level3": "admin"}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_sla_policy_category_version UNIQUE (category, version)
);

CREATE INDEX IF NOT EXISTS idx_sla_policies_category ON sla_policies(category, is_active);

-- ----------------------------------------------------------------------------
-- 6. ROUTING RULES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS routing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category issue_category NOT NULL,
  ward_id UUID REFERENCES wards(id) ON DELETE CASCADE, -- NULL indicates category-wide fallback
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  default_officer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  priority INTEGER NOT NULL DEFAULT 2, -- 1: Exact category + ward, 2: Fallback
  is_active BOOLEAN NOT NULL DEFAULT true,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_routing_rules_lookup ON routing_rules(category, ward_id, is_active);

-- ----------------------------------------------------------------------------
-- 7. ISSUES (Canonical Work Orders)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number VARCHAR(32) NOT NULL UNIQUE,
  category issue_category NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status issue_status NOT NULL DEFAULT 'submitted',
  priority issue_priority NOT NULL DEFAULT 'medium',
  ward_id UUID REFERENCES wards(id) ON DELETE SET NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  assigned_officer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  location_geog GEOGRAPHY(POINT, 4326),
  location_description TEXT,
  photo_url TEXT,
  resolution_photo_url TEXT,
  resolution_notes TEXT,
  sla_policy_version INTEGER NOT NULL DEFAULT 1,
  sla_started_at TIMESTAMPTZ,
  sla_deadline TIMESTAMPTZ,
  current_escalation_level INTEGER NOT NULL DEFAULT 0,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_issues_ref ON issues(reference_number);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_ward_dept ON issues(ward_id, department_id);
CREATE INDEX IF NOT EXISTS idx_issues_assigned_officer ON issues(assigned_officer_id);
CREATE INDEX IF NOT EXISTS idx_issues_sla_deadline ON issues(sla_deadline) WHERE status NOT IN ('resolved', 'closed');
CREATE INDEX IF NOT EXISTS idx_issues_spatial_location ON issues USING GIST(location_geog);

-- ----------------------------------------------------------------------------
-- 8. ISSUE REPORTS (Individual citizen submissions linked to canonical issues)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS issue_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  citizen_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  raw_description TEXT NOT NULL,
  raw_latitude NUMERIC(10, 7) NOT NULL,
  raw_longitude NUMERIC(10, 7) NOT NULL,
  location_description TEXT,
  photo_url TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_issue_reports_issue ON issue_reports(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_reports_citizen ON issue_reports(citizen_id);

-- ----------------------------------------------------------------------------
-- 9. ISSUE EVENTS (Immutable audit trail)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS issue_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type VARCHAR(64) NOT NULL,
  old_status issue_status,
  new_status issue_status,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_issue_events_issue_created ON issue_events(issue_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- 10. ESCALATION STEPS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS escalation_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level BETWEEN 0 AND 3),
  from_role user_role NOT NULL,
  to_role user_role NOT NULL,
  target_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  CONSTRAINT uq_escalation_issue_level UNIQUE (issue_id, level)
);

CREATE INDEX IF NOT EXISTS idx_escalation_steps_issue ON escalation_steps(issue_id, level);

-- ----------------------------------------------------------------------------
-- 11. ISSUE CLUSTERS (Duplicate groupings)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS issue_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  report_count INTEGER NOT NULL DEFAULT 1,
  confidence_score NUMERIC(5, 4) NOT NULL DEFAULT 1.0,
  cluster_radius_meters NUMERIC(8, 2) NOT NULL DEFAULT 50.0,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_issue_clusters_canonical ON issue_clusters(canonical_issue_id);

-- ----------------------------------------------------------------------------
-- 12. ORGANIZATION VERSIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organization_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_number INTEGER NOT NULL UNIQUE,
  description TEXT NOT NULL,
  effective_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 13. OWNERSHIP SEGMENTS (Fair SLA accountability across transfers)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ownership_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  officer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  organization_version_id UUID NOT NULL REFERENCES organization_versions(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  sla_budget_seconds INTEGER NOT NULL,
  elapsed_seconds INTEGER NOT NULL DEFAULT 0,
  outcome VARCHAR(32) CHECK (outcome IN ('resolved', 'escalated', 'transferred', 'in_progress'))
);

CREATE INDEX IF NOT EXISTS idx_ownership_segments_issue ON ownership_segments(issue_id);
CREATE INDEX IF NOT EXISTS idx_ownership_segments_dept ON ownership_segments(department_id);

-- ----------------------------------------------------------------------------
-- 14. ORGANIZATION CHANGE EVENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organization_change_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_version_id UUID NOT NULL REFERENCES organization_versions(id) ON DELETE CASCADE,
  event_type VARCHAR(64) NOT NULL,
  details JSONB NOT NULL,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_change_events_version ON organization_change_events(organization_version_id);

-- ----------------------------------------------------------------------------
-- 15. NOTIFICATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  type VARCHAR(32) NOT NULL DEFAULT 'system',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all 15 tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE officer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE routing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE ownership_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_change_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function: Get user role from JWT / profiles
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 1. PROFILES POLICIES
CREATE POLICY "Public profiles are readable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile name and phone"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. WARDS & DEPARTMENTS POLICIES (Publicly readable)
CREATE POLICY "Wards are readable by anyone"
  ON wards FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Departments are readable by anyone"
  ON departments FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Only admins can modify wards and departments"
  ON wards FOR ALL
  TO authenticated
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Only admins can modify departments table"
  ON departments FOR ALL
  TO authenticated
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

-- 3. ISSUES POLICIES
-- Public can view approved public issues (PII is absent from issues table)
CREATE POLICY "Public issues are viewable by everyone"
  ON issues FOR SELECT
  TO public
  USING (is_public = true);

-- Authenticated citizens can view any public issue, plus their own
CREATE POLICY "Citizens can insert issues"
  ON issues FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Officers can view issues in their department or assigned directly
CREATE POLICY "Officers can view assigned and department issues"
  ON issues FOR SELECT
  TO authenticated
  USING (
    get_current_user_role() IN ('supervisor', 'commissioner', 'admin')
    OR (
      get_current_user_role() = 'officer'
      AND (
        assigned_officer_id = auth.uid()
        OR department_id = (SELECT department_id FROM profiles WHERE id = auth.uid())
      )
    )
  );

-- Officers can update status and resolution of assigned issues
CREATE POLICY "Officers can update assigned issues"
  ON issues FOR UPDATE
  TO authenticated
  USING (
    get_current_user_role() IN ('supervisor', 'commissioner', 'admin')
    OR (get_current_user_role() = 'officer' AND assigned_officer_id = auth.uid())
  )
  WITH CHECK (
    get_current_user_role() IN ('supervisor', 'commissioner', 'admin')
    OR (get_current_user_role() = 'officer' AND assigned_officer_id = auth.uid())
  );

-- 4. ISSUE REPORTS POLICIES (Private citizen contact guard)
CREATE POLICY "Citizens can view only their own issue reports"
  ON issue_reports FOR SELECT
  TO authenticated
  USING (
    citizen_id = auth.uid()
    OR get_current_user_role() IN ('supervisor', 'commissioner', 'admin')
  );

CREATE POLICY "Citizens can submit issue reports"
  ON issue_reports FOR INSERT
  TO authenticated
  WITH CHECK (citizen_id = auth.uid() OR citizen_id IS NULL);

-- 5. NOTIFICATIONS POLICIES
CREATE POLICY "Users can only view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications (mark read)"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 6. ROUTING & SLA ADMIN POLICIES
CREATE POLICY "Routing rules readable by authenticated staff"
  ON routing_rules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "SLA policies readable by public"
  ON sla_policies FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage routing and SLA policies"
  ON routing_rules FOR ALL
  TO authenticated
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage SLA policies"
  ON sla_policies FOR ALL
  TO authenticated
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');
