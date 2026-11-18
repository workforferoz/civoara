"use client";

import React from "react";
import {
  AlertTriangle,
  Trash2,
  Lightbulb,
  Droplets,
  HelpCircle,
  Clock,
} from "lucide-react";
import type { IssueCategory } from "@/types/database.types";

export interface CategoryOption {
  value: IssueCategory;
  label: string;
  description: string;
  slaHours: number;
  icon: React.ReactNode;
}

export const CATEGORIES: CategoryOption[] = [
  {
    value: "pothole",
    label: "Pothole & Road Defect",
    description: "Craters, road cave-ins, broken asphalt, or hazardous trenches.",
    slaHours: 48,
    icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
  },
  {
    value: "garbage",
    label: "Garbage & Waste",
    description: "Uncollected trash heaps, overflowing bins, or illegal dumping.",
    slaHours: 24,
    icon: <Trash2 className="w-5 h-5 text-rose-600" />,
  },
  {
    value: "broken_streetlight",
    label: "Broken Streetlight",
    description: "Dark streetlights, flickering fixtures, or exposed wiring.",
    slaHours: 72,
    icon: <Lightbulb className="w-5 h-5 text-indigo-600" />,
  },
  {
    value: "water_leakage",
    label: "Water Leakage & Sewage",
    description: "Main pipe bursts, clean water wastage, or sewage overflowing.",
    slaHours: 12,
    icon: <Droplets className="w-5 h-5 text-sky-600" />,
  },
  {
    value: "other",
    label: "Other Civic Problem",
    description: "Encroachments, fallen branches, damaged public signage, etc.",
    slaHours: 96,
    icon: <HelpCircle className="w-5 h-5 text-slate-600" />,
  },
];

export interface CategorySelectorProps {
  value: IssueCategory;
  onChange: (category: IssueCategory) => void;
  error?: string;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  onChange,
  error,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
        Civic Category <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CATEGORIES.map((cat) => {
          const isSelected = value === cat.value;
          return (
            <button
              type="button"
              key={cat.value}
              onClick={() => onChange(cat.value)}
              className={`flex flex-col text-left p-3.5 rounded-xl border transition-all text-xs ${
                isSelected
                  ? "border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-lg ${
                      isSelected ? "bg-white shadow-xs" : "bg-slate-100"
                    }`}
                  >
                    {cat.icon}
                  </div>
                  <span className="font-bold text-slate-900 text-xs">
                    {cat.label}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{cat.slaHours}h SLA</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {cat.description}
              </p>
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};
