"use client";

import React, { useState } from "react";
import {
  Building,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  GitCommit,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from "@/components/ui/Table";
import { useToast } from "@/components/ui/Toast";
import {
  previewRestructuring,
  executeRestructuring,
  getOwnershipSegments,
  getOrganizationVersions,
  type RestructuringAction,
  type RestructuringPreview,
  type RestructuringExecutionResult,
} from "@/lib/services/restructuring.service";
import { INITIAL_DEPARTMENTS } from "@/lib/services/routing.service";
import { getAllDemoWards } from "@/lib/services/ward.service";

export default function AdminRestructuringPage() {
  const { addToast } = useToast();
  const wards = getAllDemoWards();
  const departments = INITIAL_DEPARTMENTS;

  // Wizard State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [actionType, setActionType] = useState<"merge_departments" | "transfer_ward">("transfer_ward");
  const [sourceDept, setSourceDept] = useState("d2222222-2222-2222-2222-222222222222"); // SWM
  const [targetDept, setTargetDept] = useState("d1111111-1111-1111-1111-111111111111"); // PWD
  const [selectedWard, setSelectedWard] = useState("w1020000-0000-0000-0000-000000000102"); // Ward 102
  const [migrationPolicy, setMigrationPolicy] = useState<"fair_pro_rata" | "inherited_deadline">("fair_pro_rata");

  const [preview, setPreview] = useState<RestructuringPreview | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<RestructuringExecutionResult | null>(null);

  const [segments, setSegments] = useState(getOwnershipSegments());
  const [versions, setVersions] = useState(getOrganizationVersions());

  const handleGeneratePreview = async () => {
    const action: RestructuringAction = {
      type: actionType,
      description:
        actionType === "transfer_ward"
          ? `Transferred Ward responsibility from ${getDeptCode(sourceDept)} to ${getDeptCode(targetDept)}.`
          : `Merged operations of ${getDeptCode(sourceDept)} into ${getDeptCode(targetDept)}.`,
      sourceDepartmentId: sourceDept,
      targetDepartmentId: targetDept,
      sourceWardId: selectedWard,
      migrationPolicy,
    };

    const prev = await previewRestructuring(action);
    setPreview(prev);
    setStep(2);
  };

  const handleConfirmExecution = async () => {
    if (!preview) return;
    setIsExecuting(true);

    try {
      const res = await executeRestructuring(preview.action);
      setExecutionResult(res);
      setSegments([...getOwnershipSegments()]);
      setVersions([...getOrganizationVersions()]);
      setStep(3);

      addToast({
        type: "success",
        title: "Reorganization Committed",
        message: `Version ${res.newVersion.version_number} deployed with fair ownership segments.`,
      });
    } catch (err: unknown) {
      addToast({
        type: "error",
        title: "Reorganization Failed",
        message: err instanceof Error ? err.message : "Transactional rollback triggered.",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const getDeptCode = (deptId: string) => {
    const d = departments.find((dept) => dept.id === deptId);
    return d ? d.code : deptId;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="indigo" size="sm">
              <Building className="w-3.5 h-3.5 inline mr-1" />
              Administrative Governance
            </Badge>
            <Badge variant="emerald" size="sm">
              <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
              Non-Destructive Ownership Segments
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Department Restructuring & Fair SLA Migration Wizard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            Safely restructure municipal operations, merge departments, or transfer ward responsibilities.
            Immutable `ownership_segments` preserve historical elapsed time without unfairly penalizing new teams
            or wiping complaint age.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-mono text-xs font-bold shadow-sm">
            Active Org Version: v{versions[versions.length - 1].version_number}
          </span>
        </div>
      </div>

      {/* Wizard Steps Navigation */}
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div
          className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
            step === 1
              ? "border-indigo-500 bg-indigo-50/80 text-indigo-950 font-bold shadow-xs"
              : "border-slate-200/90 bg-white text-slate-600"
          }`}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-xs shadow-md shadow-indigo-600/30">
            1
          </span>
          <span className="font-bold">Scope Configuration</span>
        </div>

        <div
          className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
            step === 2
              ? "border-indigo-500 bg-indigo-50/80 text-indigo-950 font-bold shadow-xs"
              : "border-slate-200/90 bg-white text-slate-600"
          }`}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-xs shadow-md shadow-indigo-600/30">
            2
          </span>
          <span className="font-bold">Impact & SLA Preview</span>
        </div>

        <div
          className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
            step === 3
              ? "border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold shadow-xs"
              : "border-slate-200/90 bg-white text-slate-600"
          }`}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600 text-white font-black text-xs shadow-md shadow-emerald-600/30">
            3
          </span>
          <span className="font-bold">Transactional Audit</span>
        </div>
      </div>

      {/* Step 1: Configuration Form */}
      {step === 1 && (
        <Card className="rounded-2xl border-slate-200/90 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-200/80 px-6 py-5">
            <CardTitle className="text-base font-bold text-slate-900">
              Configure Restructuring Action
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Select whether to reassign municipal ward territory or merge entire departmental operations.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Action Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <button
                type="button"
                onClick={() => setActionType("transfer_ward")}
                className={`p-5 rounded-2xl border text-left transition-all duration-300 ${
                  actionType === "transfer_ward"
                    ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs"
                    : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <span className="font-bold text-slate-900 text-sm block mb-1">
                  Transfer Ward Responsibility
                </span>
                <p className="text-slate-500 leading-relaxed">
                  Reassign an existing ward boundary to a different engineering or sanitation department.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setActionType("merge_departments")}
                className={`p-5 rounded-2xl border text-left transition-all duration-300 ${
                  actionType === "merge_departments"
                    ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs"
                    : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <span className="font-bold text-slate-900 text-sm block mb-1">
                  Merge Departments
                </span>
                <p className="text-slate-500 leading-relaxed">
                  Consolidate a source department into an absorbing department, shifting all open work orders.
                </p>
              </button>
            </div>

            {/* Ward Selector (if ward transfer) */}
            {actionType === "transfer_ward" && (
              <div className="space-y-1.5 text-xs">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Target Municipal Ward
                </label>
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
                >
                  {wards.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.wardNumber}: {w.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Department selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Source Department (Surrendering Responsibility)
                </label>
                <select
                  value={sourceDept}
                  onChange={(e) => setSourceDept(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code}: {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Target Department (Assuming Responsibility)
                </label>
                <select
                  value={targetDept}
                  onChange={(e) => setTargetDept(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
                >
                  {departments
                    .filter((d) => d.id !== sourceDept)
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code}: {d.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Migration Policy */}
            <div className="space-y-3 text-xs pt-3 border-t border-slate-100">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                SLA Migration & Fair Accounting Policy
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div
                  onClick={() => setMigrationPolicy("fair_pro_rata")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    migrationPolicy === "fair_pro_rata"
                      ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                    <Check className="w-4 h-4 text-indigo-600" />
                    <span>Fair Pro-Rata Segments (Recommended)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Old department’s elapsed duration is preserved. New department starts with a clean segment
                    budget and is not unfairly charged with prior delays.
                  </p>
                </div>

                <div
                  onClick={() => setMigrationPolicy("inherited_deadline")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    migrationPolicy === "inherited_deadline"
                      ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Fixed Inherited Deadline</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Original citizen deadline remains fixed. Ownership segment strictly records the moment
                    responsibility transferred.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="gradient"
                size="md"
                onClick={handleGeneratePreview}
                className="rounded-xl shadow-md shadow-indigo-600/20"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Inspect Impact & Preview Migration
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Impact & SLA Preview */}
      {step === 2 && preview && (
        <Card className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Migration Consequence Preview
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Review affected open tickets, overdue statuses, and version bump before deploying.
                </CardDescription>
              </div>
              <Badge variant="indigo" size="md">
                Deploying Version {preview.versionIncrement}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-5 text-xs">
            {/* Impact Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Affected Open Issues
                </span>
                <span className="text-2xl font-black text-slate-900 mt-0.5 block">
                  {preview.affectedIssuesCount} Tickets
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Will receive new `ownership_segments`
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-rose-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-rose-600 block">
                  Inherited Overdue Tickets
                </span>
                <span className="text-2xl font-black text-rose-700 mt-0.5 block">
                  {preview.affectedOverdueCount} Overdue
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Delays attributed solely to prior department
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-emerald-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block">
                  Fairness Guarantee
                </span>
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold mt-1 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Zero Delay Erasure</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Full complaint age is preserved
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 text-indigo-900 font-medium">
              {preview.estimatedDeadlineImpact}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => setStep(1)} className="rounded-lg">
                Back to Scope
              </Button>
              <Button
                variant="gradient"
                size="md"
                onClick={handleConfirmExecution}
                isLoading={isExecuting}
                className="rounded-xl shadow-md shadow-indigo-600/20"
                leftIcon={<GitCommit className="w-4 h-4 text-emerald-400" />}
              >
                Confirm & Commit Reorganization
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Transactional Audit Complete */}
      {step === 3 && executionResult && (
        <Card className="rounded-2xl border-emerald-200 bg-emerald-50/40 shadow-sm overflow-hidden">
          <CardHeader className="bg-emerald-100/40 border-b border-emerald-200 px-6 py-5">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <CardTitle className="text-emerald-950 font-bold text-base">
                Reorganization Transaction Committed Successfully
              </CardTitle>
            </div>
            <CardDescription className="text-emerald-800 mt-0.5 text-xs">
              {executionResult.auditMessage}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Deployed Version
                </span>
                <span className="text-xl font-black text-slate-900 mt-0.5 block">
                  v{executionResult.newVersion.version_number}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Closed Segments
                </span>
                <span className="text-xl font-black text-slate-900 mt-0.5 block">
                  {executionResult.closedSegmentsCount} Closed
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Opened Segments
                </span>
                <span className="text-xl font-black text-slate-900 mt-0.5 block">
                  {executionResult.openedSegmentsCount} Opened
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Timestamp
                </span>
                <span className="text-xs font-mono font-semibold text-slate-700 mt-1 block">
                  {new Date(executionResult.executionTimestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setStep(1)} className="rounded-lg">
                Configure Another Restructure
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historical Ownership Segments Inspector */}
      <Card className="rounded-2xl border-slate-200/90 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-200/80 px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Historical Ownership Segments Ledger
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Auditable timeline of departmental transitions. Demonstrates non-destructive SLA accounting.
              </CardDescription>
            </div>
            <Badge variant="indigo" size="sm">
              {segments.length} Tracked Segments
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-100/60">
              <TableRow>
                <TableHead className="font-bold">Segment ID</TableHead>
                <TableHead className="font-bold">Issue Reference</TableHead>
                <TableHead className="font-bold">Department</TableHead>
                <TableHead className="font-bold">Org Version</TableHead>
                <TableHead className="font-bold">Elapsed Time</TableHead>
                <TableHead className="font-bold">Budget</TableHead>
                <TableHead className="font-bold text-right">Outcome</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {segments.length === 0 ? (
                <TableEmpty
                  message="No historical segments recorded. Use the wizard above to execute a restructuring action."
                  colSpan={7}
                />
              ) : (
                segments.map((seg) => (
                  <TableRow key={seg.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="font-mono text-xs font-semibold text-slate-700">
                    {seg.id}
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-indigo-700">
                    {seg.issue_id}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-slate-900">
                    {getDeptCode(seg.department_id)}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 font-mono">
                    {seg.organization_version_id}
                  </TableCell>
                  <TableCell className="text-xs text-slate-800 font-semibold font-mono">
                    {(seg.elapsed_seconds / 3600).toFixed(1)} Hours
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 font-mono">
                    {(seg.sla_budget_seconds / 3600).toFixed(0)} Hours
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        seg.outcome === "resolved"
                          ? "emerald"
                          : seg.outcome === "transferred"
                          ? "amber"
                          : "indigo"
                      }
                      size="sm"
                    >
                      {seg.outcome ? seg.outcome.toUpperCase() : "ACTIVE"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}