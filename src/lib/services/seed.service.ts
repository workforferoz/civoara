import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/types/database.types";

export interface SeedUser {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  phone?: string;
}

export const DEMO_USERS: SeedUser[] = [
  {
    email: "citizen@civoara.gov",
    password: "GovSecure2026!",
    fullName: "Aarav Sharma",
    role: "citizen",
    phone: "+91 98765 10001",
  },
  {
    email: "officer@civoara.gov",
    password: "GovSecure2026!",
    fullName: "Inspector Ramesh Kumar",
    role: "officer",
    phone: "+91 98765 10002",
  },
  {
    email: "supervisor@civoara.gov",
    password: "GovSecure2026!",
    fullName: "Supervisor Priya Nair",
    role: "supervisor",
    phone: "+91 98765 10003",
  },
  {
    email: "commissioner@civoara.gov",
    password: "GovSecure2026!",
    fullName: "Commissioner Vikram Rao",
    role: "commissioner",
    phone: "+91 98765 10004",
  },
  {
    email: "admin@civoara.gov",
    password: "GovSecure2026!",
    fullName: "Chief Administrator Ananya Patel",
    role: "admin",
    phone: "+91 98765 10005",
  },
];

export async function runDevelopmentSeed() {
  const adminClient = createAdminClient();
  const results = {
    usersCreated: [] as string[],
    errors: [] as string[],
  };

  for (const user of DEMO_USERS) {
    try {
      // 1. Create or get user in Supabase auth
      const { data, error } = await adminClient.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.fullName,
          role: user.role,
          phone: user.phone,
        },
      });

      if (error) {
        // If user already exists, update metadata
        if (error.message.includes("already registered") || error.message.includes("exists")) {
          results.usersCreated.push(`${user.email} (Already registered)`);
          continue;
        }
        results.errors.push(`Error creating ${user.email}: ${error.message}`);
        continue;
      }

      if (data.user) {
        // 2. Ensure profile table has correct role
        await adminClient.from("profiles").upsert({
          id: data.user.id,
          email: user.email,
          full_name: user.fullName,
          phone: user.phone || null,
          role: user.role,
        });

        results.usersCreated.push(`${user.email} (${user.role})`);
      }
    } catch (err: unknown) {
      results.errors.push(`Exception seeding ${user.email}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return results;
}
