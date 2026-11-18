"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  MapPin,
  Check,
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
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { getCitizenIssues } from "@/lib/services/issue.service";
import { calculateSlaMetrics } from "@/lib/sla/sla.service";
import type { Issue, IssueStatus } from "@/types/database.types";

export default function OfficerTasksPage() {
  const { addToast } = useToast();
  const [tasks, setTasks] = useState<Issue[]>([]);
  const [selectedTask, setSelectedTask] = useState<Issue | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolutionPhoto, setResolutionPhoto] = useState<string | null>(null);

  useEffect(() => {
    async function loadTasks() {
      const issues = await getCitizenIssues();
      setTasks(issues);
    }
    loadTasks();
  }, []);

  const handleStatusChange = (newStatus: IssueStatus) => {
    if (!selectedTask) return;
    setIsUpdating(true);

    setTimeout(() => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTask.id
            ? {
                ...t,
                status: newStatus,
                resolution_notes: newStatus === "resolved" ? resolutionNotes : t.resolution_notes,
                resolution_photo_url:
                  newStatus === "resolved" && resolutionPhoto ? resolutionPhoto : t.resolution_photo_url,
                resolved_at: newStatus === "resolved" ? new Date().toISOString() : t.resolved_at,
              }
            : t
        )
      );

      addToast({
        type: "success",
        title: "Work Order Updated",
        message: `Reference ${selectedTask.reference_number} updated to ${newStatus.replace("_", " ")}.`,
      });

      setIsUpdating(false);
      setSelectedTask(null);
      setResolutionNotes("");
      setResolutionPhoto(null);
    }, 400);
  };

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
              <ClipboardList className="w-3.5 h-3.5 inline mr-1" />
              Field Officer Dispatch
            </Badge>
            <Badge variant="emerald" size="sm">
              SLA Priority Sorted
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Assigned Municipal Work Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Ordered by SLA deadline urgency. Level 1 supervisor escalation triggers
            automatically if deadline is breached.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-2xl border-slate-200/90 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-200/80 px-6 py-5">
          <CardTitle className="text-base font-bold text-slate-900">
            Assigned Worklist Queue
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            Select any ticket to advance status, upload photographic rectification proof, or inspect coordinates.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-100/60">
              <TableRow>
                <TableHead className="font-bold">Reference</TableHead>
                <TableHead className="font-bold">Category & Title</TableHead>
                <TableHead className="font-bold">Current Status</TableHead>
                <TableHead className="font-bold">SLA Countdown</TableHead>
                <TableHead className="font-bold">Escalation Tier</TableHead>
                <TableHead className="font-bold text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length === 0 ? (
                <TableEmpty message="No active tasks assigned to your roster" colSpan={6} />
              ) : (
                tasks.map((task) => {
                  const metrics = calculateSlaMetrics(task);
                  return (
                    <TableRow key={task.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-indigo-700">
                        {task.reference_number}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5 max-w-sm">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {task.category.replace("_", " ")}
                          </span>
                          <p className="text-xs font-semibold text-slate-900 line-clamp-1">
                            {task.title}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(task.status)} size="sm">
                          {task.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          <Clock
                            className={`w-3.5 h-3.5 ${
                              metrics.status === "breached"
                                ? "text-red-600 animate-pulse"
                                : metrics.status === "warning"
                                ? "text-amber-500"
                                : "text-slate-400"
                            }`}
                          />
                          <span
                            className={
                              metrics.status === "breached"
                                ? "text-red-700 font-bold"
                                : metrics.status === "warning"
                                ? "text-amber-700 font-bold"
                                : "text-slate-700"
                            }
                          >
                            {metrics.formattedRemaining}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            metrics.currentLevel === 0
                              ? "bg-slate-100 text-slate-700 border border-slate-200"
                              : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}
                        >
                          Level {metrics.currentLevel}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTask(task)}
                          className="rounded-lg text-xs"
                        >
                          Update Progress
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Task Update Modal */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={`Work Order: ${selectedTask.reference_number}`}
          description={selectedTask.title}
          maxWidth="lg"
          footer={
            <Button variant="outline" size="sm" onClick={() => setSelectedTask(null)}>
              Cancel
            </Button>
          }
        >
          <div className="space-y-5 text-xs">
            {/* Description & Location */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <p className="font-semibold text-slate-800 leading-relaxed">{selectedTask.description}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>
                  {selectedTask.location_description || "Coordinates"}: {selectedTask.latitude.toFixed(4)},{" "}
                  {selectedTask.longitude.toFixed(4)}
                </span>
              </div>
            </div>

            {/* Evidence photo if present */}
            {selectedTask.photo_url && (
              <div className="space-y-1.5">
                <span className="font-bold text-slate-700 block">Reported Defect Photograph</span>
                <div className="relative h-48 w-full rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shadow-2xs">
                  <Image
                    src={selectedTask.photo_url}
                    alt="Defect photo"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            )}

            {/* Status advancement buttons */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <span className="font-bold text-slate-800 block">Advance Workflow Status:</span>
              <div className="grid grid-cols-2 gap-2.5">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleStatusChange("in_progress")}
                  isLoading={isUpdating}
                  disabled={selectedTask.status === "in_progress"}
                  className="rounded-xl"
                  leftIcon={<Clock className="w-3.5 h-3.5" />}
                >
                  Mark In Progress
                </Button>

                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => handleStatusChange("resolved")}
                  isLoading={isUpdating}
                  disabled={selectedTask.status === "resolved"}
                  className="rounded-xl shadow-md shadow-indigo-600/20"
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Submit Resolution & Close
                </Button>
              </div>
            </div>

            {/* Resolution proof inputs */}
            <div className="space-y-2.5 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
              <span className="font-bold text-indigo-950 block">Resolution Verification Details:</span>
              <textarea
                rows={2}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Enter actions taken (e.g. Asphalting completed, streetlight fixture replaced)..."
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() =>
                    setResolutionPhoto(
                      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80"
                    )
                  }
                  className="rounded-lg bg-white"
                  leftIcon={resolutionPhoto ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : undefined}
                >
                  {resolutionPhoto ? "Proof Photo Attached" : "Attach Sample Rectification Photo"}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}