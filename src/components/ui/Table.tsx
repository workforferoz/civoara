import React from "react";

export const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className = "", ...props }, ref) => (
  <div className="relative w-full overflow-auto rounded-lg border border-slate-200 bg-white">
    <table
      ref={ref}
      className={`w-full caption-bottom text-sm text-left ${className}`}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className = "", ...props }, ref) => (
  <thead
    ref={ref}
    className={`bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-600 ${className}`}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className = "", ...props }, ref) => (
  <tbody
    ref={ref}
    className={`divide-y divide-slate-100 bg-white ${className}`}
    {...props}
  />
));
TableBody.displayName = "TableBody";

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className = "", ...props }, ref) => (
  <tr
    ref={ref}
    className={`transition-colors hover:bg-slate-50/80 data-[state=selected]:bg-slate-100 ${className}`}
    {...props}
  />
));
TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className = "", ...props }, ref) => (
  <th
    ref={ref}
    className={`h-10 px-4 py-3 align-middle font-semibold text-slate-700 [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  />
));
TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className = "", ...props }, ref) => (
  <td
    ref={ref}
    className={`p-4 align-middle text-slate-800 [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  />
));
TableCell.displayName = "TableCell";

export const TableEmpty = ({
  message = "No records found",
  colSpan = 5,
}: {
  message?: string;
  colSpan?: number;
}) => (
  <tr>
    <td
      colSpan={colSpan}
      className="p-8 text-center text-sm text-slate-500 font-medium"
    >
      <div className="flex flex-col items-center justify-center space-y-1">
        <span>{message}</span>
        <span className="text-xs text-slate-400">
          Try adjusting filters or check back later.
        </span>
      </div>
    </td>
  </tr>
);
