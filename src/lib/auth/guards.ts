import { createClient as createServerSupabase } from "@/lib/supabase/server";
import type { UserRole, Profile } from "@/types/database.types";

/**
 * Server-side guard to verify authenticated session and role claims directly
 * from PostgreSQL database records. Never trusts browser cookies or client headers.
 */
export async function requireServerRole(allowedRoles: UserRole[]): Promise<Profile> {
  const supabase = await createServerSupabase();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("UNAUTHORIZED: Authentication required.");
  }

  // Always query authoritative database profile directly
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("UNAUTHORIZED: Profile record not found.");
  }

  const role = profile.role as UserRole;
  if (!allowedRoles.includes(role)) {
    throw new Error(
      `FORBIDDEN: User role '${role}' is not authorized for this operation.`
    );
  }

  return profile as Profile;
}

export function isRoleAuthorized(
  userRole: UserRole,
  requiredRoles: UserRole[]
): boolean {
  return requiredRoles.includes(userRole);
}
