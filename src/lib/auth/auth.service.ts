import { createClient } from "@/lib/supabase/client";
import type { UserRole, Profile } from "@/types/database.types";

export interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: UserRole;
}

export interface SignInParams {
  email: string;
  password: string;
}

export async function signUp({
  email,
  password,
  fullName,
  phone,
  role = "citizen",
}: SignUpParams) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone || null,
        role: role,
      },
    },
  });

  if (error) {
    throw error;
  }

  // Also create/update profile record if user id exists
  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      email: data.user.email!,
      full_name: fullName,
      phone: phone || null,
      role: role,
    });

    if (profileError) {
      console.warn("Profile sync warning:", profileError.message);
    }
  }

  return data;
}

export async function signIn({ email, password }: SignInParams) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function resetPassword(email: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    throw error;
  }
}

export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    // Fallback: construct profile from user metadata if database row is not yet synchronized
    return {
      id: user.id,
      email: user.email || "",
      full_name: user.user_metadata?.full_name || "Citizen User",
      phone: user.user_metadata?.phone || null,
      role: (user.user_metadata?.role as UserRole) || "citizen",
      department_id: user.user_metadata?.department_id || null,
      created_at: user.created_at,
      updated_at: user.updated_at || user.created_at,
    };
  }

  return data as Profile;
}
