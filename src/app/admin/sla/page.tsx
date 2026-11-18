"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  Bell,
  RefreshCw,
  Play,
  ShieldCheck,
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
  DEMO_SLA_POLICIES,
  calculateSlaMetrics,
} from "@/lib/sla/sla.service";
import {
  processSlaEscalations,
  getLocalEscalationHistory,
  type EscalationRunResult,
} from "@/lib/sla/escalation.processor";
import { getCitizenIssues } from "@/lib/services/issue.service";
import type { Issue, EscalationStep } from "@/types/database.types";

export default function AdminSLAPage() {
  const { addToast } = useToast();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [escalationHistory, setEscalationHistory] = useState<EscalationStep[]>([]);
  const [isRunningSweep, setIsRunningSweep] = useState(false);
  const [lastSweepResult, setLastSweepResult] = useState<EscalationRunResult | null>(null);

  useEffect(() => {
    async function loadData() {
      const data = await getCitizenIssues();
      setIssues(data);
      setEscalationHistory(getLocalEscalationHistory());
    }
    loadData();
  }, []);

  const handleRunEscalationSweep = async () => {
    setIsRunningSweep(true);
    try {
      const result = await processSlaEscalations(issues);
      setLastSweepResult(result);
      setEscalationHistory([...getLocalEscalationHistory()]);

      // Refresh issues state to show updated escalation levels
      const refreshed = await getCitizenIssues();
      setIssues([...refreshed]);

      addToast({
        type: "success",
        title: "Escalation Sweep Complete",
        message: `Processed ${result.totalIssuesInspected} issues. Triggered: ${result.escalationsTriggered}. Skipped already escalated: ${result.skippedAlreadyEscalated}.`,
      });
    } catch (err: unknown) {
      addToast({
        type: "error",
        title: "Sweep Failed",
        message: err instanceof Error ? err.message : "Error executing sweep.",
      });
    } finally {
      setIsRunningSweep(false);
    }
  };

  const policies = Object.values(DEMO_SLA_POLICIES);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="rose" size="sm">
              <Clock className="w-3.5 h-3.5 inline mr-1" />
              Idempotent Engine
            </Badge>
            <Badge variant="slate" size="sm">
              Level 0-3 Multi-Tier Escalations
            </Badge>
            <Badge variant="emerald" size="sm">
              <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
              Concurrency Protected
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            SLA Policies & Multi-Tier Escalation Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            Deterministic resolution timers enforced server-side. Missed deadlines
            automatically cascade across Level 0 (Officer) → Level 1 (Supervisor) →
            Level 2 (Commissioner) → Level 3 (City Administrator).
          </p>
        </div>
        <div>
          <Button
            variant="gradient"
            size="md"
            onClick={handleRunEscalationSweep}
            isLoading={isRunningSweep}
            className="rounded-xl shadow-lg shadow-indigo-600/20"
            leftIcon={<Play className="w-4 h-4 fill-white" />}
          >
            Execute Escalation Sweep
          </Button>
        </div>
      </div>

      {/* Sweep Result Banner */}
      {lastSweepResult && (
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs text-slate-900 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Idempotent Cron Sweep Results</span>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700">
              {new Date(lastSweepResult.runTimestamp).toLocaleTimeString()}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Total Inspected
              </span>
              <span className="text-xl font-black text-slate-900 mt-0.5 block">
                {lastSweepResult.totalIssuesInspected}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-rose-200/80 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-rose-600 block">
                Escalations Fired
              </span>
              <span className="text-xl font-black text-rose-700 mt-0.5 block">
                {lastSweepResult.escalationsTriggered}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Skipped (Idempotent)
              </span>
              <span className="text-xl font-black text-slate-800 mt-0.5 block">
                {lastSweepResult.skippedAlreadyEscalated}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-emerald-200/80 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">
                On Track / Resolved
              </span>
              <span className="text-xl font-black text-emerald-700 mt-0.5 block">
                {lastSweepResult.skippedOnTrack + lastSweepResult.skippedResolved}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Configured SLA Policies Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
          Configured Categorical Service Standards (Audited SLA Policies)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {policies.map((pol) => (
            <div
              key={pol.category}
              className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:border-indigo-300 hover:shadow-md transition-all duration-300 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs capitalize text-slate-900">
                  {pol.category.replace("_", " ")}
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                  v{pol.version}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-2xl font-black text-indigo-700 tracking-tight block">
                  {pol.resolutionHours}h
                </span>
                <p className="text-[11px] text-slate-500 font-medium">
                  Warning at {pol.warningHours}h remaining
                </p>
              </div>
              <div className="pt-2.5 border-t border-slate-100 text-[10px] text-slate-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">L0:</span>
                  <span className="font-medium text-slate-800">{pol.escalationRoles[0]}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">L1:</span>
                  <span className="font-medium text-amber-700">{pol.escalationRoles[1]}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">L2:</span>
                  <span className="font-medium text-rose-700">{pol.escalationRoles[2]}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">L3:</span>
                  <span className="font-black text-red-900">{pol.escalationRoles[3]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live SLA Watchdog Table */}
      <Card className="rounded-2xl border-slate-200/90 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-200/80 px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Live SLA Watchdog Table
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Authoritative server-side timers and active escalation levels across open tickets.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRunEscalationSweep()}
              className="rounded-lg self-start sm:self-auto"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Sync Authoritative Clocks
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-100/60">
              <TableRow>
                <TableHead className="font-bold">Reference</TableHead>
                <TableHead className="font-bold">Category</TableHead>
                <TableHead className="font-bold">Target Budget</TableHead>
                <TableHead className="font-bold">SLA Status & Countdown</TableHead>
                <TableHead className="font-bold">Current Tier</TableHead>
                <TableHead className="font-bold">Next Escalation Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issues.length === 0 ? (
                <TableEmpty
                  message="No active complaints under municipal SLA tracking"
                  colSpan={6}
                />
              ) : (
                issues.map((issue) => {
                  const metrics = calculateSlaMetrics(issue);
                  return (
                    <TableRow key={issue.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-indigo-700">
                        {issue.reference_number}
                      </TableCell>
                      <TableCell className="capitalize text-xs font-semibold text-slate-800">
                        {issue.category.replace("_", " ")}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 font-mono">
                        {metrics.totalBudgetHours}h Target
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5 w-48">
                          <div className="flex items-center justify-between">
                            <Badge
                              variant={
                                metrics.status === "breached"
                                  ? "rose"
                                  : metrics.status === "warning"
                                  ? "amber"
                                  : metrics.status === "resolved"
                                  ? "emerald"
                                  : "indigo"
                              }
                              size="sm"
                            >
                              {metrics.status.toUpperCase()}
                            </Badge>
                            <span className="text-[11px] font-mono font-bold text-slate-700">
                              {metrics.formattedRemaining}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
                            <div
                              className={`h-full transition-all duration-500 rounded-full ${
                                metrics.status === "breached"
                                  ? "bg-red-600"
                                  : metrics.status === "warning"
                                  ? "bg-amber-500"
                                  : "bg-indigo-600"
                              }`}
                              style={{ width: `${metrics.percentElapsed}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            metrics.currentLevel === 0
                              ? "bg-slate-100 text-slate-800 border border-slate-200"
                              : metrics.currentLevel === 1
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : metrics.currentLevel === 2
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-red-200 text-red-950 font-black border border-red-300"
                          }`}
                        >
                          Level {metrics.currentLevel}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs capitalize font-semibold text-slate-700">
                        {metrics.nextEscalationRole
                          ? `${metrics.nextEscalationRole}`
                          : "Max Level Reached"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Escalation Audit History */}
      {escalationHistory.length > 0 && (
        <Card className="rounded-2xl border-slate-200/90 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-200/80 px-6 py-5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Escalation Event Audit Trail
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Immutable record of all triggered escalation events and dispatched supervisor notifications.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-2.5">
            {escalationHistory.map((step) => (
              <div
                key={step.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-2"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="font-black text-rose-800">
                    Level {step.level} Escalation:
                  </span>
                  <span className="text-slate-700 font-medium">{step.reason}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 shrink-0">
                  {new Date(step.triggered_at).toLocaleString()}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}