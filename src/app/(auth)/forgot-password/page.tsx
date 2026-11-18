"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { resetPassword } from "@/lib/auth/auth.service";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      await resetPassword(data.email);
      setIsSubmitted(true);
      addToast({
        type: "success",
        title: "Reset Link Dispatched",
        message: "Check your email for the password recovery link.",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to dispatch reset email.";
      addToast({
        type: "error",
        title: "Request Failed",
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
          Reset Password
        </h2>
        <p className="mt-1 text-xs text-slate-500 text-center">
          Enter your registered email address to receive recovery instructions
        </p>
      </div>

      {isSubmitted ? (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
          <p className="text-xs font-semibold text-emerald-800">
            Password reset link sent!
          </p>
          <p className="text-xs text-emerald-700">
            Please check your inbox and follow the instructions to set a new password.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Registered Email Address"
            type="email"
            placeholder="citizen@domain.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register("email")}
          />

          <Button
            type="submit"
            variant="gradient"
            size="md"
            className="w-full font-bold shadow-md shadow-indigo-600/25"
            isLoading={isLoading}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Send Recovery Email
          </Button>
        </form>
      )}

      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to sign in</span>
        </Link>
      </div>
    </div>
  );
}
