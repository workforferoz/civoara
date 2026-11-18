import { NextResponse } from "next/server";
import { getCitizenIssues } from "@/lib/services/issue.service";
import { processSlaEscalations } from "@/lib/sla/escalation.processor";

export async function POST(request: Request) {
  // Security Guard: Check CRON_SECRET or dev mode
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  const isDev = process.env.NODE_ENV === "development";
  const isAuthorized = expectedSecret && authHeader === `Bearer ${expectedSecret}`;

  if (!isDev && !isAuthorized) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing cron secret authorization." },
      { status: 401 }
    );
  }

  try {
    const issues = await getCitizenIssues();
    const result = await processSlaEscalations(issues);

    return NextResponse.json({
      success: true,
      message: "SLA escalation sweep completed successfully.",
      result,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "SLA escalation processor failed.",
      },
      { status: 500 }
    );
  }
}
