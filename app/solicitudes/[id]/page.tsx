import { notFound } from "next/navigation";

import ApplicationDetailView from "@/components/applications/ApplicationDetailView";
import { INITIAL_APPLICATIONS } from "@/mocks/applications";

type ApplicationDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const { id } = await params;

  const application = INITIAL_APPLICATIONS.find(
    (item) => item.id === id,
  );

  if (!application) {
    notFound();
  }

  return <ApplicationDetailView application={application} />;
}
