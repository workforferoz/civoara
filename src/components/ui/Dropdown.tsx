"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

export interface DropdownProps {
  label: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
  variant?: "outline" | "ghost" | "primary";
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  items,
  align = "right",
  className = "",
  variant = "outline",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const variantStyles = {
    outline: "border border-slate-300 bg-white hover:bg-slate-50 text-slate-700",
    ghost: "hover:bg-slate-100 text-slate-700",
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${variantStyles[variant]}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>{label}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute z-30 mt-1.5 w-52 rounded-lg border border-slate-200 bg-white py-1 shadow-lg focus:outline-none ${
            align === "right" ? "right-0" : "left-0"
          }`}
          role="menu"
        >
          {items.map((item) => (
            <button
              key={item.id}
              disabled={item.disabled}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3.5 py-2 text-xs font-medium transition-colors ${
                item.disabled
                  ? "cursor-not-allowed opacity-50 text-slate-400"
                  : item.destructive
                  ? "text-red-600 hover:bg-red-50"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
              role="menuitem"
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
