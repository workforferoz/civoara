import React from "react";
import Link from "next/link";
import { ShieldAlert, ExternalLink } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <span className="text-base font-black tracking-wider text-white">
                CIVOARA
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Civic accountability and municipal service delivery operating
              system. Providing automated spatial routing, deterministic SLAs, and
              uncompromising public transparency.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Municipal Systems Online (99.98% Uptime)</span>
            </div>
          </div>

          {/* Citizen Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Citizen Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/report" className="hover:text-white transition-colors">
                  Report Civic Issue
                </Link>
              </li>
              <li>
                <Link href="/citizen/dashboard" className="hover:text-white transition-colors">
                  Track My Complaints
                </Link>
              </li>
              <li>
                <Link href="/public/map" className="hover:text-white transition-colors">
                  Live Municipal Issue Map
                </Link>
              </li>
              <li>
                <Link href="/public/performance" className="hover:text-white transition-colors">
                  Citywide SLA Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance & Operations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Internal Governance
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/officer/tasks" className="hover:text-white transition-colors">
                  Field Officer Worklist
                </Link>
              </li>
              <li>
                <Link href="/admin/routing" className="hover:text-white transition-colors">
                  Geospatial Ward Routing
                </Link>
              </li>
              <li>
                <Link href="/admin/sla" className="hover:text-white transition-colors">
                  SLA & Escalation Policies
                </Link>
              </li>
              <li>
                <Link href="/admin/restructuring" className="hover:text-white transition-colors">
                  Department Restructuring Wizard
                </Link>
              </li>
            </ul>
          </div>

          {/* Privacy & Accountability */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Transparency & Standards
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              All reported complaints are tracked immutably. Private citizen contact
              data is redacted from public records under municipal privacy
              ordinances.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300">
              <Link href="/public/performance" className="flex items-center gap-1">
                <span>View Public Audit Standards</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 CIVOARA Municipal Platform. Built for civic accountability.</p>
          <div className="flex items-center gap-6">
            <span>PostGIS Georouting</span>
            <span>Deterministic SLA Engine</span>
            <span>Non-Destructive Org Segments</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
