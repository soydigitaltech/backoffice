import { Suspense } from "react";

import ApplicationsView from "@/components/applications/ApplicationsView";

export default function ApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-admin-text-soft">
          Cargando solicitudes...
        </div>
      }
    >
      <ApplicationsView />
    </Suspense>
  );
}
