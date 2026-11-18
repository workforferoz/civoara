import { createClient } from "@/lib/supabase/client";
import type { Issue, IssueCategory } from "@/types/database.types";

export interface CreateIssueInput {
  title: string;
  category: IssueCategory;
  description: string;
  latitude: number;
  longitude: number;
  locationDescription?: string;
  photoUrl?: string | null;
  citizenId?: string | null;
}

const CATEGORY_SLA_HOURS: Record<IssueCategory, number> = {
  pothole: 48,
  garbage: 24,
  broken_streetlight: 72,
  water_leakage: 12,
  other: 96,
};

// Local storage key for civic reports
const LOCAL_STORAGE_ISSUES_KEY = "civoara_civic_issues";

export function clearAllCivicIssues(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("civoara_demo_issues");
      localStorage.removeItem(LOCAL_STORAGE_ISSUES_KEY);
    } catch {}
  }
}

function generateReferenceNumber(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `CIV-${year}-${randomSuffix}`;
}

export async function createIssueReport(input: CreateIssueInput): Promise<Issue> {
  const referenceNumber = generateReferenceNumber();
  const slaHours = CATEGORY_SLA_HOURS[input.category] || 48;
  const now = new Date();
  const deadline = new Date(now.getTime() + slaHours * 60 * 60 * 1000);

  const newIssue: Issue = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `issue-${Date.now()}`,
    reference_number: referenceNumber,
    category: input.category,
    title: input.title,
    description: input.description,
    status: "submitted",
    priority: "medium",
    latitude: input.latitude,
    longitude: input.longitude,
    location_description: input.locationDescription || null,
    photo_url: input.photoUrl || null,
    sla_policy_version: 1,
    sla_deadline: deadline.toISOString(),
    current_escalation_level: 0,
    is_public: true,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  // Try saving to Supabase if client is configured
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("issues")
      .insert({
        reference_number: newIssue.reference_number,
        category: newIssue.category,
        title: newIssue.title,
        description: newIssue.description,
        status: newIssue.status,
        priority: newIssue.priority,
        latitude: newIssue.latitude,
        longitude: newIssue.longitude,
        location_description: newIssue.location_description,
        photo_url: newIssue.photo_url,
        sla_policy_version: 1,
        sla_deadline: newIssue.sla_deadline,
        current_escalation_level: 0,
        is_public: true,
      })
      .select()
      .single();

    if (!error && data) {
      // Also create issue_reports record
      await supabase.from("issue_reports").insert({
        issue_id: data.id,
        citizen_id: input.citizenId || null,
        raw_description: input.description,
        raw_latitude: input.latitude,
        raw_longitude: input.longitude,
        location_description: input.locationDescription || null,
        photo_url: input.photoUrl || null,
      });

      // Also create issue_events audit log
      await supabase.from("issue_events").insert({
        issue_id: data.id,
        actor_id: input.citizenId || null,
        event_type: "created",
        new_status: "submitted",
        metadata: { category: input.category, reference: referenceNumber },
      });

      return data as Issue;
    }
  } catch (err) {
    console.warn("Supabase insert fell back to local cache:", err);
  }

  // Fallback to local persistence for offline/demo resilience
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_ISSUES_KEY);
      const list: Issue[] = stored ? JSON.parse(stored) : [];
      list.unshift(newIssue);
      localStorage.setItem(LOCAL_STORAGE_ISSUES_KEY, JSON.stringify(list));
    } catch {
      // Ignore local storage quota errors
    }
  }

  return newIssue;
}

export async function getCitizenIssues(citizenId?: string): Promise<Issue[]> {
  // First try Supabase
  try {
    const supabase = createClient();
    let query = supabase
      .from("issues")
      .select("*")
      .order("created_at", { ascending: false });

    if (citizenId) {
      // Join on issue_reports
      const { data: reports } = await supabase
        .from("issue_reports")
        .select("issue_id")
        .eq("citizen_id", citizenId);

      if (reports && reports.length > 0) {
        const issueIds = reports.map((r) => r.issue_id);
        query = query.in("id", issueIds);
      }
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data as Issue[];
    }
  } catch (err) {
    console.warn("Supabase query fell back to local cache:", err);
  }

  // Fallback to local storage (purge legacy demo keys first)
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("civoara_demo_issues");
      const stored = localStorage.getItem(LOCAL_STORAGE_ISSUES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Issue[];
        // Filter out any legacy dummy/demo/sample issues
        const clean = parsed.filter(
          (i) =>
            !i.id.startsWith("demo-") &&
            !i.id.startsWith("issue-demo") &&
            !i.reference_number?.includes("DEMO") &&
            !i.title?.toLowerCase().includes("sample") &&
            !i.title?.toLowerCase().includes("demo") &&
            !i.title?.toLowerCase().includes("dummy")
        );
        if (clean.length !== parsed.length) {
          localStorage.setItem(LOCAL_STORAGE_ISSUES_KEY, JSON.stringify(clean));
        }
        return clean;
      }
    } catch {
      // Return empty
    }
  }

  // Default empty list when no issues exist
  return [];
}
