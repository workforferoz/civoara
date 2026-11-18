"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  Clock,
  ShieldCheck,
  TrendingUp,
  Award,
  ExternalLink,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  Flame,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import {
  getPublicCitywideOverview,
  getDepartmentLeaderboard,
  getWardPerformance,
  getCategoryMetrics,
} from "@/lib/services/analytics.service";
import { getCitizenIssues } from "@/lib/services/issue.service";
import type { Issue } from "@/types/database.types";

export default function PublicPerformancePage() {
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    async function load() {
      const data = await getCitizenIssues();
      setIssues(data);
    }
    load();
  }, []);

  const overview = getPublicCitywideOverview(issues);
  const departments = getDepartmentLeaderboard(issues);
  const wards = getWardPerformance(issues);
  const categories = getCategoryMetrics(issues);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Transparency Header - Solid Navy, Zero Glassmorphism, Zero Glow Orbs */}
      <div className="rounded-xl bg-slate-950 p-6 sm:p-10 border border-slate-800 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Municipal SLA Performance & Public Audit Register
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Public audit of municipal service delivery, resolution velocity, department rankings,
              and ward-level SLA compliance. Fully verifiable without citizen PII exposure.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <Link href="/public/map">
              <Button
                variant="outline-dark"
                size="lg"
                className="border-slate-700 bg-slate-900 text-white hover:bg-slate-800 font-semibold"
              >
                Spatial Map
              </Button>
            </Link>
            <Link href="/report">
              <Button
                variant="primary"
                size="lg"
                className="font-bold"
              >
                File a Complaint
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 6 Key Performance Metric Cards - Solid White, Zero Glass, High Contrast */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 block">
            Total Reported
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 block tracking-tight font-mono">
            {overview.totalReported.toLocaleString()}
          </span>
          <div className="mt-2 text-[11px] font-medium text-slate-400">
            90-Day Municipal Window
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-800 block">
            Total Resolved
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2 block tracking-tight font-mono">
            {overview.totalResolved.toLocaleString()}
          </span>
          <div className="mt-2 text-[11px] font-bold text-emerald-700">
            {((overview.totalResolved / overview.totalReported) * 100).toFixed(1)}% Resolution Rate
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider font-bold text-blue-800 block">
            Open / Active
          </span>
          <span className="text-2xl sm:text-3xl font-black text-blue-900 mt-2 block tracking-tight font-mono">
            {overview.totalOpen}
          </span>
          <div className="mt-2 text-[11px] font-medium text-blue-700">
            Under Active SLA Clock
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider font-bold text-rose-800 block">
            Overdue Breaches
          </span>
          <span className="text-2xl sm:text-3xl font-black text-rose-700 mt-2 block tracking-tight font-mono">
            {overview.totalOverdue}
          </span>
          <div className="mt-2 text-[11px] font-medium text-rose-700">
            Escalated to Supervisor
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-700 block">
            Avg Speed
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 block tracking-tight font-mono">
            {overview.averageResolutionHours}h
          </span>
          <div className="mt-2 text-[11px] font-medium text-slate-500">
            Target: &lt;48h citywide
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-800 block">
            SLA Compliance
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2 block tracking-tight font-mono">
            {overview.overallSlaCompliancePercentage}%
          </span>
          <div className="mt-2 text-[11px] font-bold text-emerald-700">
            99.8% Target Standard
          </div>
        </div>
      </div>

      {/* Explainable Department Leaderboard */}
      <Card className="rounded-2xl border-slate-200/90 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-200/80 px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                  <Award className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-bold text-slate-900">
                  Municipal Department Performance Leaderboard
                </CardTitle>
              </div>
              <CardDescription className="mt-1 text-xs text-slate-500">
                Explainable ranking algorithm: (SLA Adherence × 60%) + (Resolution Velocity × 30%) + (Volume Weight × 10%).
                Sample sizes disclosed to eliminate small-sample bias.
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 self-start sm:self-auto">
              <ShieldCheck className="w-4 h-4" />
              Audited by CIVOARA SLA Engine
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-100/60">
              <TableRow>
                <TableHead className="w-16 text-center font-bold">Rank</TableHead>
                <TableHead className="font-bold">Department</TableHead>
                <TableHead className="font-bold">SLA Compliance</TableHead>
                <TableHead className="font-bold">Avg Resolution Time</TableHead>
                <TableHead className="font-bold">Statistical Confidence</TableHead>
                <TableHead className="text-right font-bold">Audited Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept, index) => (
                <TableRow key={dept.departmentId} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="text-center">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-md font-mono font-bold text-xs ${
                        index === 0
                          ? "bg-slate-900 text-white"
                          : index === 1
                          ? "bg-slate-800 text-white"
                          : index === 2
                          ? "bg-slate-700 text-white"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 text-sm block">
                        {dept.departmentName}
                      </span>
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 inline-block font-semibold">
                        {dept.departmentCode}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1.5 w-44">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span className="text-emerald-700">{dept.slaCompliancePercentage}%</span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          {dept.resolvedIssues}/{dept.totalEligibleIssues} cases
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${dept.slaCompliancePercentage}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-800">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/70 inline-flex">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{dept.averageResolutionHours} Hours</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        dept.sampleConfidence.includes("High")
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          dept.sampleConfidence.includes("High") ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                      />
                      {dept.sampleConfidence}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-baseline gap-0.5 font-mono">
                      <span className="text-base font-black text-indigo-700">
                        {dept.rankingScore}
                      </span>
                      <span className="text-xs text-slate-400">/ 100</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Ward-by-Ward Comparison & Category Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ward Performance */}
        <Card className="rounded-2xl border-slate-200/90 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-200/80 px-6 py-5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Ward Boundary Performance Comparison
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Geospatial resolution metrics across registered municipal wards.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-100/60">
                <TableRow>
                  <TableHead className="font-bold">Ward Area</TableHead>
                  <TableHead className="font-bold">Total Issues</TableHead>
                  <TableHead className="font-bold">SLA Compliance</TableHead>
                  <TableHead className="text-right font-bold">Avg Speed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wards.map((ward) => (
                  <TableRow key={ward.wardNumber} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell>
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">
                          {ward.wardNumber}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {ward.wardName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-800">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
                        {ward.totalIssues}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-700">
                          {ward.slaCompliance}%
                        </span>
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${ward.slaCompliance}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono font-bold text-slate-700">
                      {ward.averageHours}h
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="rounded-2xl border-slate-200/90 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-200/80 px-6 py-5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Resolution Metrics by Defect Category
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Resolution performance breakdown across civic infrastructure categories.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-100/60">
                <TableRow>
                  <TableHead className="font-bold">Category</TableHead>
                  <TableHead className="font-bold">Target SLA</TableHead>
                  <TableHead className="font-bold">Total Lodged</TableHead>
                  <TableHead className="text-right font-bold">Compliance Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.category} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="font-bold text-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span>{cat.label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 font-mono">
                      {cat.targetSlaHours}h Max
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-800">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
                        {cat.total}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {cat.complianceRate}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Public Issue Lifecycle Timeline Standard */}
      <Card className="rounded-2xl border-slate-200/90 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-200/80 px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Standard Public Complaint Lifecycle & Audit Timeline
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Every complaint registered in CIVOARA progresses through these verifiable, immutable stages.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all duration-300 space-y-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-sm shadow-md shadow-indigo-600/30">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-xs">Reported & Geotagged</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Citizen submits photographic proof and coordinates. Public reference generated.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all duration-300 space-y-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-700 text-white font-black text-sm shadow-md shadow-indigo-700/30">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-xs">PostGIS Ward Routed</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Coordinates resolved via polygon intersection. Responsible department and officer assigned.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all duration-300 space-y-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white font-black text-sm shadow-md shadow-sky-600/30">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-xs">SLA Started & Tracked</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Deterministic SLA countdown begins. Field engineer inspects and reviews duplicate clusters.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all duration-300 space-y-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white font-black text-sm shadow-md shadow-rose-600/30">
                4
              </div>
              <h4 className="font-bold text-slate-900 text-xs">Automatic Escalation</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                If deadline expires, cron sweep elevates to Supervisor (L1), Commissioner (L2), Admin (L3).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all duration-300 space-y-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-black text-sm shadow-md shadow-emerald-600/30">
                5
              </div>
              <h4 className="font-bold text-slate-900 text-xs">Verified Rectification</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Officer attaches post-fix photograph and resolution notes. Immutable event closure recorded.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Redaction Guarantee Notice - Solid Dark Surface */}
      <div className="rounded-xl bg-slate-900 p-6 text-white border border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm tracking-tight">Citizen Privacy Redaction Protocol Enforced</h4>
              <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                Citizen telephone numbers, personal emails, and private residential identifiers are strictly redacted
                from public analytics and open registers under Municipal Privacy Ordinances.
              </p>
            </div>
          </div>
          <Link href="/public/issues" className="shrink-0">
            <Button
              variant="outline-dark"
              size="md"
              className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 font-medium"
            >
              Open Data Register
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}