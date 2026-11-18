import React from "react";

export type BadgeVariant =
  | "submitted"
  | "assigned"
  | "in_progress"
  | "escalated"
  | "resolved"
  | "overdue"
  | "closed"
  | "pending_review"
  | "slate"
  | "indigo"
  | "emerald"
  | "amber"
  | "rose"
  | "sky";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "slate",
  size = "md",
  dot = true,
  className = "",
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
    submitted: {
      container: "bg-blue-50 text-blue-800 border-blue-200",
      dot: "bg-blue-600",
    },
    assigned: {
      container: "bg-indigo-50 text-indigo-800 border-indigo-200",
      dot: "bg-indigo-600",
    },
    in_progress: {
      container: "bg-amber-50 text-amber-800 border-amber-200",
      dot: "bg-amber-600",
    },
    escalated: {
      container: "bg-rose-50 text-rose-800 border-rose-200 font-bold",
      dot: "bg-rose-600",
    },
    resolved: {
      container: "bg-emerald-50 text-emerald-800 border-emerald-200",
      dot: "bg-emerald-600",
    },
    overdue: {
      container: "bg-red-50 text-red-800 border-red-200 font-bold",
      dot: "bg-red-600",
    },
    closed: {
      container: "bg-slate-100 text-slate-700 border-slate-200",
      dot: "bg-slate-500",
    },
    pending_review: {
      container: "bg-amber-50 text-amber-800 border-amber-200",
      dot: "bg-amber-600",
    },
    slate: {
      container: "bg-slate-100 text-slate-800 border-slate-200",
      dot: "bg-slate-500",
    },
    indigo: {
      container: "bg-indigo-50 text-indigo-800 border-indigo-200",
      dot: "bg-indigo-600",
    },
    emerald: {
      container: "bg-emerald-50 text-emerald-800 border-emerald-200",
      dot: "bg-emerald-600",
    },
    amber: {
      container: "bg-amber-50 text-amber-800 border-amber-200",
      dot: "bg-amber-600",
    },
    rose: {
      container: "bg-rose-50 text-rose-800 border-rose-200",
      dot: "bg-rose-600",
    },
    sky: {
      container: "bg-sky-50 text-sky-800 border-sky-200",
      dot: "bg-sky-600",
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.slate;
  const sizeClass = size === "sm" ? "px-1.5 py-0.5 text-[10px] gap-1" : "px-2 py-0.5 text-xs gap-1.5";

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-md uppercase tracking-wider ${currentVariant.container} ${sizeClass} ${className}`}
      {...props}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${currentVariant.dot}`} />}
      <span>{children}</span>
    </span>
  );
};
