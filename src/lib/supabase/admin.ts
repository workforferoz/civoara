import { createClient } from "@supabase/supabase-js";

/**
 * Privileged Service-Role Supabase Client.
 * STRICT SECURITY REQUIREMENT:
 * This client bypasses PostgreSQL Row Level Security (RLS) and MUST NEVER
 * be imported into client components or exposed in browser bundles.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "SECURITY VIOLATION: createAdminClient cannot be executed in the browser."
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL in server environment."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
