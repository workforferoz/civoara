"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  Check,
  Clock,
  ArrowRight,
  PlusCircle,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Issue } from "@/types/database.types";

export interface IssueConfirmationProps {
  issue: Partial<Issue>;
  onReset: () => void;
}

export const IssueConfirmation: React.FC<IssueConfirmationProps> = ({
  issue,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (issue.reference_number) {
      navigator.clipboard.writeText(issue.reference_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-3">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Complaint Successfully Registered
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          Your complaint has been immutably recorded in the municipal registry and
          assigned an automated SLA resolution clock.
        </p>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardContent className="space-y-5 pt-6">
          {/* Reference Number Box */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-slate-900 text-white gap-3">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                Public Tracking Reference
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black tracking-wider text-white">
                {issue.reference_number || "CIV-2026-PENDING"}
              </span>
            </div>
            <Button
              variant="outline-dark"
              size="sm"
              onClick={handleCopy}
              leftIcon={
                copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )
              }
            >
              {copied ? "Copied" : "Copy Code"}
            </Button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Category
              </span>
              <span className="font-semibold text-slate-800 capitalize">
                {issue.category?.replace("_", " ") || "Pothole"}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Initial Status
              </span>
              <Badge variant="submitted" size="sm">
                Submitted
              </Badge>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Target SLA
              </span>
              <div className="flex items-center gap-1 font-semibold text-slate-800">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>48 Hours Target</span>
              </div>
            </div>
          </div>

          {/* Location & Title */}
          <div className="space-y-1.5 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <p className="font-bold text-slate-900">{issue.title}</p>
            <p className="text-slate-600 line-clamp-2">{issue.description}</p>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-1">
              <MapPin className="w-3 h-3 text-indigo-600" />
              <span>
                Coordinates: {issue.latitude?.toFixed(4)}, {issue.longitude?.toFixed(4)}
                {issue.location_description ? ` (${issue.location_description})` : ""}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/citizen/dashboard" className="w-full sm:w-auto">
          <Button
            variant="gradient"
            size="md"
            className="w-full sm:w-auto font-bold shadow-md shadow-indigo-600/20"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Track in Citizen Dashboard
          </Button>
        </Link>
        <Link href="/public/map" className="w-full sm:w-auto">
          <Button
            variant="outline"
            size="md"
            className="w-full sm:w-auto"
            leftIcon={<ExternalLink className="w-4 h-4" />}
          >
            Inspect on Public Map
          </Button>
        </Link>
        <Button
          variant="secondary"
          size="md"
          onClick={onReset}
          className="w-full sm:w-auto"
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Submit Another Report
        </Button>
      </div>
    </div>
  );
};
