"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Mail, Phone, Lock, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { signUp } from "@/lib/auth/auth.service";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Please provide a valid email address."),
    phone: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await signUp({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
        role: "citizen", // Fixed to citizen for public registration
      });

      addToast({
        type: "success",
        title: "Account Created",
        message: "Your citizen account is ready. Redirecting to dashboard...",
      });

      router.push("/citizen/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to register account.";
      setErrorMessage(message);
      addToast({
        type: "error",
        title: "Registration Failed",
        message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 text-center">
          Create Citizen Account
        </h2>
        <p className="mt-1 text-xs text-slate-500 text-center">
          Register to track complaints, receive SLA escalation alerts and resolution proofs
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <Input
          label="Full Legal Name"
          type="text"
          placeholder="Aarav Sharma"
          leftIcon={<User className="w-4 h-4" />}
          error={errors.fullName?.message}
          {...register("fullName")}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="citizen@domain.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Phone Number (Optional)"
          type="tel"
          placeholder="+91 98765 43210"
          leftIcon={<Phone className="w-4 h-4" />}
          error={errors.phone?.message}
          {...register("phone")}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          {...register("password")}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full font-bold bg-slate-950 hover:bg-slate-900 text-white shadow-xs"
            isLoading={isLoading}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Create Citizen Account
          </Button>
        </div>
      </form>

      <div className="text-center text-xs text-slate-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-800"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
