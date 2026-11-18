import React from "react";
import Link from "next/link";
import { Hammer, Clock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export interface PlaceholderModuleProps {
  moduleName: string;
  plannedPhase: string;
  description: string;
  features: string[];
  backLink?: {
    href: string;
    label: string;
  };
}

export const PlaceholderModule: React.FC<PlaceholderModuleProps> = ({
  moduleName,
  plannedPhase,
  description,
  features,
  backLink = { href: "/", label: "Return to Home" },
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="amber" size="sm">
              <Clock className="w-3 h-3 inline mr-1" />
              Under Active Development
            </Badge>
            <Badge variant="slate" size="sm">
              {plannedPhase}
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {moduleName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            {description}
          </p>
        </div>

        <div>
          <Link href={backLink.href}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              {backLink.label}
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>Module Specification & Planned Capabilities</CardTitle>
              <CardDescription>
                Backend migrations and interactive business logic for this module
                will activate according to the development roadmap.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-3">
              Planned Deliverables in {plannedPhase}:
            </h4>
            <ul className="space-y-2">
              {features.map((feature, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-slate-700 font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-slate-500 font-normal">
            Note: All UI controls are wired to strict TypeScript types. Fake data is
            not simulated to ensure compliance with municipal data standards.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
