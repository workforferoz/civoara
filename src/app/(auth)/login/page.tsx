"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, LogIn, Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { signIn } from "@/lib/auth/auth.service";

const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/citizen/dashboard";
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await signIn({ email: data.email, password: data.password });
      addToast({
        type: "success",
        title: "Authentication Successful",
        message: "Welcome back to CIVOARA.",
      });

      // Role redirect logic
      if (data.email.includes("officer")) {
        router.push("/officer/tasks");
      } else if (data.email.includes("admin") || data.email.includes("supervisor")) {
        router.push("/admin/routing");
      } else {
        router.push(redirectPath);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign in. Please verify your credentials.";
      setErrorMessage(message);
      addToast({
        type: "error",
        title: "Login Failed",
        message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoAccount = (role: "citizen" | "officer" | "supervisor" | "admin") => {
    const email = `${role}@civoara.gov`;
    setValue("email", email);
    setValue("password", "GovSecure2026!");
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 text-center">
          Sign in to your account
        </h2>
        <p className="mt-1 text-xs text-slate-500 text-center">
          Enter municipal credentials or citizen credentials to continue
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="citizen@civoara.gov"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="space-y-1">
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="flex justify-end pt-1">
            <Link
              href="/forgot-password"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full font-bold bg-slate-950 hover:bg-slate-900 text-white shadow-xs"
          isLoading={isLoading}
          leftIcon={<LogIn className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>

      {/* Quick Role Credentials */}
      <div className="pt-5 border-t border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-800">
            Municipal Role Authentication:
          </span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Test Credentials</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setDemoAccount("citizen")}
            className="text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-left transition-colors cursor-pointer"
          >
            Citizen Account
          </button>
          <button
            type="button"
            onClick={() => setDemoAccount("officer")}
            className="text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-left transition-colors cursor-pointer"
          >
            Field Officer
          </button>
          <button
            type="button"
            onClick={() => setDemoAccount("supervisor")}
            className="text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-left transition-colors cursor-pointer"
          >
            Supervisor (L1)
          </button>
          <button
            type="button"
            onClick={() => setDemoAccount("admin")}
            className="text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-left transition-colors cursor-pointer"
          >
            System Administrator
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-indigo-600 hover:text-indigo-800"
        >
          Create Citizen Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
