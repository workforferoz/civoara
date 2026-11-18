"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeVariant?: "slate" | "indigo" | "amber" | "rose";
}

export interface SidebarProps {
  title: string;
  subtitle?: string;
  items: NavItem[];
  footerContent?: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  title,
  subtitle,
  items,
  footerContent,
}) => {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 rounded-xl border border-slate-200 bg-white flex flex-col shadow-2xs overflow-hidden">
      {/* Sidebar Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors duration-75 ${
                isActive
                  ? "bg-slate-900 text-white font-bold"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`shrink-0 ${isActive ? "text-white" : "text-slate-500"}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isActive
                      ? "bg-slate-800 text-white border border-slate-700"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      {footerContent && (
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
          {footerContent}
        </div>
      )}
    </aside>
  );
};
