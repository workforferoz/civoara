"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  ExternalLink,
  Globe,
  BarChart3,
  Search,
  Activity,
  ChevronDown,
  Bell,
  ArrowUpRight,
  Menu,
  X,
} from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (workspaceRef.current && !workspaceRef.current.contains(event.target as Node)) {
        setWorkspaceMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navItems = [
    {
      href: "/public/map",
      label: "Incident Explorer",
      icon: <Globe className="w-4 h-4" />,
      active: pathname === "/public" || pathname === "/public/map",
    },
    {
      href: "/public/performance",
      label: "Performance Dashboard",
      icon: <BarChart3 className="w-4 h-4" />,
      active: pathname.startsWith("/public/performance"),
    },
    {
      href: "/citizen/dashboard",
      label: "Track by Ticket ID",
      icon: <Search className="w-4 h-4" />,
      active: pathname.startsWith("/citizen/dashboard"),
    },
    {
      href: "/admin/sla",
      label: "SLA Transparency",
      icon: <Activity className="w-4 h-4" />,
      active: pathname.startsWith("/admin/sla"),
    },
  ];

  const workspaces = [
    { href: "/citizen/dashboard", name: "Citizen Portal", role: "Public / Citizen" },
    { href: "/officer/tasks", name: "Field Officer Queue", role: "Field Officer" },
    { href: "/admin/routing", name: "Operations & Routing", role: "Supervisor / Admin" },
    { href: "/admin/sla", name: "SLA Escalation Engine", role: "System Admin" },
    { href: "/admin/clusters", name: "Duplicate Clustering", role: "Data Reviewer" },
    { href: "/admin/restructuring", name: "Org Restructuring", role: "Municipal Admin" },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      {/* Left Sidebar - Deep Navy Government SaaS Styling */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[#070D1E] text-white border-r border-[#152042]">
        {/* Brand Area */}
        <div className="p-4 border-b border-[#152042] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Shield className="h-4 w-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-tight text-white block leading-none">
                CIVOARA
              </span>
              <span className="text-[9px] uppercase font-semibold text-slate-400 tracking-wider block mt-0.5">
                GOVTECH SAAS
              </span>
            </div>
          </Link>
          <Link href="/" title="Open Platform Home" className="text-slate-400 hover:text-white transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Public Transparency Badge Pill */}
        <div className="p-3">
          <div className="bg-[#0F1A3A] border border-[#1E2D5A] rounded-lg p-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">
              Public Transparency
            </span>
            <span className="bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
              Open Data Portal
            </span>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 px-3 py-2 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-3 block mb-2">
            MAIN NAVIGATION
          </span>

          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors duration-75 ${
                item.active
                  ? "bg-sky-600 text-white font-bold shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-white/5 font-medium"
              }`}
            >
              <span className={item.active ? "text-white" : "text-slate-400"}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Sidebar Footer info */}
        <div className="p-4 border-t border-[#152042] text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[10px] uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Open Data Certified</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Strict PII redaction active under Municipal Privacy Ordinances.
          </p>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-40">
          {/* Mobile menu button & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-1.5 rounded-md text-slate-600 hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Public Transparency</span>
              <span>&gt;</span>
              <span className="text-slate-500">Overview</span>
            </div>
          </div>

          {/* Global Search Box */}
          <div className="hidden md:block relative max-w-sm w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search incidents, wards & officers..."
              className="w-full h-8 pl-8 pr-12 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 border border-slate-200 bg-white rounded px-1.5 py-0.5 font-mono">
              ⌘K
            </span>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-3">
            {/* Switch Workspace Dropdown */}
            <div className="relative" ref={workspaceRef}>
              <button
                type="button"
                onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Switch Workspace</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${workspaceMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {workspaceMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    Available Workspaces
                  </div>
                  <div className="space-y-0.5">
                    {workspaces.map((ws) => (
                      <Link
                        key={ws.href}
                        href={ws.href}
                        onClick={() => setWorkspaceMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                            {ws.name}
                          </span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                        </div>
                        <p className="text-[10px] text-slate-500">{ws.role}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              className="relative p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
            </button>

            {/* User Profile Capsule */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="h-7 w-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                P
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-slate-900 block leading-none">
                  Public Guest
                </span>
                <span className="text-[10px] text-slate-400 block leading-none mt-0.5">
                  Public Access
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileSidebarOpen && (
          <div className="lg:hidden bg-[#070D1E] text-white p-4 border-b border-[#152042] space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block px-2 mb-1">
              Main Navigation
            </span>
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs ${
                  item.active ? "bg-sky-600 text-white font-bold" : "text-slate-300 hover:bg-white/5"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50/70 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
