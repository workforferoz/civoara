import type {
  IssueCategory,
  RoutingRule,
  Department,
} from "@/types/database.types";
import { identifyWardByCoordinates } from "@/lib/services/ward.service";

export interface RoutingInput {
  category: IssueCategory;
  latitude: number;
  longitude: number;
  wardId?: string | null;
  effectiveDate?: Date;
}

export interface RoutingResolution {
  success: boolean;
  departmentId: string;
  departmentCode: string;
  departmentName: string;
  wardId: string | null;
  wardName: string;
  assignedOfficerId: string | null;
  assignedOfficerName: string | null;
  slaPolicyVersion: number;
  slaResolutionHours: number;
  priorityLevel: 1 | 2 | 3;
  matchType: "exact" | "fallback" | "unassigned_admin_queue";
  conflictDetected: boolean;
  message: string;
}

// Built-in Mock Rules & Departments for resilient demo & testing
export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: "d1111111-1111-1111-1111-111111111111",
    code: "PWD",
    name: "Public Works Department",
    description: "Roads, potholes, bridges, civil structures.",
    contact_email: "pwd@civoara.gov",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "d2222222-2222-2222-2222-222222222222",
    code: "SWM",
    name: "Solid Waste Management",
    description: "Garbage collection, street cleaning, landfills.",
    contact_email: "swm@civoara.gov",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "d3333333-3333-3333-3333-333333333333",
    code: "BESCOM",
    name: "Electricity & Streetlighting",
    description: "Illumination, electrical hazards, substations.",
    contact_email: "bescom@civoara.gov",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "d4444444-4444-4444-4444-444444444444",
    code: "BWSSB",
    name: "Water Supply & Sewerage",
    description: "Clean water pipeline leaks, sewer drains.",
    contact_email: "bwssb@civoara.gov",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "d5555555-5555-5555-5555-555555555555",
    code: "GEN",
    name: "General Administrative Triage Queue",
    description: "Administrative review for unassigned issues and boundary disputes.",
    contact_email: "admin@civoara.gov",
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_ROUTING_RULES: RoutingRule[] = [
  // Priority 1: Exact Category + Ward Match (Ward 101 Potholes)
  {
    id: "r-exact-101-pothole",
    category: "pothole",
    ward_id: "a1010000-0000-0000-0000-000000000101",
    department_id: "d1111111-1111-1111-1111-111111111111", // PWD
    default_officer_id: "officer-ramesh-kumar",
    priority: 1,
    is_active: true,
    effective_from: "2026-01-01T00:00:00.000Z",
    created_at: new Date().toISOString(),
  },
  // Priority 1: Exact Category + Ward Match (Ward 102 Garbage)
  {
    id: "r-exact-102-garbage",
    category: "garbage",
    ward_id: "a1020000-0000-0000-0000-000000000102",
    department_id: "d2222222-2222-2222-2222-222222222222", // SWM
    default_officer_id: "officer-swm-lead",
    priority: 1,
    is_active: true,
    effective_from: "2026-01-01T00:00:00.000Z",
    created_at: new Date().toISOString(),
  },
  // Priority 2: Fallback Rules (Category-Wide)
  {
    id: "r-fallback-pothole",
    category: "pothole",
    ward_id: null,
    department_id: "d1111111-1111-1111-1111-111111111111",
    priority: 2,
    is_active: true,
    effective_from: "2026-01-01T00:00:00.000Z",
    created_at: new Date().toISOString(),
  },
  {
    id: "r-fallback-garbage",
    category: "garbage",
    ward_id: null,
    department_id: "d2222222-2222-2222-2222-222222222222",
    priority: 2,
    is_active: true,
    effective_from: "2026-01-01T00:00:00.000Z",
    created_at: new Date().toISOString(),
  },
  {
    id: "r-fallback-broken-streetlight",
    category: "broken_streetlight",
    ward_id: null,
    department_id: "d3333333-3333-3333-3333-333333333333",
    priority: 2,
    is_active: true,
    effective_from: "2026-01-01T00:00:00.000Z",
    created_at: new Date().toISOString(),
  },
  {
    id: "r-fallback-water-leakage",
    category: "water_leakage",
    ward_id: null,
    department_id: "d4444444-4444-4444-4444-444444444444",
    priority: 2,
    is_active: true,
    effective_from: "2026-01-01T00:00:00.000Z",
    created_at: new Date().toISOString(),
  },
  {
    id: "r-fallback-other",
    category: "other",
    ward_id: null,
    department_id: "d5555555-5555-5555-5555-555555555555",
    priority: 2,
    is_active: true,
    effective_from: "2026-01-01T00:00:00.000Z",
    created_at: new Date().toISOString(),
  },
];

const SLA_HOURS: Record<IssueCategory, number> = {
  pothole: 48,
  garbage: 24,
  broken_streetlight: 72,
  water_leakage: 12,
  other: 96,
};

/**
 * Executes deterministic routing resolution based on Category, Coordinates, and Ward.
 * Priority 1: Exact category + ward rule
 * Priority 2: Category-specific fallback rule
 * Priority 3: Default administrative queue
 *
 * Conflict Protection: Rejects ambiguous configurations where multiple equally valid rules match.
 */
