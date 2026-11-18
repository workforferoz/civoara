import { NextResponse } from "next/server";
import { runDevelopmentSeed } from "@/lib/services/seed.service";

export async function POST(request: Request) {
  // Guard: require CRON_SECRET or development mode
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  const isDev = process.env.NODE_ENV === "development";
  const isAuthorized = expectedSecret && authHeader === `Bearer ${expectedSecret}`;

  if (!isDev && !isAuthorized) {
    return NextResponse.json(
      { error: "Forbidden: Controlled seed is only available in development or with valid administrative secret." },
      { status: 403 }
    );
  }

  try {
    const results = await runDevelopmentSeed();
    return NextResponse.json({
      success: true,
      message: "Development seed executed successfully.",
      results,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal seed failure.",
      },
      { status: 500 }
    );
  }
}
