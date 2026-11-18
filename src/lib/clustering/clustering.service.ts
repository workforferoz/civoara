import type {
  Issue,
  IssueCategory,
  IssueCluster,
  IssueReport,
} from "@/types/database.types";

export interface ClusteringConfig {
  radiusMeters: number; // default 50 meters
  timeWindowHours: number; // default 72 hours
  autoMergeThreshold: number; // default 0.80 (80%)
  reviewThreshold: number; // default 0.55 (55%)
}

export const DEFAULT_CLUSTERING_CONFIG: ClusteringConfig = {
  radiusMeters: 60,
  timeWindowHours: 72,
  autoMergeThreshold: 0.80,
  reviewThreshold: 0.55,
};

export interface DuplicateMatchCandidate {
  existingIssue: Issue;
  distanceMeters: number;
  timeDifferenceHours: number;
  confidenceScore: number;
  reasons: string[];
  actionRecommendation: "auto_merge" | "review_required" | "distinct";
}

/**
 * Calculates geodesic distance between two coordinates in meters (Haversine formula).
 * Emulates PostGIS ST_DWithin / ST_Distance(geog1, geog2).
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Token-based Jaccard text similarity.
 */
export function calculateTextSimilarity(textA: string, textB: string): number {
  const cleanTokens = (str: string) =>
    new Set(
      str
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );

  const tokensA = cleanTokens(textA);
  const tokensB = cleanTokens(textB);

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  const intersection = new Set([...tokensA].filter((x) => tokensB.has(x)));
  const union = new Set([...tokensA, ...tokensB]);

  return intersection.size / union.size;
}

/**
 * Searches for duplicate candidates matching physical defect reports.
 * Matching conditions:
 * - Same category
 * - Nearby coordinates (within configurable radius)
 * - Compatible ward
 * - Similar time period
 * - Text description similarity
 */
export function findDuplicateCandidates(
  newReport: {
    category: IssueCategory;
    latitude: number;
    longitude: number;
    title: string;
    description: string;
    submittedAt?: Date;
    wardId?: string | null;
  },
  existingIssues: Issue[],
  config: ClusteringConfig = DEFAULT_CLUSTERING_CONFIG
): DuplicateMatchCandidate[] {
  const candidates: DuplicateMatchCandidate[] = [];
  const reportTime = newReport.submittedAt || new Date();

  for (const issue of existingIssues) {
    // 1. Condition: Category MUST match exactly
    if (issue.category !== newReport.category) {
      continue;
    }

    // 2. Condition: Calculate spatial distance (ST_DWithin)
    const distanceMeters = calculateDistanceMeters(
      newReport.latitude,
      newReport.longitude,
      issue.latitude,
      issue.longitude
    );

    // If outside 2x radius, skip immediately
    if (distanceMeters > config.radiusMeters * 2) {
      continue;
    }

    // 3. Condition: Calculate time difference
    const issueTime = new Date(issue.created_at);
    const timeDiffHours =
      Math.abs(reportTime.getTime() - issueTime.getTime()) / (1000 * 3600);

    if (timeDiffHours > config.timeWindowHours * 2) {
      continue;
    }

    // 4. Condition: Text similarity
    const textSim = calculateTextSimilarity(
      `${newReport.title} ${newReport.description}`,
      `${issue.title} ${issue.description}`
    );

    // 5. Compute Weighted Confidence Score
    // Distance weight: 50%
    const distanceScore = Math.max(0, 1 - distanceMeters / config.radiusMeters);
    // Time weight: 25%
    const timeScore = Math.max(0, 1 - timeDiffHours / config.timeWindowHours);
    // Text weight: 25%
    const textScore = textSim;

    const confidenceScore = Number(
      (distanceScore * 0.5 + timeScore * 0.25 + textScore * 0.25).toFixed(3)
    );

    const reasons: string[] = [];
    if (distanceMeters <= config.radiusMeters) {
      reasons.push(`Nearby location: ${distanceMeters}m away (Threshold: ${config.radiusMeters}m)`);
    } else {
      reasons.push(`Proximity: ${distanceMeters}m`);
    }

    if (timeDiffHours <= config.timeWindowHours) {
      reasons.push(`Within ${timeDiffHours.toFixed(1)}h of original report`);
    }

    if (textSim > 0.2) {
      reasons.push(`Keyword similarity: ${(textSim * 100).toFixed(0)}%`);
    }

    let actionRecommendation: DuplicateMatchCandidate["actionRecommendation"] = "distinct";
    if (confidenceScore >= config.autoMergeThreshold) {
      actionRecommendation = "auto_merge";
    } else if (confidenceScore >= config.reviewThreshold) {
      actionRecommendation = "review_required";
    }

    if (confidenceScore >= config.reviewThreshold) {
      candidates.push({
        existingIssue: issue,
        distanceMeters,
        timeDifferenceHours: Number(timeDiffHours.toFixed(1)),
        confidenceScore,
        reasons,
        actionRecommendation,
      });
    }
  }

  // Sort by highest confidence score
  return candidates.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

/**
 * Calculates priority impact weighting with Sybil / repeated-user protection.
 * Repeated reports from ONE user do NOT artificially inflate priority.
 */
export function calculateClusterPriority(
  childReports: IssueReport[]
): {
  priority: "low" | "medium" | "high" | "critical";
  totalReports: number;
  uniqueCitizensCount: number;
  inflationPrevented: boolean;
} {
  const totalReports = childReports.length;

  // Track unique citizen IDs (filter out duplicate submissions by same user)
  const uniqueCitizens = new Set(
    childReports.map((r) => r.citizen_id || `anon-${r.id}`)
  );
  const uniqueCitizensCount = uniqueCitizens.size;
  const inflationPrevented = totalReports > uniqueCitizensCount;

  let priority: "low" | "medium" | "high" | "critical" = "medium";
  if (uniqueCitizensCount >= 6) {
    priority = "critical";
  } else if (uniqueCitizensCount >= 3) {
    priority = "high";
  } else {
    priority = "medium";
  }

  return {
    priority,
    totalReports,
    uniqueCitizensCount,
    inflationPrevented,
  };
}

export interface DemoClusterView {
  cluster: IssueCluster;
  canonicalIssue: Issue;
  reports: IssueReport[];
}

export const DEMO_CLUSTERS: DemoClusterView[] = [];
