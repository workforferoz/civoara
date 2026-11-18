import React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-slate-900 selection:text-white">
      <Navbar />

      {/* Hero Section: Solid Deep Slate/Navy Background, Zero Glassmorphism, Zero Gradients, High Contrast */}
      <section className="bg-slate-950 text-white py-16 lg:py-24 border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Direct Title, Clear Description, Direct Actions (NO BADGE ABOVE HEADLINE) */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                Municipal Service Delivery with Enforced Resolution Timers
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                CIVOARA automates civic defect intake, routes reports through PostGIS ward boundaries,
                and executes deterministic Service Level Agreement (SLA) countdowns. Unresolved tickets
                escalate through supervisory hierarchy automatically.
              </p>

              {/* Direct Action Buttons - Crisp Solid Colors, No Gradients, No Icons Everywhere */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link href="/report" className="inline-flex shrink-0">
                  <Button variant="primary" size="lg" className="px-6 font-bold">
                    File a Complaint
                  </Button>
                </Link>

                <Link href="/public/map" className="inline-flex shrink-0">
                  <Button variant="outline-dark" size="lg" className="px-6 font-semibold">
                    Public Issue Map
                  </Button>
                </Link>

                <Link href="/public/performance" className="inline-flex shrink-0">
                  <Button variant="ghost-dark" size="lg" className="px-5 font-semibold">
                    Department SLA Audits
                  </Button>
                </Link>
              </div>

              {/* Quick Complaint Lookup Tool (Functional, Useful Civic Tool) */}
              <div className="pt-4 max-w-md">
                <label htmlFor="quick-track" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Track Existing Work Order
                </label>
                <form action="/citizen/dashboard" method="GET" className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="quick-track"
                      type="text"
                      placeholder="e.g. CIV-2026-10492"
                      className="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                    />
                  </div>
                  <Button type="submit" variant="secondary" size="md" className="font-semibold text-xs">
                    Verify
                  </Button>
                </form>
              </div>
            </div>

            {/* Right Column: Solid Architectural Work Order Inspection Panel (Zero Glassmorphism) */}
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="font-mono text-sm font-bold text-white">
                      CIV-2026-10492
                    </span>
                  </div>
                  <Badge variant="in_progress" size="sm">
                    In Progress
                  </Badge>
                </div>

                {/* Structured Fields */}
                <div className="py-4 space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Civic Defect
                    </span>
                    <p className="text-sm font-bold text-white mt-0.5">
                      Road surface subsidence near Metro Pillar 114
                    </p>
                    <span className="text-xs text-slate-400 font-mono">
                      Category: Pothole & Road Hazard
                    </span>
                  </div>

                  {/* SLA Countdown Gauge - Solid, High Contrast */}
                  <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-amber-400 font-bold">
                        23h 48m Remaining
                      </span>
                      <span className="font-mono text-slate-400 text-[11px]">
                        Policy Limit: 48h
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: "50%" }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>Assigned: T+0</span>
                      <span>Target: T+48h</span>
                    </div>
                  </div>

                  {/* Dispatch Specifications */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Ward Boundary
                      </span>
                      <span className="font-bold text-white text-xs block mt-0.5">
                        Ward 102 (Indiranagar)
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Polygon Ray-Cast: Verified
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Assigned Agency
                      </span>
                      <span className="font-bold text-white text-xs block mt-0.5">
                        Public Works Department
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Officer: K. Ramesh (Field)
                      </span>
                    </div>
                  </div>

                  {/* Escalation Sequence */}
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Escalation Path
                      </span>
                      <span className="font-semibold text-white">
                        Level 0 Field Officer → Level 1 Supervisor
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      Auto-Cascade
                    </span>
                  </div>
                </div>

                {/* Footer Status */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Privacy Redacted: No Citizen PII</span>
                  <Link href="/public/map" className="text-blue-400 hover:text-blue-300 font-semibold">
                    Inspect on Ward Map →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Municipal Standards Metric Strip - Solid White, Clean Borders */}
      <section className="bg-white border-b border-slate-200 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            <div className="sm:pr-6">
              <span className="text-2xl font-black text-slate-900 block font-mono">
                48 Hours
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mt-1">
                Standard Pothole SLA
              </span>
              <span className="text-xs text-slate-400">
                Guaranteed response window
              </span>
            </div>

            <div className="pt-4 sm:pt-0 sm:px-6">
              <span className="text-2xl font-black text-slate-900 block font-mono">
                PostGIS
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mt-1">
                Spatial Boundary Engine
              </span>
              <span className="text-xs text-slate-400">
                Point-in-polygon assignment
              </span>
            </div>

            <div className="pt-4 sm:pt-0 sm:px-6">
              <span className="text-2xl font-black text-slate-900 block font-mono">
                4 Tiers
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mt-1">
                Hierarchy Escalation
              </span>
              <span className="text-xs text-slate-400">
                Officer to Commissioner
              </span>
            </div>

            <div className="pt-4 sm:pt-0 sm:pl-6">
              <span className="text-2xl font-black text-slate-900 block font-mono">
                Zero PII
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mt-1">
                Public Data Protection
              </span>
              <span className="text-xs text-slate-400">
                Full privacy compliance
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Municipal SLA Policy Schedule Table - Authoritative Ledger */}
      <section id="accountability-sla" className="py-16 bg-slate-50 border-b border-slate-200 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Municipal Service Standards & Resolution Limits
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every civic complaint logged into CIVOARA is bound to a legally monitored resolution window.
              If a field officer fails to upload verified rectification before the deadline expires, authority escalates.
            </p>
          </div>

          {/* Structured Municipal Standards Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Defect Classification</th>
                  <th className="py-3 px-4">Responsible Department</th>
                  <th className="py-3 px-4">Mandated SLA Budget</th>
                  <th className="py-3 px-4">Level 1 Escalation Trigger</th>
                  <th className="py-3 px-4">Verification Requirement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    Water Leakage & Main Burst
                  </td>
                  <td className="py-3.5 px-4">Water Supply & Sewerage Board</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                    12 Hours
                  </td>
                  <td className="py-3.5 px-4">T+12h overdue: Cascades to Assistant Executive Engineer</td>
                  <td className="py-3.5 px-4 text-slate-500">Pressure restoration log + site photograph</td>
                </tr>
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    Garbage & Solid Waste Dump
                  </td>
                  <td className="py-3.5 px-4">Solid Waste Management Cell</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                    24 Hours
                  </td>
                  <td className="py-3.5 px-4">T+24h overdue: Cascades to Health Inspector</td>
                  <td className="py-3.5 px-4 text-slate-500">Clearance photograph + weighbridge receipt</td>
                </tr>
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    Pothole & Road Hazard
                  </td>
                  <td className="py-3.5 px-4">Public Works Department (Roads)</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                    48 Hours
                  </td>
                  <td className="py-3.5 px-4">T+48h overdue: Cascades to Subdivision Supervisor</td>
                  <td className="py-3.5 px-4 text-slate-500">Compacted asphalt rectification photograph</td>
                </tr>
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    Broken Streetlight & Dark Spot
                  </td>
                  <td className="py-3.5 px-4">Electrical Engineering Division</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                    72 Hours
                  </td>
                  <td className="py-3.5 px-4">T+72h overdue: Cascades to Electrical Inspector</td>
                  <td className="py-3.5 px-4 text-slate-500">Illuminated fixture test photograph</td>
                </tr>
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    Other Municipal Infrastructure
                  </td>
                  <td className="py-3.5 px-4">Administrative Review Cell</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                    96 Hours
                  </td>
                  <td className="py-3.5 px-4">T+96h overdue: Cascades to Joint Commissioner</td>
                  <td className="py-3.5 px-4 text-slate-500">Signed departmental resolution statement</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Operational Lifecycle Pipeline */}
      <section id="lifecycle-protocol" className="py-16 bg-white border-b border-slate-200 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              End-to-End Operational Pipeline
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              How complaints move from raw citizen submissions to verified resolution or leadership escalation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs font-mono font-bold text-slate-400 mb-2">
                STAGE 01
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Citizen Geotag & Intake
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Complaint submitted with photographs and device coordinates. Device EXIF data is validated,
                and private phone numbers and personal names are partitioned behind Row Level Security.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs font-mono font-bold text-slate-400 mb-2">
                STAGE 02
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                PostGIS Ray-Casting
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Spatial point-in-polygon algorithms resolve coordinates to registered municipal ward boundaries.
                Unassigned coordinates automatically route to the Administrative Review Queue.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs font-mono font-bold text-slate-400 mb-2">
                STAGE 03
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Dispatch & SLA Clock
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Active routing rules assign the ticket to the responsible field officer and start
                the category-specific resolution clock. Duplicate reports within 50 meters merge into one tracked issue.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs font-mono font-bold text-slate-400 mb-2">
                STAGE 04
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Verified Closure or Escalation
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Officers submit rectification photographs to close tickets. If a timer reaches zero,
                an idempotent server cron automatically promotes ticket visibility to Supervisors and Commissioners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ward Operations & Coverage Matrix (Concrete Municipal Data) */}
      <section id="system-architecture" className="py-16 bg-slate-50 border-b border-slate-200 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Registered Municipal Ward Coverage
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Active polygon boundaries monitored for automated dispatch and field compliance.
              </p>
            </div>
            <Link href="/public/map">
              <Button variant="outline" size="sm" className="font-semibold text-xs">
                Open Full Interactive Ward Map
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <span className="text-[11px] font-mono font-bold text-slate-500 block">
                WARD 101
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-1">
                Malleshwaram
              </h4>
              <p className="text-xs text-slate-500 mt-2">
                North Zone • 4.2 km²
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-semibold">Active Dispatch</span>
                <span className="font-mono text-slate-600">PWD / SWM</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <span className="text-[11px] font-mono font-bold text-slate-500 block">
                WARD 102
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-1">
                Indiranagar
              </h4>
              <p className="text-xs text-slate-500 mt-2">
                East Zone • 3.8 km²
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-semibold">Active Dispatch</span>
                <span className="font-mono text-slate-600">PWD / BESCOM</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <span className="text-[11px] font-mono font-bold text-slate-500 block">
                WARD 103
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-1">
                Koramangala
              </h4>
              <p className="text-xs text-slate-500 mt-2">
                South Zone • 5.1 km²
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-semibold">Active Dispatch</span>
                <span className="font-mono text-slate-600">BWSSB / PWD</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <span className="text-[11px] font-mono font-bold text-slate-500 block">
                WARD 104
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-1">
                Jayanagar
              </h4>
              <p className="text-xs text-slate-500 mt-2">
                South Zone • 4.9 km²
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-semibold">Active Dispatch</span>
                <span className="font-mono text-slate-600">SWM / PWD</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <span className="text-[11px] font-mono font-bold text-slate-500 block">
                WARD 105
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-1">
                Whitefield
              </h4>
              <p className="text-xs text-slate-500 mt-2">
                Mahadevapura • 7.4 km²
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-semibold">Active Dispatch</span>
                <span className="font-mono text-slate-600">PWD / BWSSB</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Municipal Accountability Standard Section: Solid Dark, Clean Borders (Zero Glassmorphism) */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-8 sm:p-12">
            <div className="max-w-3xl space-y-4">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                Uncompromising Municipal Accountability
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                In traditional municipal portals, complaints can be silently cancelled or reset when
                jurisdiction transfers between departments. CIVOARA records immutable ownership segments
                for every ticket. Department reorganizations and officer transfers preserve elapsed SLA budgets,
                guaranteeing that historical delays cannot be erased.
              </p>

              <div className="pt-4 flex flex-wrap gap-3 items-center">
                <Link href="/report">
                  <Button variant="primary" size="lg" className="px-6 font-bold">
                    File a Complaint Now
                  </Button>
                </Link>
                <Link href="/public/performance">
                  <Button variant="outline-dark" size="lg" className="px-6 font-semibold">
                    Inspect Department Performance
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
