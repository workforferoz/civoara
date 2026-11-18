"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ShieldCheck,
  Clock,
  MapPin,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
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
import { getCitizenIssues } from "@/lib/services/issue.service";
import type { Issue, IssueStatus } from "@/types/database.types";

export default function PublicIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    async function loadData() {
      const data = await getCitizenIssues();
      setIssues(data);
    }
    loadData();
  }, []);

  const filteredIssues = issues.filter((issue) => {
    if (selectedCategory !== "all" && issue.category !== selectedCategory) return false;
    if (selectedStatus !== "all" && issue.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchRef = issue.reference_number.toLowerCase().includes(q);
      const matchTitle = issue.title.toLowerCase().includes(q);
      const matchDesc = issue.description.toLowerCase().includes(q);
      if (!matchRef && !matchTitle && !matchDesc) return false;
    }
    return true;
  });

  const getStatusBadge = (status: IssueStatus): BadgeVariant => {
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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="indigo" size="sm">
              <FileText className="w-3.5 h-3.5 inline mr-1" />
              Public Records Archive
            </Badge>
            <Badge variant="emerald" size="sm">
              <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
              Privacy Protocol Active
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Open Municipal Issues Register
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Searchable civic records register for citizens, journalists, and civic watchdogs.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/public/performance">
            <Button variant="outline" size="md">
              SLA Leaderboard
            </Button>
          </Link>
          <Link href="/public/map">
            <Button
              variant="gradient"
              size="md"
              leftIcon={<MapPin className="w-4 h-4" />}
            >
              Spatial Map
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-2xl border-slate-200/90 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-200/80 px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Audited Civic Complaint Index
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Every record links to an immutable PostGIS spatial coordinate and deterministic SLA timeline.
              </CardDescription>
            </div>
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search reference, defect..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-2xs transition-all"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Filters Bar */}
          <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              <span>Filters:</span>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Categories</option>
              <option value="pothole">Potholes & Roads</option>
              <option value="garbage">Garbage</option>
              <option value="broken_streetlight">Broken Streetlights</option>
              <option value="water_leakage">Water Leakage</option>
              <option value="other">Other</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="escalated">Escalated</option>
              <option value="resolved">Resolved</option>
            </select>

            <span className="text-slate-400 font-medium text-xs ml-auto">
              Displaying <strong className="text-slate-700">{filteredIssues.length}</strong> public records
            </span>
          </div>

          <Table>
            <TableHeader className="bg-slate-100/60">
              <TableRow>
                <TableHead className="font-bold">Public Reference</TableHead>
                <TableHead className="font-bold">Category & Details</TableHead>
                <TableHead className="font-bold">Public Status</TableHead>
                <TableHead className="font-bold">SLA Standard</TableHead>
                <TableHead className="font-bold text-right">Lodged Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIssues.length === 0 ? (
                <TableEmpty
                  message={
                    searchQuery || selectedCategory !== "all" || selectedStatus !== "all"
                      ? "No complaints matching your search filters"
                      : "No civic complaints registered yet. Use 'File a Complaint' to lodge an issue."
                  }
                  colSpan={5}
                />
              ) : (
                filteredIssues.map((issue) => (
                  <TableRow key={issue.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-indigo-700 px-2 py-1 rounded-md bg-indigo-50/80 border border-indigo-100">
                          {issue.reference_number}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5 max-w-md">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          {issue.category.replace("_", " ")}
                        </span>
                        <p className="text-xs font-semibold text-slate-900 line-clamp-1">
                          {issue.title}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {issue.location_description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(issue.status)} size="sm">
                        {issue.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Deterministic Timer</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-xs text-slate-500 font-mono">
                      {new Date(issue.created_at).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
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