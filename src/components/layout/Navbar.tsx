"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, ChevronDown, Menu, X, ArrowUpRight } from "lucide-react";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [workspacesOpen, setWorkspacesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setWorkspacesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navLinks = [
    { href: "/#lifecycle-protocol", label: "Lifecycle Protocol" },
    { href: "/#system-architecture", label: "System Architecture" },
    { href: "/#accountability-sla", label: "Accountability and SLA" },
    { href: "/public/performance", label: "Performance Metrics" },
  ];

  const workspaces = [
    { href: "/citizen/dashboard", name: "Citizen Portal", desc: "Track lodged reports & verification" },
    { href: "/officer/tasks", name: "Field Officer Queue", desc: "Work order management & photo uploads" },
    { href: "/admin/routing", name: "Operations & Routing", desc: "PostGIS ward dispatch engine" },
    { href: "/admin/sla", name: "SLA Escalation Engine", desc: "Multi-tier timer sweeps & breach logging" },
    { href: "/admin/clusters", name: "Duplicate Clustering", desc: "Spatial ST_DWithin cluster detection" },
    { href: "/admin/restructuring", name: "Org Restructuring", desc: "Department transfers & fair SLA budgets" },
  ];

  const isActive = (path: string) => {
    if (path.startsWith("/#")) return false;
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Section */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B132B] text-sky-400 shrink-0 shadow-2xs">
            <Shield className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-slate-900 leading-none">
                CIVOARA
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-slate-100 text-slate-700 border border-slate-200">
                MUNICIPAL 311
              </span>
            </div>
            <span className="text-[9.5px] uppercase font-semibold text-slate-400 tracking-wider mt-0.5 leading-none">
              INCIDENT ROUTING AND SLA ENGINE
            </span>
          </div>
        </Link>

        {/* Center Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs font-medium transition-colors ${
                isActive(link.href)
                  ? "text-blue-600 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Workspaces Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setWorkspacesOpen(!workspacesOpen)}
              className="px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer select-none"
              aria-expanded={workspacesOpen}
            >
              <span>Workspaces</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-100 ${workspacesOpen ? "rotate-180" : ""}`} />
            </button>

            {workspacesOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-lg z-50 animate-in fade-in-50 duration-75">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                  Operational Workspaces
                </div>
                <div className="space-y-0.5">
                  {workspaces.map((ws) => (
                    <Link
                      key={ws.href}
                      href={ws.href}
                      onClick={() => setWorkspacesOpen(false)}
                      className="block px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                          {ws.name}
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                        {ws.desc}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          <Link href="/public/issues">
            <button
              type="button"
              className="inline-flex items-center justify-center font-semibold rounded-md border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 active:bg-slate-100 px-3.5 py-1.5 text-xs shadow-2xs transition-colors cursor-pointer"
            >
              Browse Incidents
            </button>
          </Link>
          <Link href="/report">
            <button
              type="button"
              className="inline-flex items-center justify-center font-bold rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-1.5 text-xs shadow-xs border border-blue-700 transition-colors cursor-pointer"
            >
              Report Incident
            </button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="block px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Workspaces
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {workspaces.map((ws) => (
                <Link
                  key={ws.href}
                  href={ws.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200/60"
                >
                  {ws.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            <Link href="/report" onClick={() => setMobileMenuOpen(false)}>
              <button
                type="button"
                className="w-full font-bold rounded-md bg-blue-600 hover:bg-blue-700 text-white py-2 text-xs shadow-xs"
              >
                Report Incident
              </button>
            </Link>
            <Link href="/public/issues" onClick={() => setMobileMenuOpen(false)}>
              <button
                type="button"
                className="w-full font-semibold rounded-md border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 py-2 text-xs shadow-2xs"
              >
                Browse Incidents
              </button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
