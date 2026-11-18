"use client";

import React, { useState } from "react";
import {
  Layers,
  Search,
  ShieldCheck,
  CheckCircle2,
  Users,
  Compass,
  Sliders,
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
import { useToast } from "@/components/ui/Toast";
import {
  DEMO_CLUSTERS,
  DEFAULT_CLUSTERING_CONFIG,
  findDuplicateCandidates,
  calculateClusterPriority,
  type ClusteringConfig,
  type DuplicateMatchCandidate,
  type DemoClusterView,
} from "@/lib/clustering/clustering.service";
import type { IssueCategory } from "@/types/database.types";

export default function AdminClustersPage() {
  const { addToast } = useToast();
  const [clusters, setClusters] = useState<DemoClusterView[]>(DEMO_CLUSTERS);
  const [config, setConfig] = useState<ClusteringConfig>(DEFAULT_CLUSTERING_CONFIG);

  // Test Simulator State
  const [testCat, setTestCat] = useState<IssueCategory>("pothole");
  const [testLat, setTestLat] = useState<number>(12.9785);
  const [testLng, setTestLng] = useState<number>(77.6409);
  const [testTitle, setTestTitle] = useState("");
  const [testDesc, setTestDesc] = useState("");
  const [testCandidates, setTestCandidates] = useState<DuplicateMatchCandidate[] | null>(null);

  const handleTestMatch = () => {
    const existingIssues = clusters.map((c) => c.canonicalIssue);
    const candidates = findDuplicateCandidates(
      {
        category: testCat,
        latitude: testLat,
        longitude: testLng,
        title: testTitle,
        description: testDesc,
      },
      existingIssues,
      config
    );
    setTestCandidates(candidates);
  };

  const handleApproveMerge = (targetClusterId: string | null, candidate: DuplicateMatchCandidate) => {
    const canonicalId = candidate.existingIssue.id;
    const newReport = {
      id: `rep-${Date.now()}`,
      issue_id: canonicalId,
      citizen_id: `citizen-${Math.floor(1000 + Math.random() * 9000)}`,
      raw_description: candidate.existingIssue.description,
      raw_latitude: candidate.existingIssue.latitude,
      raw_longitude: candidate.existingIssue.longitude,
      submitted_at: new Date().toISOString(),
    };

    setClusters((prev) => {
      const matchIndex = prev.findIndex(
        (c) => c.cluster.id === targetClusterId || c.canonicalIssue.id === canonicalId
      );
      if (matchIndex >= 0) {
        return prev.map((c, i) =>
          i === matchIndex
            ? {
                ...c,
                cluster: {
                  ...c.cluster,
                  report_count: c.cluster.report_count + 1,
                  updated_at: new Date().toISOString(),
                },
                reports: [newReport, ...c.reports],
              }
            : c
        );
      } else {
        const newCluster: DemoClusterView = {
          cluster: {
            id: `cl-${Date.now()}`,
            canonical_issue_id: canonicalId,
            report_count: 2,
            confidence_score: candidate.confidenceScore,
            cluster_radius_meters: candidate.distanceMeters,
            is_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          canonicalIssue: candidate.existingIssue,
          reports: [
            {
              id: `rep-orig-${Date.now()}`,
              issue_id: canonicalId,
              citizen_id: "citizen-original",
              raw_description: candidate.existingIssue.description,
              raw_latitude: candidate.existingIssue.latitude,
              raw_longitude: candidate.existingIssue.longitude,
              submitted_at: candidate.existingIssue.created_at,
            },
            newReport,
          ],
        };
        return [newCluster, ...prev];
      }
    });

    addToast({
      type: "success",
      title: "Cluster Formed",
      message: "Report attached to canonical issue. Priority recalculated with Sybil protection.",
    });
    setTestCandidates(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="indigo" size="sm">
              <Layers className="w-3.5 h-3.5 inline mr-1" />
              Spatial Intelligence
            </Badge>
            <Badge variant="emerald" size="sm">
              <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
              ST_DWithin PostGIS Proximity
            </Badge>
            <Badge variant="sky" size="sm">
              Anti-Sybil Priority Engine
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Duplicate Issue Clustering & Sybil Protection
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            Automatically group multiple citizen reports for the same physical civic problem
            into a single canonical work order while preserving individual citizen tracking.
          </p>
        </div>
      </div>

      {/* Threshold Configuration Sliders */}
      <Card className="rounded-2xl border-slate-200/90 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-200/80 px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Clustering Sensitivity Parameters
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Tune spatial proximity radius, temporal clustering window, and auto-merge confidence threshold.
                </CardDescription>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 self-start sm:self-auto">
              PostGIS Config Engine
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            {/* Radius Slider */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
              <div className="flex justify-between font-bold text-slate-800">
                <span className="text-slate-700">Spatial Proximity Radius:</span>
                <span className="text-indigo-600 font-mono font-black">{config.radiusMeters}m</span>
              </div>
              <input
                type="range"
                min={20}
                max={200}
                step={5}
                value={config.radiusMeters}
                onChange={(e) =>
                  setConfig({ ...config, radiusMeters: parseInt(e.target.value) })
                }
                className="w-full accent-indigo-600"
              />
              <p className="text-[11px] text-slate-500 leading-tight">
                Reports within this radius are evaluated for physical proximity.
              </p>
            </div>

            {/* Time Window Slider */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
              <div className="flex justify-between font-bold text-slate-800">
                <span className="text-slate-700">Time Grouping Window:</span>
                <span className="text-indigo-600 font-mono font-black">{config.timeWindowHours}h</span>
              </div>
              <input
                type="range"
                min={12}
                max={168}
                step={6}
                value={config.timeWindowHours}
                onChange={(e) =>
                  setConfig({ ...config, timeWindowHours: parseInt(e.target.value) })
                }
                className="w-full accent-indigo-600"
              />
              <p className="text-[11px] text-slate-500 leading-tight">
                Temporal cutoff window for duplicate physical incidents.
              </p>
            </div>

            {/* Auto-merge Confidence Slider */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
              <div className="flex justify-between font-bold text-slate-800">
                <span className="text-slate-700">Auto-Merge Confidence:</span>
                <span className="text-indigo-600 font-mono font-black">
                  {(config.autoMergeThreshold * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min={0.65}
                max={0.95}
                step={0.05}
                value={config.autoMergeThreshold}
                onChange={(e) =>
                  setConfig({ ...config, autoMergeThreshold: parseFloat(e.target.value) })
                }
                className="w-full accent-indigo-600"
              />
              <p className="text-[11px] text-slate-500 leading-tight">
                Matches above threshold merge automatically; below routes to review.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Duplicate Test Workbench */}
      <Card className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Duplicate Detection Workbench & Simulator
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Simulate an incoming citizen report to test spatial proximity, text similarity, and grouping score.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={testCat}
                onChange={(e) => setTestCat(e.target.value as IssueCategory)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-2xs"
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
                Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={testLat}
                onChange={(e) => setTestLat(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={testLng}
                onChange={(e) => setTestLng(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-2xs"
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="gradient"
                size="md"
                onClick={handleTestMatch}
                className="w-full rounded-xl shadow-md shadow-indigo-600/20"
                leftIcon={<Compass className="w-3.5 h-3.5" />}
              >
                Search Duplicates
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Complaint Title
              </label>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Description
              </label>
              <input
                type="text"
                value={testDesc}
                onChange={(e) => setTestDesc(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
              />
            </div>
          </div>

          {/* Preset Test Scenarios */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider">
              Test Scenarios:
            </span>
            <button
              type="button"
              onClick={() => {
                setTestCat("pothole");
                setTestLat(12.9785);
                setTestLng(77.6409);
                setTestTitle("Road crater near 100ft road");
                setTestDesc("Two-wheeler accident hazard near KFC junction.");
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 font-medium text-xs shadow-2xs transition-all"
            >
              High Match (~94% Auto-Merge)
            </button>
            <button
              type="button"
              onClick={() => {
                setTestCat("pothole");
                setTestLat(12.9792);
                setTestLng(77.6415);
                setTestTitle("Asphalt breakdown 100ft road");
                setTestDesc("Road surface cracking ~110m away.");
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-amber-300 hover:bg-amber-50 text-slate-700 font-medium text-xs shadow-2xs transition-all"
            >
              Uncertain Match (~62% Review Queue)
            </button>
            <button
              type="button"
              onClick={() => {
                setTestCat("broken_streetlight");
                setTestLat(12.9785);
                setTestLng(77.6409);
                setTestTitle("Streetlight dark");
                setTestDesc("Fixture dark near same junction.");
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-xs shadow-2xs transition-all"
            >
              Different Category (0% Reject)
            </button>
          </div>

          {/* Search Result */}
          {testCandidates && (
            <div className="p-5 rounded-2xl border border-indigo-200 bg-white shadow-sm space-y-3.5">
              <span className="font-bold text-xs text-slate-900 block">
                Detection Output: {testCandidates.length} candidate(s) detected
              </span>
              {testCandidates.length === 0 ? (
                <p className="text-xs text-slate-500 font-normal">
                  No duplicate clusters detected. This issue will be created as an independent canonical work order.
                </p>
              ) : (
                testCandidates.map((cand, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-indigo-700 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100">
                          {cand.existingIssue.reference_number}
                        </span>
                        <Badge
                          variant={
                            cand.actionRecommendation === "auto_merge"
                              ? "emerald"
                              : "amber"
                          }
                          size="sm"
                        >
                          {(cand.confidenceScore * 100).toFixed(0)}% Match (
                          {cand.actionRecommendation === "auto_merge"
                            ? "Auto-Merge Candidate"
                            : "Administrative Review"}
                          )
                        </Badge>
                      </div>
                      <p className="text-slate-900 font-bold text-sm">
                        {cand.existingIssue.title}
                      </p>
                      <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-500">
                        {cand.reasons.map((r, i) => (
                          <span key={i} className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-600 font-medium">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <Button
                        variant="gradient"
                        size="sm"
                        onClick={() => handleApproveMerge(clusters[0]?.cluster?.id || null, cand)}
                        className="rounded-lg shadow-sm"
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        Merge into Cluster
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Clusters View with Sybil Proof Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Canonical Clusters & Child Citizen Submissions
        </h3>

        {clusters.length === 0 ? (
          <div className="p-10 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 text-center space-y-2.5">
            <Layers className="w-8 h-8 mx-auto text-slate-400" />
            <h4 className="text-sm font-bold text-slate-800">No Active Duplicate Clusters</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              When multiple citizens report identical or nearby defect incidents, the ST_DWithin spatial clustering engine automatically groups them into canonical clusters here.
            </p>
          </div>
        ) : (
          clusters.map((c) => {
          const priorityMetrics = calculateClusterPriority(c.reports);
          return (
            <Card key={c.cluster.id} className="rounded-2xl border-slate-200/90 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-200/80 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-indigo-700 px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100">
                      {c.canonicalIssue.reference_number}
                    </span>
                    <Badge variant="indigo" size="sm">
                      Canonical Issue
                    </Badge>
                    <Badge variant="emerald" size="sm">
                      {c.cluster.report_count} Reports Merged
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    {c.canonicalIssue.title}
                  </CardTitle>
                </div>

                {/* Sybil / Priority Impact Box */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs self-start sm:self-auto">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Unique Citizens
                    </span>
                    <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      {priorityMetrics.uniqueCitizensCount} of {priorityMetrics.totalReports}
                    </span>
                  </div>
                  <div className="border-l border-slate-200 pl-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Audited Priority
                    </span>
                    <span className="font-black text-rose-700 uppercase mt-0.5 block">
                      {priorityMetrics.priority}
                    </span>
                  </div>
                  {priorityMetrics.inflationPrevented && (
                    <div className="border-l border-slate-200 pl-3 text-emerald-700 flex items-center gap-1 text-[11px] font-bold">
                      <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>Sybil Guard Active</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-100/60">
                    <TableRow>
                      <TableHead className="font-bold">Citizen Report ID</TableHead>
                      <TableHead className="font-bold">Citizen Identifier</TableHead>
                      <TableHead className="font-bold">Submitted Description</TableHead>
                      <TableHead className="font-bold">Coordinates</TableHead>
                      <TableHead className="font-bold text-right">Reported At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {c.reports.map((report) => (
                      <TableRow key={report.id} className="hover:bg-slate-50/80 transition-colors">
                        <TableCell className="font-mono text-xs font-semibold text-slate-700">
                          {report.id}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-indigo-700 font-bold">
                          {report.citizen_id || "Anonymous"}
                        </TableCell>
                        <TableCell className="text-xs text-slate-800 max-w-xs font-medium">
                          {report.raw_description}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-600">
                          {report.raw_latitude.toFixed(4)}, {report.raw_longitude.toFixed(4)}
                        </TableCell>
                        <TableCell className="text-right text-xs text-slate-500 font-mono">
                          {new Date(report.submitted_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })
      )}
      </div>
    </div>
  );
}