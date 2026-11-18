"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  GitBranch,
  Clock,
  Building,
  Map,
  Layers,
  Users,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminNavItems = [
    {
      href: "/admin/routing",
      label: "Routing Engine Rules",
      icon: <GitBranch className="w-4 h-4" />,
    },
    {
      href: "/admin/sla",
      label: "SLA Policies & Tiers",
      icon: <Clock className="w-4 h-4" />,
    },
    {
      href: "/admin/restructuring",
      label: "Dept Restructuring Wizard",
      icon: <Building className="w-4 h-4" />,
    },
    {
      href: "/admin/wards",
      label: "Ward Geometries",
      icon: <Map className="w-4 h-4" />,
    },
    {
      href: "/admin/clusters",
      label: "Duplicate Clustering",
      icon: <Layers className="w-4 h-4" />,
    },
    {
      href: "/admin/users",
      label: "Staff & RBAC Roles",
      icon: <Users className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <div className="hidden lg:block shrink-0">
          <Sidebar
            title="System Administration"
            subtitle="City Oversight & Rules"
            items={adminNavItems}
            footerContent={
              <div className="space-y-1 text-slate-500">
                <p className="font-semibold text-slate-700">Audit Compliance</p>
                <p className="text-[11px]">All rule changes write to immutable event logs.</p>
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
