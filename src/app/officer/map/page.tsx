"use client";

import React from "react";
import Link from "next/link";
import { PublicIssueMap } from "@/components/maps/PublicIssueMap";
import { Button } from "@/components/ui/Button";

export default function OfficerMapPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Field Officer Spatial Dispatch Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Google Maps dispatch view with PostGIS ward polygon boundaries, live ticket pins, and SLA status monitoring.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/officer/tasks">
            <Button variant="outline" size="sm">
              View Work Order List
            </Button>
          </Link>
        </div>
      </div>

      <PublicIssueMap />
    </div>
  );
}
