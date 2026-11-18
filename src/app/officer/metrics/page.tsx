import React from "react";
import { PlaceholderModule } from "@/components/ui/PlaceholderModule";

export default function OfficerMetricsPage() {
  return (
    <PlaceholderModule
      moduleName="Officer SLA Compliance & Individual Performance"
      plannedPhase="PART 05 : SLA TIMER AND ESCALATION ENGINE"
      description="Personal operational metrics tracking assigned vs resolved tasks, average completion duration, and zero-fault SLA compliance percentage."
      features={[
        "Individual SLA compliance score calculated over rolling 30/90-day intervals.",
        "Categorical breakdown of resolution speeds.",
        "Fair attribution: excluded time from previous departments after ward transfers.",
      ]}
      backLink={{ href: "/officer/tasks", label: "Worklist" }}
    />
  );
}
