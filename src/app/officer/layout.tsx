"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Sidebar } from "@/components/layout/Sidebar";
import { ClipboardList, MapPin, CheckCircle2, BarChart3 } from "lucide-react";

export default function OfficerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const officerNavItems = [
    {
      href: "/officer/tasks",
      label: "Assigned Worklist",
      icon: <ClipboardList className="w-4 h-4" />,
    },
    {
      href: "/officer/map",
      label: "Field Map View",
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      href: "/officer/history",
      label: "Resolution Proofs",
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    {
      href: "/officer/metrics",
      label: "My SLA Performance",
      icon: <BarChart3 className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <div className="hidden lg:block shrink-0">
          <Sidebar
            title="Field Officer Operations"
            subtitle="Department Dispatch"
            items={officerNavItems}
            footerContent={
              <div className="space-y-1 text-slate-500">
                <p className="font-semibold text-slate-700">SLA Watchdog</p>
                <p className="text-[11px]">Timers run 24/7 once assigned.</p>
                <p className="text-[11px]">Level 1 escalation triggers at T=0.</p>
              </div>
            }
          />
        </div>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
