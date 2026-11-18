"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ShieldAlert, Send, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { CategorySelector } from "@/components/citizen/CategorySelector";
import { PhotoUploader } from "@/components/citizen/PhotoUploader";
import { LocationPicker } from "@/components/citizen/LocationPicker";
import { IssueConfirmation } from "@/components/citizen/IssueConfirmation";
import { createIssueReport } from "@/lib/services/issue.service";
import type { Issue, IssueCategory } from "@/types/database.types";
import { useToast } from "@/components/ui/Toast";

const reportSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters.")
    .max(120, "Title cannot exceed 120 characters."),
  category: z.enum([
    "pothole",
    "garbage",
    "broken_streetlight",
    "water_leakage",
    "other",
  ] as const),
  description: z
    .string()
    .min(10, "Please provide at least 10 characters describing the defect.")
    .max(1000, "Description cannot exceed 1000 characters."),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  locationDescription: z.string().optional(),
});

type ReportFormData = z.infer<typeof reportSchema>;

export const ReportIssueForm: React.FC = () => {
  const { addToast } = useToast();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedIssue, setSubmittedIssue] = useState<Issue | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: "",
      category: "pothole",
      description: "",
      latitude: 12.9716, // Default Bengaluru CBD
      longitude: 77.5946,
      locationDescription: "Central Business District, Bengaluru",
    },
  });

  const currentLat = watch("latitude");
  const currentLng = watch("longitude");
  const currentLocationDesc = watch("locationDescription") || "";

  const onSubmit = async (data: ReportFormData) => {
    if (!photoPreview && !photoFile) {
      setPhotoError("A clear photograph of the defect is required for verification.");
      return;
    }
    setPhotoError(null);
    setIsSubmitting(true);

    try {
      const issue = await createIssueReport({
        title: data.title,
        category: data.category as IssueCategory,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        locationDescription: data.locationDescription,
        photoUrl: photoPreview,
      });

      setSubmittedIssue(issue);
      addToast({
        type: "success",
        title: "Complaint Registered",
        message: `Reference ${issue.reference_number} assigned. SLA timer started.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission error occurred.";
      addToast({
        type: "error",
        title: "Submission Failed",
        message: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoError(null);
    setSubmittedIssue(null);
  };

  if (submittedIssue) {
    return <IssueConfirmation issue={submittedIssue} onReset={handleReset} />;
  }

  return (
    <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
      {/* Top Header Banner - Solid Navy */}
      <div className="bg-slate-900 p-6 sm:p-8 text-white relative border-b border-slate-800">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Register Civic Defect
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-slate-700">
                  PostGIS Routed
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Submit an immutable complaint with photo evidence and GPS coordinates.
                SLA countdown starts immediately upon submission.
              </p>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Step 1: Category Selector */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-800 text-[11px]">
                1
              </span>
              <span>Select Civic Defect Category</span>
            </div>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <CategorySelector
                  value={field.value}
                  onChange={(cat) => field.onChange(cat)}
                  error={errors.category?.message}
                />
              )}
            />
          </div>

          {/* Step 2: Description & Title */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-800 text-[11px]">
                2
              </span>
              <span>Issue Details & Evidence</span>
            </div>

            <Input
              label="Issue Title"
              placeholder="e.g., Deep pothole opposite Indiranagar Metro Station"
              error={errors.title?.message}
              required
              {...register("title")}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Describe the defect severity, traffic bottleneck, safety hazards, or nearby landmarks..."
                className={`w-full rounded-xl border bg-white p-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  errors.description
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-slate-300 hover:border-slate-400"
                }`}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-red-600 font-medium">
                  {errors.description.message}
                </p>
              )}
            </div>

            <PhotoUploader
              onPhotoSelected={(file, preview) => {
                setPhotoFile(file);
                setPhotoPreview(preview);
                if (file || preview) setPhotoError(null);
              }}
              error={photoError || undefined}
            />
          </div>

          {/* Step 3: Location */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-800 text-[11px]">
                3
              </span>
              <span>Geographic Map Pin Selection</span>
            </div>

            <LocationPicker
              latitude={currentLat}
              longitude={currentLng}
              locationDescription={currentLocationDesc}
              onCoordinatesChange={(lat, lng) => {
                setValue("latitude", lat, { shouldValidate: true });
                setValue("longitude", lng, { shouldValidate: true });
              }}
              onDescriptionChange={(desc) => {
                setValue("locationDescription", desc);
              }}
              error={errors.latitude?.message || errors.longitude?.message}
            />
          </div>

          {/* Submit Action */}
          <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 max-w-sm">
              Municipal privacy notice: Citizen phone numbers and private addresses are
              never published on public registers.
            </p>
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full sm:w-auto shrink-0 font-bold px-8"
              isLoading={isSubmitting}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Submit & Start SLA Clock
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
