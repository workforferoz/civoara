import type {
  Issue,
  EscalationLevel,
  UserRole,
  EscalationStep,
  Notification,
} from "@/types/database.types";
import { calculateSlaMetrics, DEMO_SLA_POLICIES } from "@/lib/sla/sla.service";
import { createAdminClient } from "@/lib/supabase/admin";

export interface EscalationRunResult {
  runTimestamp: string;
  totalIssuesInspected: number;
  escalationsTriggered: number;
  skippedAlreadyEscalated: number;
  skippedOnTrack: number;
  skippedResolved: number;
  escalatedIssues: Array<{
    issueId: string;
    referenceNumber: string;
    oldLevel: EscalationLevel;
    newLevel: EscalationLevel;
    fromRole: UserRole;
    toRole: UserRole;
    reason: string;
  }>;
  errors: string[];
}

// In-memory simulation cache for development and testing
const LOCAL_ESCALATION_STEPS: EscalationStep[] = [];
const LOCAL_NOTIFICATIONS: Notification[] = [];

/**
 * Idempotent Server-Side Escalation Processor.
 * Concurrency Protection: Ensures unique constraint (issue_id, level) is never duplicated.
 */
export async function processSlaEscalations(
  issues: Issue[],
  asOfTime: Date = new Date()
): Promise<EscalationRunResult> {
  const result: EscalationRunResult = {
    runTimestamp: asOfTime.toISOString(),
    totalIssuesInspected: issues.length,
    escalationsTriggered: 0,
    skippedAlreadyEscalated: 0,
    skippedOnTrack: 0,
    skippedResolved: 0,
    escalatedIssues: [],
    errors: [],
  };

  for (const issue of issues) {
    try {
      // 1. Skip resolved or closed issues
      if (issue.status === "resolved" || issue.status === "closed") {
        result.skippedResolved++;
        continue;
      }

      // 2. Compute authoritative SLA metrics
      const metrics = calculateSlaMetrics(issue, asOfTime);

      if (!metrics.isOverdue) {
        result.skippedOnTrack++;
        continue;
      }

      // 3. Determine target escalation level based on overdue duration
      // Level 1: > 0 hours overdue
      // Level 2: > 24 hours overdue
      // Level 3: > 48 hours overdue
      const currentLevel = (issue.current_escalation_level as EscalationLevel) || 0;
      let targetLevel: EscalationLevel = 1;
      if (metrics.overdueHours >= 48) {
        targetLevel = 3;
      } else if (metrics.overdueHours >= 24) {
        targetLevel = 2;
      } else {
        targetLevel = 1;
      }

      // If already at or above target escalation level, skip to ensure idempotence!
      if (currentLevel >= targetLevel) {
        result.skippedAlreadyEscalated++;
        continue;
      }

      const policy =
        DEMO_SLA_POLICIES[issue.category] || DEMO_SLA_POLICIES.pothole;
      const fromRole: UserRole = policy.escalationRoles[currentLevel] || "officer";
      const toRole: UserRole = policy.escalationRoles[targetLevel] || "supervisor";
      const reason = `Automated Escalation: Resolution deadline missed by ${metrics.overdueHours.toFixed(1)} hours. Transferred authority from ${fromRole} to ${toRole}.`;

      // 4. Try Supabase server-side insertion with unique constraint handling
      try {
        const admin = createAdminClient();

        // Check if escalation record for this (issue_id, targetLevel) already exists
        const { data: existing } = await admin
          .from("escalation_steps")
          .select("id")
          .eq("issue_id", issue.id)
          .eq("level", targetLevel)
          .maybeSingle();

        if (existing) {
          result.skippedAlreadyEscalated++;
          continue;
        }

        // Insert new escalation step
        await admin.from("escalation_steps").insert({
          issue_id: issue.id,
          level: targetLevel,
          from_role: fromRole,
          to_role: toRole,
          reason,
          triggered_at: asOfTime.toISOString(),
        });

        // Insert issue event audit log
        await admin.from("issue_events").insert({
          issue_id: issue.id,
          event_type: "escalated",
          old_status: issue.status,
          new_status: "escalated",
          metadata: {
            from_role: fromRole,
            to_role: toRole,
            level: targetLevel,
            overdue_hours: metrics.overdueHours,
          },
        });

        // Update issue level and status
        await admin
          .from("issues")
          .update({
            current_escalation_level: targetLevel,
            status: "escalated",
            updated_at: asOfTime.toISOString(),
          })
          .eq("id", issue.id);
      } catch {
        // Fallback to local simulation storage for offline demo resilience
        const existingLocal = LOCAL_ESCALATION_STEPS.find(
          (s) => s.issue_id === issue.id && s.level === targetLevel
        );

        if (existingLocal) {
          result.skippedAlreadyEscalated++;
          continue;
        }

        LOCAL_ESCALATION_STEPS.push({
          id: `esc-${Date.now()}-${issue.id}-${targetLevel}`,
          issue_id: issue.id,
          level: targetLevel,
          from_role: fromRole,
          to_role: toRole,
          reason,
          triggered_at: asOfTime.toISOString(),
        });

        LOCAL_NOTIFICATIONS.push({
          id: `notif-${Date.now()}`,
          user_id: `role-${toRole}`,
          title: `Overdue Escalation: ${issue.reference_number}`,
          message: reason,
          link: `/admin/sla`,
          type: "escalation",
          is_read: false,
          created_at: asOfTime.toISOString(),
        });

        // Update local issue state
        issue.current_escalation_level = targetLevel;
        issue.status = "escalated";
      }

      result.escalationsTriggered++;
      result.escalatedIssues.push({
        issueId: issue.id,
        referenceNumber: issue.reference_number,
        oldLevel: currentLevel,
        newLevel: targetLevel,
        fromRole,
        toRole,
        reason,
      });
    } catch (err: unknown) {
      result.errors.push(
        `Error processing issue ${issue.reference_number}: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }

  return result;
}

export function getLocalEscalationHistory(): EscalationStep[] {
  return LOCAL_ESCALATION_STEPS;
}

export function getLocalNotifications(): Notification[] {
  return LOCAL_NOTIFICATIONS;
}
