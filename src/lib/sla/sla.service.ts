import type {
  Issue,
  IssueCategory,
  EscalationLevel,
  UserRole,
} from "@/types/database.types";

export interface SLAPolicyConfig {
  category: IssueCategory;
  version: number;
  resolutionHours: number;
  warningHours: number;
  escalationRoles: Record<EscalationLevel, UserRole>;
}

export const DEMO_SLA_POLICIES: Record<IssueCategory, SLAPolicyConfig> = {
  pothole: {
    category: "pothole",
    version: 1,
    resolutionHours: 48,
    warningHours: 12,
    escalationRoles: {
      0: "officer",
      1: "supervisor",
      2: "commissioner",
      3: "admin",
    },
  },
  garbage: {
    category: "garbage",
    version: 1,
    resolutionHours: 24,
    warningHours: 6,
    escalationRoles: {
      0: "officer",
      1: "supervisor",
      2: "commissioner",
      3: "admin",
    },
  },
  broken_streetlight: {
    category: "broken_streetlight",
    version: 1,
    resolutionHours: 72,
    warningHours: 18,
    escalationRoles: {
      0: "officer",
      1: "supervisor",
      2: "commissioner",
      3: "admin",
    },
  },
  water_leakage: {
    category: "water_leakage",
    version: 1,
    resolutionHours: 12,
    warningHours: 3,
    escalationRoles: {
      0: "officer",
      1: "supervisor",
      2: "commissioner",
      3: "admin",
    },
  },
  other: {
    category: "other",
    version: 1,
    resolutionHours: 96,
    warningHours: 24,
    escalationRoles: {
      0: "officer",
      1: "supervisor",
      2: "commissioner",
      3: "admin",
    },
  },
};

export interface SLAMetrics {
  status: "on_track" | "warning" | "breached" | "resolved";
  totalBudgetHours: number;
  elapsedHours: number;
  remainingHours: number;
  overdueHours: number;
  percentElapsed: number;
  formattedRemaining: string;
  isOverdue: boolean;
  currentLevel: EscalationLevel;
  nextEscalationRole: UserRole | null;
}

/**
 * Computes deterministic SLA metrics from authoritative server timestamps.
 * Authoritative business rules: Never trust client clocks.
 */
export function calculateSlaMetrics(
  issue: Partial<Issue>,
  asOfTime: Date = new Date()
): SLAMetrics {
  const policy =
    DEMO_SLA_POLICIES[issue.category as IssueCategory] ||
    DEMO_SLA_POLICIES.pothole;
  const totalBudgetHours = policy.resolutionHours;

  const createdAt = issue.created_at ? new Date(issue.created_at) : asOfTime;
  const deadline = issue.sla_deadline
    ? new Date(issue.sla_deadline)
    : new Date(createdAt.getTime() + totalBudgetHours * 3600 * 1000);

  if (issue.status === "resolved" || issue.status === "closed") {
    return {
      status: "resolved",
      totalBudgetHours,
      elapsedHours: Math.max(0, (deadline.getTime() - createdAt.getTime()) / 3600000),
      remainingHours: 0,
      overdueHours: 0,
      percentElapsed: 100,
      formattedRemaining: "Resolved within SLA",
      isOverdue: false,
      currentLevel: (issue.current_escalation_level as EscalationLevel) || 0,
      nextEscalationRole: null,
    };
  }

  const nowMs = asOfTime.getTime();
  const deadlineMs = deadline.getTime();
  const createdMs = createdAt.getTime();

  const totalDurationMs = Math.max(1, deadlineMs - createdMs);
  const elapsedMs = Math.max(0, nowMs - createdMs);
  const remainingMs = deadlineMs - nowMs;

  const isOverdue = remainingMs < 0;
  const overdueHours = isOverdue ? Math.abs(remainingMs) / 3600000 : 0;
  const remainingHours = isOverdue ? 0 : remainingMs / 3600000;
  const elapsedHours = elapsedMs / 3600000;

  const percentElapsed = Math.min(
    100,
    Math.round((elapsedMs / totalDurationMs) * 100)
  );

  let status: SLAMetrics["status"] = "on_track";
  if (isOverdue) {
    status = "breached";
  } else if (remainingHours <= policy.warningHours) {
    status = "warning";
  }

  // Format time remaining string
  let formattedRemaining = "";
  if (isOverdue) {
    const hours = Math.floor(overdueHours);
    const mins = Math.floor((overdueHours - hours) * 60);
    formattedRemaining = `Breached by ${hours}h ${mins}m`;
  } else {
    const hours = Math.floor(remainingHours);
    const mins = Math.floor((remainingHours - hours) * 60);
    formattedRemaining = `${hours}h ${mins}m remaining`;
  }

  const currentLevel = (issue.current_escalation_level as EscalationLevel) || 0;
  const nextLevel = (currentLevel + 1) as EscalationLevel;
  const nextEscalationRole = nextLevel <= 3 ? policy.escalationRoles[nextLevel] : null;

  return {
    status,
    totalBudgetHours,
    elapsedHours: Number(elapsedHours.toFixed(2)),
    remainingHours: Number(remainingHours.toFixed(2)),
    overdueHours: Number(overdueHours.toFixed(2)),
    percentElapsed,
    formattedRemaining,
    isOverdue,
    currentLevel,
    nextEscalationRole,
  };
}
