import type {
  OwnershipSegment,
  OrganizationVersion,
  Issue,
} from "@/types/database.types";
import { getCitizenIssues } from "@/lib/services/issue.service";

export type RestructuringActionType =
  | "merge_departments"
  | "transfer_ward"
  | "reassign_officer"
  | "update_sla_policy";

export interface RestructuringAction {
  type: RestructuringActionType;
  description: string;
  sourceDepartmentId?: string;
  targetDepartmentId?: string;
  sourceWardId?: string;
  targetWardId?: string;
  officerId?: string;
  newOfficerId?: string;
  migrationPolicy: "fair_pro_rata" | "inherited_deadline";
}

export interface RestructuringPreview {
  action: RestructuringAction;
  affectedIssuesCount: number;
  affectedOverdueCount: number;
  affectedIssues: Issue[];
  sourceDepartmentName?: string;
  targetDepartmentName?: string;
  wardName?: string;
  estimatedDeadlineImpact: string;
  versionIncrement: number;
}

export interface RestructuringExecutionResult {
  success: boolean;
  newVersion: OrganizationVersion;
  closedSegmentsCount: number;
  openedSegmentsCount: number;
  affectedIssuesCount: number;
  executionTimestamp: string;
  auditMessage: string;
}

// In-memory simulation store for versioning and ownership segments
let currentVersionNumber = 1;

export const INITIAL_ORGANIZATION_VERSIONS: OrganizationVersion[] = [
  {
    id: "v1-baseline",
    version_number: 1,
    description: "Initial Municipal Framework 2026",
    effective_date: "2026-01-01T00:00:00.000Z",
    created_at: "2026-01-01T00:00:00.000Z",
  },
];

export const INITIAL_OWNERSHIP_SEGMENTS: OwnershipSegment[] = [];

/**
 * Previews the scope of a municipal restructuring action before committing changes.
 */
export async function previewRestructuring(
  action: RestructuringAction
): Promise<RestructuringPreview> {
  const issues = await getCitizenIssues();

  // Find issues affected by this departmental transfer or ward reassignment
  const affectedIssues = issues.filter((issue) => {
    if (issue.status === "resolved" || issue.status === "closed") return false;
    if (action.type === "merge_departments") {
      return issue.department_id === action.sourceDepartmentId;
    }
    if (action.type === "transfer_ward") {
      return issue.ward_id === action.sourceWardId;
    }
    return true;
  });

  const affectedOverdueCount = affectedIssues.filter((i) => {
    if (!i.sla_deadline) return false;
    return new Date() > new Date(i.sla_deadline);
  }).length;

  return {
    action,
    affectedIssuesCount: affectedIssues.length,
    affectedOverdueCount,
    affectedIssues,
    versionIncrement: currentVersionNumber + 1,
    estimatedDeadlineImpact:
      action.migrationPolicy === "fair_pro_rata"
        ? "Fair Pro-Rata: Previous department keeps historical elapsed time. New department receives fresh SLA segment budget."
        : "Inherited Deadline: Total original ticket deadline preserved. Ownership segment records transfer boundary.",
  };
}

/**
 * Transactionally commits an administrative restructuring action.
 * Generates new organization version and records immutable ownership_segments.
 */
export async function executeRestructuring(
  action: RestructuringAction
): Promise<RestructuringExecutionResult> {
  currentVersionNumber += 1;
  const now = new Date();

  const newVersion: OrganizationVersion = {
    id: `v${currentVersionNumber}-${action.type}`,
    version_number: currentVersionNumber,
    description: action.description,
    effective_date: now.toISOString(),
    created_at: now.toISOString(),
  };

  const preview = await previewRestructuring(action);
  let closedCount = 0;
  let openedCount = 0;

  for (const issue of preview.affectedIssues) {
    // 1. Close the previous active ownership segment
    const activeSeg = INITIAL_OWNERSHIP_SEGMENTS.find(
      (s) => s.issue_id === issue.id && s.ended_at === null
    );

    if (activeSeg) {
      activeSeg.ended_at = now.toISOString();
      const elapsedMs = now.getTime() - new Date(activeSeg.started_at).getTime();
      activeSeg.elapsed_seconds = Math.max(0, Math.floor(elapsedMs / 1000));
      activeSeg.outcome = "transferred";
      closedCount++;
    }

    // 2. Open new ownership segment for the new department
    const targetDeptId =
      action.targetDepartmentId || "d1111111-1111-1111-1111-111111111111";

    INITIAL_OWNERSHIP_SEGMENTS.push({
      id: `seg-${Date.now()}-${issue.id.slice(0, 8)}`,
      issue_id: issue.id,
      department_id: targetDeptId,
      officer_id: action.newOfficerId || null,
      organization_version_id: newVersion.id,
      started_at: now.toISOString(),
      ended_at: null,
      sla_budget_seconds: 48 * 3600, // 48h new segment budget
      elapsed_seconds: 0,
      outcome: "in_progress",
    });
    openedCount++;

    // 3. Update issue's department while PRESERVING original creation date
    issue.department_id = targetDeptId;
    issue.updated_at = now.toISOString();
  }

  INITIAL_ORGANIZATION_VERSIONS.push(newVersion);

  return {
    success: true,
    newVersion,
    closedSegmentsCount: closedCount,
    openedSegmentsCount: openedCount,
    affectedIssuesCount: preview.affectedIssuesCount,
    executionTimestamp: now.toISOString(),
    auditMessage: `Organization Version ${newVersion.version_number} deployed. Closed ${closedCount} historical segments and opened ${openedCount} new fair ownership segments.`,
  };
}

export function getOwnershipSegments(issueId?: string): OwnershipSegment[] {
  if (issueId) {
    return INITIAL_OWNERSHIP_SEGMENTS.filter((s) => s.issue_id === issueId);
  }
  return INITIAL_OWNERSHIP_SEGMENTS;
}

export function getOrganizationVersions(): OrganizationVersion[] {
  return INITIAL_ORGANIZATION_VERSIONS;
}
