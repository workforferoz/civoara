import React from "react";
import { PlaceholderModule } from "@/components/ui/PlaceholderModule";

export default function CitizenProfilePage() {
  return (
    <PlaceholderModule
      moduleName="Citizen Profile & Alert Preferences"
      plannedPhase="PART 02 : DATABASE, AUTHENTICATION AND AUTHORIZATION"
      description="Manage authenticated credentials, notification channels (email/SMS/in-app), and private profile information."
      features={[
        "Supabase Auth session management and password recovery.",
        "Role-based privilege inspection (enforcing immutable citizen role).",
        "Notification preference toggles for SLA updates and resolution alerts.",
      ]}
      backLink={{ href: "/citizen/dashboard", label: "Dashboard" }}
    />
  );
}
