"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  MapPin,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { getCitizenIssues } from "@/lib/services/issue.service";
import type { Issue, IssueStatus } from "@/types/database.types";

export default function CitizenDashboardPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [filter, setFilter] = useState<"all" | "open" | "in_progress" | "resolved">("all");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getCitizenIssues();
      setIssues(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const totalCount = issues.length;
  const openCount = issues.filter((i) => i.status === "submitted" || i.status === "assigned").length;
  const inProgressCount = issues.filter((i) => i.status === "in_progress" || i.status === "escalated").length;
  const resolvedCount = issues.filter((i) => i.status === "resolved" || i.status === "closed").length;

  const filteredIssues = issues.filter((issue) => {
    if (filter === "all") return true;
    if (filter === "open") return issue.status === "submitted" || issue.status === "assigned";
    if (filter === "in_progress") return issue.status === "in_progress" || issue.status === "escalated";
    if (filter === "resolved") return issue.status === "resolved" || issue.status === "closed";
    return true;
  });

  const getStatusBadgeVariant = (status: IssueStatus) => {
    switch (status) {
      case "submitted":
        return "submitted";
      case "assigned":
        return "assigned";
      case "in_progress":
        return "in_progress";
      case "escalated":
        return "escalated";
      case "resolved":
        return "resolved";
      default:
        return "slate";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Citizen Accountability Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time tracking of civic complaints, live SLA deadlines, and resolution proofs
          </p>
        </div>
        <Link href="/report">
          <Button
            variant="primary"
            size="md"
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            File New Complaint
          </Button>
        </Link>
      </div>

      {/* 4 Metric Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs glow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Submitted
            </p>
            <p className="text-3xl font-black text-slate-900 mt-1">{totalCount}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Complaints registered</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-100 text-slate-700">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Open / Assigned
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{openCount}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Assigned to field queue</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              In Progress
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{inProgressCount}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Active SLA countdown</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Resolved
            </p>
            <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">{resolvedCount}</p>
            <p className="text-[10px] text-emerald-700 mt-0.5">Verified rectification</p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Reports Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>My Lodged Complaints</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Select any ticket to inspect resolution progress, supervisor escalations, or photo proofs.
            </p>
          </div>
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 text-xs">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                filter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setFilter("open")}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                filter === "open" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Open ({openCount})
            </button>
            <button
              onClick={() => setFilter("in_progress")}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                filter === "in_progress" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              In Progress ({inProgressCount})
            </button>
            <button
              onClick={() => setFilter("resolved")}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                filter === "resolved" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Resolved ({resolvedCount})
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Category & Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SLA Clock</TableHead>
                <TableHead>Lodged At</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-slate-500">
                    Loading your complaints...
                  </td>
                </tr>
              ) : filteredIssues.length === 0 ? (
                <TableEmpty
                  message={
                    filter !== "all"
                      ? "No complaints matching this filter"
                      : "No complaints lodged yet. Click 'Report an Issue' above to submit your first report."
                  }
                  colSpan={6}
                />
              ) : (
                filteredIssues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell className="font-mono text-xs font-bold text-slate-900">
                      {issue.reference_number}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                          {issue.category.replace("_", " ")}
                        </span>
                        <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                          {issue.title}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(issue.status)} size="sm">
                        {issue.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {issue.status === "resolved"
                            ? "Completed within SLA"
                            : issue.sla_deadline
                            ? `Due ${new Date(issue.sla_deadline).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" })}`
                            : "Clock Active"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {new Date(issue.created_at).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedIssue(issue)}
                      >
                        Inspect Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Issue Details Modal */}
      {selectedIssue && (
        <Modal
          isOpen={!!selectedIssue}
          onClose={() => setSelectedIssue(null)}
          title={`Ticket Details: ${selectedIssue.reference_number}`}
          description={`Filed on ${new Date(selectedIssue.created_at).toLocaleString()}`}
          maxWidth="xl"
          footer={
            <Button variant="outline" size="sm" onClick={() => setSelectedIssue(null)}>
              Close Window
            </Button>
          }
        >
          <div className="space-y-5 text-xs">
            {/* Status & Priority Strip */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Status:</span>
                <Badge variant={getStatusBadgeVariant(selectedIssue.status)} size="md">
                  {selectedIssue.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Category:</span>
                <span className="font-bold text-slate-800 capitalize">
                  {selectedIssue.category.replace("_", " ")}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">{selectedIssue.title}</h4>
              <p className="text-slate-600 leading-relaxed">{selectedIssue.description}</p>
            </div>

            {/* Coordinates & Location */}
            <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-700 font-semibold">
                <MapPin className="w-4 h-4" />
                <span>Geographic Location</span>
              </div>
              <p className="text-slate-600">
                Latitude: {selectedIssue.latitude.toFixed(6)}, Longitude: {selectedIssue.longitude.toFixed(6)}
              </p>
              {selectedIssue.location_description && (
                <p className="text-slate-500 font-normal">
                  Landmark: {selectedIssue.location_description}
                </p>
              )}
            </div>

            {/* Photos: Report evidence & Resolution proof */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedIssue.photo_url && (
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-700 block">Reported Defect Evidence</span>
                  <div className="relative h-40 w-full rounded-lg border border-slate-200 overflow-hidden bg-slate-100">
                    <Image
                      src={selectedIssue.photo_url}
                      alt="Report evidence"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              )}

              {selectedIssue.resolution_photo_url && (
                <div className="space-y-1.5">
                  <span className="font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Officer Resolution Proof
                  </span>
                  <div className="relative h-40 w-full rounded-lg border border-emerald-200 overflow-hidden bg-emerald-50">
                    <Image
                      src={selectedIssue.resolution_photo_url}
                      alt="Resolution proof"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              )}
            </div>

            {selectedIssue.resolution_notes && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="font-bold text-emerald-900 block mb-1">
                  Officer Closure Notes:
                </span>
                <p className="text-emerald-800">{selectedIssue.resolution_notes}</p>
              </div>
            )}

            {/* Status History Timeline */}
            <div className="border-t border-slate-100 pt-4">
              <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>Status & Audit History</span>
              </h4>
              <div className="space-y-3 relative pl-4 border-l border-slate-200">
                <div className="relative">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-slate-900 border-2 border-white" />
                  <p className="font-bold text-slate-800">Complaint Registered</p>
                  <p className="text-[11px] text-slate-500">
                    {new Date(selectedIssue.created_at).toLocaleString()} • SLA clock initialized
                  </p>
                </div>

                <div className="relative">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-slate-400 border-2 border-white" />
                  <p className="font-bold text-slate-800">PostGIS Ward & Dept Routed</p>
                  <p className="text-[11px] text-slate-500">
                    Assigned to responsible municipal dispatch unit
                  </p>
                </div>

                {selectedIssue.status === "resolved" && (
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-emerald-600 border-2 border-white" />
                    <p className="font-bold text-emerald-800">Verified & Resolved</p>
                    <p className="text-[11px] text-emerald-700">
                      {selectedIssue.resolved_at
                        ? new Date(selectedIssue.resolved_at).toLocaleString()
                        : "Closed with resolution proof"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
