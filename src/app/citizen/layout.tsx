"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Sidebar } from "@/components/layout/Sidebar";
import { LayoutDashboard, PlusCircle, FileText, User } from "lucide-react";

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const citizenNavItems = [
    {
      href: "/citizen/dashboard",
      label: "My Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      href: "/report",
      label: "Report New Issue",
      icon: <PlusCircle className="w-4 h-4" />,
    },
    {
      href: "/citizen/reports",
      label: "Submitted Complaints",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      href: "/citizen/profile",
      label: "Profile & Notifications",
      icon: <User className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <div className="hidden lg:block shrink-0">
          <Sidebar
            title="Citizen Portal"
            subtitle="Accountability & Reports"
            items={citizenNavItems}
            footerContent={
              <div className="space-y-1 text-slate-500">
                <p className="font-semibold text-slate-700">Need Immediate Help?</p>
                <p className="text-[11px]">Emergency police/fire: Call 112</p>
                <p className="text-[11px]">Civic helpline: 1912</p>
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
