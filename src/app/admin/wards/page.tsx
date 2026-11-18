"use client";

import React from "react";
import Link from "next/link";
import { PublicIssueMap } from "@/components/maps/PublicIssueMap";
import { Button } from "@/components/ui/Button";

export default function AdminWardsPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Municipal Ward Geometries & Boundary Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Inspect registered PostGIS municipal ward boundaries on Google Maps with automated ray-cast dispatch coverage.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/admin/routing">
            <Button variant="outline" size="sm">
              Manage Routing Rules
            </Button>
          </Link>
        </div>
      </div>

      <PublicIssueMap />
    </div>
  );
}