export async function resolveRouting(
  input: RoutingInput,
  customRules: RoutingRule[] = INITIAL_ROUTING_RULES
): Promise<RoutingResolution> {
  const effectiveDate = input.effectiveDate || new Date();

  // 1. Resolve Ward Boundary via Point-in-Polygon
  const ward = await identifyWardByCoordinates(input.latitude, input.longitude);
  const wardId = ward ? ward.id : null;
  const wardName = ward ? `${ward.wardNumber} - ${ward.name}` : "Unassigned Outside Ward Boundary";

  // Filter only active rules whose effective dates are valid
  const activeRules = customRules.filter((r) => {
    if (!r.is_active) return false;
    const from = new Date(r.effective_from);
    if (effectiveDate < from) return false;
    if (r.effective_to && effectiveDate > new Date(r.effective_to)) return false;
    return true;
  });

  // Check Priority 1: Exact match on Category AND Ward
  if (wardId) {
    const exactMatches = activeRules.filter(
      (r) => r.category === input.category && r.ward_id === wardId && r.priority === 1
    );

    // Conflict detection: If multiple exact rules exist, reject ambiguous config!
    if (exactMatches.length > 1) {
      return {
        success: false,
        departmentId: "d5555555-5555-5555-5555-555555555555",
        departmentCode: "GEN",
        departmentName: "General Administrative Triage Queue",
        wardId,
        wardName,
        assignedOfficerId: null,
        assignedOfficerName: null,
        slaPolicyVersion: 1,
        slaResolutionHours: SLA_HOURS[input.category] || 48,
        priorityLevel: 3,
        matchType: "unassigned_admin_queue",
        conflictDetected: true,
        message: `CONFLICT REJECTED: Multiple active Priority 1 rules detected for category '${input.category}' in ${wardName}. Routed to Administrative Review.`,
      };
    }

    if (exactMatches.length === 1) {
      const rule = exactMatches[0];
      const dept = INITIAL_DEPARTMENTS.find((d) => d.id === rule.department_id) || INITIAL_DEPARTMENTS[0];
      return {
        success: true,
        departmentId: dept.id,
        departmentCode: dept.code,
        departmentName: dept.name,
        wardId,
        wardName,
        assignedOfficerId: rule.default_officer_id || "officer-ramesh-kumar",
        assignedOfficerName: rule.default_officer_id ? "Inspector Ramesh Kumar" : "Designated Ward Officer",
        slaPolicyVersion: 1,
        slaResolutionHours: SLA_HOURS[input.category] || 48,
        priorityLevel: 1,
        matchType: "exact",
        conflictDetected: false,
        message: `Matched Priority 1 Exact Rule [${rule.id}]: Category '${input.category}' in ${wardName}.`,
      };
    }
  }

  // Check Priority 2: Category-wide fallback rule (ward_id is null)
  const fallbackMatches = activeRules.filter(
    (r) => r.category === input.category && (r.ward_id === null || r.ward_id === undefined)
  );

  if (fallbackMatches.length > 1) {
    return {
      success: false,
      departmentId: "d5555555-5555-5555-5555-555555555555",
      departmentCode: "GEN",
      departmentName: "General Administrative Triage Queue",
      wardId,
      wardName,
      assignedOfficerId: null,
      assignedOfficerName: null,
      slaPolicyVersion: 1,
      slaResolutionHours: SLA_HOURS[input.category] || 48,
      priorityLevel: 3,
      matchType: "unassigned_admin_queue",
      conflictDetected: true,
      message: `CONFLICT REJECTED: Multiple category fallback rules detected for '${input.category}'. Routed to Admin Review.`,
    };
  }

  if (fallbackMatches.length === 1) {
    const rule = fallbackMatches[0];
    const dept = INITIAL_DEPARTMENTS.find((d) => d.id === rule.department_id) || INITIAL_DEPARTMENTS[4];
    return {
      success: true,
      departmentId: dept.id,
      departmentCode: dept.code,
      departmentName: dept.name,
      wardId,
      wardName,
      assignedOfficerId: rule.default_officer_id || null,
      assignedOfficerName: rule.default_officer_id ? "Department Roster Officer" : null,
      slaPolicyVersion: 1,
      slaResolutionHours: SLA_HOURS[input.category] || 48,
      priorityLevel: 2,
      matchType: "fallback",
      conflictDetected: false,
      message: `Matched Priority 2 Fallback Rule for category '${input.category}'. Assigned to ${dept.name}.`,
    };
  }

  // Check Priority 3: Outside configured wards or missing rules -> Administrative Triage Queue
  const adminDept = INITIAL_DEPARTMENTS.find((d) => d.code === "GEN") || INITIAL_DEPARTMENTS[4];
  return {
    success: true,
    departmentId: adminDept.id,
    departmentCode: adminDept.code,
    departmentName: adminDept.name,
    wardId,
    wardName,
    assignedOfficerId: null,
    assignedOfficerName: null,
    slaPolicyVersion: 1,
    slaResolutionHours: SLA_HOURS[input.category] || 48,
    priorityLevel: 3,
    matchType: "unassigned_admin_queue",
    conflictDetected: false,
    message: wardId
      ? `No active routing rule found for '${input.category}' in ${wardName}. Routed to Administrative Review Queue.`
      : `Coordinates fall outside all registered municipal wards. Routed to Administrative Review Queue.`,
  };
}
