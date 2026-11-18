export type UserRole =
  | "citizen"
  | "officer"
  | "supervisor"
  | "commissioner"
  | "admin";

export type IssueCategory =
  | "pothole"
  | "garbage"
  | "broken_streetlight"
  | "water_leakage"
  | "other";

export type IssueStatus =
  | "submitted"
  | "assigned"
  | "in_progress"
  | "escalated"
  | "resolved"
  | "closed"
  | "pending_review";

export type EscalationLevel = 0 | 1 | 2 | 3;

export interface Profile {
  id: string; // matches auth.users.id
  email: string;
  full_name: string;
  phone?: string | null;
  role: UserRole;
  department_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ward {
  id: string;
  ward_number: string;
  name: string;
  city: string;
  boundaries_geojson?: Record<string, unknown> | null;
  center_lat: number;
  center_lng: number;
  is_active: boolean;
  created_at: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description: string;
  contact_email: string;
  contact_phone?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface OfficerAssignment {
  id: string;
  officer_id: string;
  department_id: string;
  ward_id?: string | null;
  is_active: boolean;
  assigned_at: string;
}

export interface RoutingRule {
  id: string;
  category: IssueCategory;
  ward_id?: string | null; // null represents category-wide fallback
  department_id: string;
  default_officer_id?: string | null;
  priority: number; // 1 = exact, 2 = fallback
  is_active: boolean;
  effective_from: string;
  effective_to?: string | null;
  created_at: string;
}

export interface SLAPolicy {
  id: string;
  category: IssueCategory;
  version: number;
  resolution_hours: number;
  warning_threshold_hours: number;
  escalation_chain: {
    level0_role: string;
    level1_role: string;
    level2_role: string;
    level3_role: string;
  };
  is_active: boolean;
  created_at: string;
}

export interface Issue {
  id: string;
  reference_number: string; // e.g. CIV-2026-XXXXX
  category: IssueCategory;
  title: string;
  description: string;
  status: IssueStatus;
  priority: "low" | "medium" | "high" | "critical";
  ward_id?: string | null;
  department_id?: string | null;
  assigned_officer_id?: string | null;
  latitude: number;
  longitude: number;
  location_description?: string | null;
  photo_url?: string | null;
  resolution_photo_url?: string | null;
  resolution_notes?: string | null;
  sla_policy_version: number;
  sla_deadline?: string | null;
  current_escalation_level: EscalationLevel;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
}

export interface IssueReport {
  id: string;
  issue_id: string; // canonical issue reference
  citizen_id?: string | null; // null for anonymous or public reporting
  raw_description: string;
  raw_latitude: number;
  raw_longitude: number;
  location_description?: string | null;
  photo_url?: string | null;
  submitted_at: string;
}

export interface IssueEvent {
  id: string;
  issue_id: string;
  actor_id?: string | null;
  event_type:
    | "created"
    | "assigned"
    | "reassigned"
    | "status_changed"
    | "sla_started"
    | "escalated"
    | "resolved"
    | "clustered"
    | "ownership_transferred"
    | "commented";
  old_status?: IssueStatus | null;
  new_status?: IssueStatus | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

export interface EscalationStep {
  id: string;
  issue_id: string;
  level: EscalationLevel;
  from_role: UserRole;
  to_role: UserRole;
  target_user_id?: string | null;
  reason: string;
  triggered_at: string;
  acknowledged_at?: string | null;
}

export interface IssueCluster {
  id: string;
  canonical_issue_id: string;
  report_count: number;
  confidence_score: number;
  cluster_radius_meters: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface OwnershipSegment {
  id: string;
  issue_id: string;
  department_id: string;
  officer_id?: string | null;
  organization_version_id: string;
  started_at: string;
  ended_at?: string | null;
  sla_budget_seconds: number;
  elapsed_seconds: number;
  outcome?: "resolved" | "escalated" | "transferred" | "in_progress" | null;
}

export interface OrganizationVersion {
  id: string;
  version_number: number;
  description: string;
  effective_date: string;
  created_by?: string | null;
  created_at: string;
}

export interface OrganizationChangeEvent {
  id: string;
  organization_version_id: string;
  event_type: "department_merge" | "ward_transfer" | "rule_change" | "officer_reassignment";
  details: Record<string, unknown>;
  executed_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link?: string | null;
  type: "sla_warning" | "escalation" | "assignment" | "resolution" | "system";
  is_read: boolean;
  created_at: string;
}
