"use client";

import LoanAdvisorEvaluationView from "@/components/advisor/LoanAdvisorEvaluationView";
import ApplicationDetailView from "@/components/applications/ApplicationDetailView";
import { useAuth } from "@/hooks/useAuth";
import type { Application } from "@/types/application";

type ApplicationDetailRoleViewProps = {
  application: Application;
};

export default function ApplicationDetailRoleView({
  application,
}: ApplicationDetailRoleViewProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (user?.role === "ASESOR_PRESTAMOS") {
    return (
      <LoanAdvisorEvaluationView
        application={application}
      />
    );
  }

  return (
    <ApplicationDetailView
      application={application}
    />
  );
}
