import React from "react";
import { PlaceholderModule } from "@/components/ui/PlaceholderModule";

export default function AdminUsersPage() {
  return (
    <PlaceholderModule
      moduleName="Municipal Staff & Role-Based Access Control"
      plannedPhase="PART 02 : DATABASE, AUTHENTICATION AND AUTHORIZATION"
      description="Manage administrative permissions and officer assignments across roles: Citizen, Officer, Supervisor, Commissioner, and Administrator."
      features={[
        "Server-verified RBAC with PostgreSQL Row Level Security (RLS) enforcement.",
        "Prohibition against users self-modifying authorization claims.",
        "Department-level oversight assignment for supervisors and commissioners.",
        "Comprehensive staff activity audit trail.",
      ]}
      backLink={{ href: "/admin/routing", label: "Routing Rules" }}
    />
  );
}
