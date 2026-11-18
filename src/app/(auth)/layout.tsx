import React from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-700 text-white shadow-sm transition-transform group-hover:scale-105">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black tracking-wider text-slate-900 leading-none">
            CIVOARA
          </span>
        </Link>
        <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-indigo-600">
          Civic Accountability Platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-200">
          {children}
        </div>
      </div>
    </div>
  );
}
