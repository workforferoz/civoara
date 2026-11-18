"use client";

import React, { useState } from "react";
import {
  GitBranch,
  CheckCircle2,
  AlertTriangle,
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
} from "@/components/ui/Table";
import {
  resolveRouting,
  INITIAL_ROUTING_RULES,
  INITIAL_DEPARTMENTS,
  type RoutingResolution,
} from "@/lib/services/routing.service";
import { getAllDemoWards } from "@/lib/services/ward.service";
import type { IssueCategory, RoutingRule } from "@/types/database.types";

export default function AdminRoutingPage() {
  const [rules, setRules] = useState<RoutingRule[]>(INITIAL_ROUTING_RULES);
  const wards = getAllDemoWards();

  // Routing Simulator State
  const [simCategory, setSimCategory] = useState<IssueCategory>("pothole");
  const [simLat, setSimLat] = useState<number>(12.9716); // Ward 101 CBD
  const [simLng, setSimLng] = useState<number>(77.5946);
  const [simulationResult, setSimulationResult] = useState<RoutingResolution | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = async () => {
    setIsSimulating(true);
    const result = await resolveRouting(
      {
        category: simCategory,
        latitude: simLat,
        longitude: simLng,
      },
      rules
    );
    setSimulationResult(result);
    setIsSimulating(false);
  };

  const toggleRuleActive = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, is_active: !r.is_active } : r))
    );
  };

  const getDepartmentName = (deptId: string) => {
    const dept = INITIAL_DEPARTMENTS.find((d) => d.id === deptId);
    return dept ? `${dept.code}: ${dept.name}` : deptId;
  };

  const getWardName = (wardId?: string | null) => {
    if (!wardId) return "Any / All Wards (Category Fallback)";
    const ward = wards.find((w) => w.id === wardId);
    return ward ? `${ward.wardNumber}: ${ward.name}` : wardId;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="indigo" size="sm">
              <GitBranch className="w-3.5 h-3.5 inline mr-1" />
              Operational Engine
            </Badge>
            <Badge variant="emerald" size="sm">
              <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
              Deterministic Priority 1-3
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Geospatial Routing Rules & Priority Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            Configure automatic dispatch rules mapping civic defect categories and
            PostGIS municipal ward boundaries to responsible engineering departments.
          </p>
        </div>
      </div>

      {/* Interactive Routing Engine Simulator */}
      <Card className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-900 text-white">
              <Play className="w-4 h-4 fill-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Interactive Routing Simulator & Conflict Inspector
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Simulate how an incoming civic report resolves through active rules,
                PostGIS ward boundary coordinates, and priority hierarchy.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Defect Category
              </label>
              <select
                value={simCategory}
                onChange={(e) => setSimCategory(e.target.value as IssueCategory)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-2xs"
              >
                <option value="pothole">Pothole</option>
                <option value="garbage">Garbage</option>
                <option value="broken_streetlight">Broken Streetlight</option>
                <option value="water_leakage">Water Leakage</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Target Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={simLat}
                onChange={(e) => setSimLat(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Target Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={simLng}
                onChange={(e) => setSimLng(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-2xs"
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="gradient"
                size="md"
                onClick={handleSimulate}
                isLoading={isSimulating}
                className="w-full rounded-xl shadow-md shadow-indigo-600/20"
                leftIcon={<Play className="w-3.5 h-3.5" />}
              >
                Simulate Dispatch
              </Button>
            </div>
          </div>

          {/* Quick presets for test scenarios */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider">
              Quick Test Vectors:
            </span>
            <button
              type="button"
              onClick={() => {
                setSimCategory("pothole");
                setSimLat(12.9716);
                setSimLng(77.5946);
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 font-medium text-xs shadow-2xs transition-all"
            >
              Exact Match (Ward 101 Pothole)
            </button>
            <button
              type="button"
              onClick={() => {
                setSimCategory("water_leakage");
                setSimLat(12.9784);
                setSimLng(77.6408);
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 font-medium text-xs shadow-2xs transition-all"
            >
              Fallback Match (Category Rule)
            </button>
            <button
              type="button"
              onClick={() => {
                setSimCategory("pothole");
                setSimLat(13.5);
                setSimLng(78.2);
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-amber-300 hover:bg-amber-50 text-slate-700 font-medium text-xs shadow-2xs transition-all"
            >
              Outside Wards (Admin Triage Queue)
            </button>
          </div>

          {/* Simulation Output Card */}
          {simulationResult && (
            <div
              className={`p-5 rounded-xl border transition-colors duration-75 shadow-2xs ${
                simulationResult.conflictDetected
                  ? "border-red-300 bg-red-50 text-red-900"
                  : simulationResult.priorityLevel === 1
                  ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                  : "border-blue-300 bg-blue-50 text-blue-950"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  {simulationResult.conflictDetected ? (
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  <span className="font-bold text-sm tracking-tight">
                    {simulationResult.conflictDetected
                      ? "Configuration Conflict Detected"
                      : "Deterministic Routing Resolved Successfully"}
                  </span>
                </div>
                <Badge
                  variant={
                    simulationResult.priorityLevel === 1
                      ? "emerald"
                      : simulationResult.priorityLevel === 2
                      ? "indigo"
                      : "amber"
                  }
                  size="sm"
                >
                  Priority {simulationResult.priorityLevel} Match (
                  {simulationResult.matchType.replace("_", " ").toUpperCase()})
                </Badge>
              </div>

              <p className="text-xs font-medium mb-4 text-slate-700 leading-relaxed">
                {simulationResult.message}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Ward Boundary
                  </span>
                  <span className="font-bold text-slate-900 line-clamp-1 mt-0.5">
                    {simulationResult.wardName}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Assigned Department
                  </span>
                  <span className="font-bold text-slate-900 line-clamp-1 mt-0.5">
                    {simulationResult.departmentCode}: {simulationResult.departmentName}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Assigned Officer
                  </span>
                  <span className="font-bold text-slate-900 line-clamp-1 mt-0.5">
                    {simulationResult.assignedOfficerName || "Department Queue"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Applicable SLA Policy
                  </span>
                  <span className="font-bold text-slate-900 line-clamp-1 mt-0.5">
                    {simulationResult.slaResolutionHours} Hours Target
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Rules Register Table */}
      <Card className="rounded-2xl border-slate-200/90 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-200/80 px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Configured Municipal Routing Rules
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Priority 1: Exact Category + Ward. Priority 2: Category-wide Fallback.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="indigo" size="sm">
                {rules.filter((r) => r.is_active).length} Active Rules
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-100/60">
              <TableRow>
                <TableHead className="font-bold">Priority</TableHead>
                <TableHead className="font-bold">Category</TableHead>
                <TableHead className="font-bold">Ward Boundary Scope</TableHead>
                <TableHead className="font-bold">Assigned Department</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        rule.priority === 1
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-indigo-50 text-indigo-800 border border-indigo-200"
                      }`}
                    >
                      Priority {rule.priority} ({rule.priority === 1 ? "Exact" : "Fallback"})
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-slate-900 capitalize text-xs">
                    {rule.category.replace("_", " ")}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 font-medium">
                    {getWardName(rule.ward_id)}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-900">
                    {getDepartmentName(rule.department_id)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={rule.is_active ? "emerald" : "slate"} size="sm">
                      {rule.is_active ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={rule.is_active ? "outline" : "primary"}
                      size="sm"
                      onClick={() => toggleRuleActive(rule.id)}
                      className="rounded-lg text-xs"
                    >
                      {rule.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}