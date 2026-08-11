import {
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  FileWarning,
  Landmark,
  SearchCheck,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import {
  APPLICATION_STATUS_LABELS,
  type ApplicationStatus,
} from "@/types/application";

type ApplicationStatusBadgeProps = {
  status: ApplicationStatus;
  compact?: boolean;
};

const statusStyles: Record<
  ApplicationStatus,
  {
    container: string;
    icon: React.ReactNode;
  }
> = {
  PENDING_DOCUMENTATION: {
    container: "bg-warning-bg text-warning",
    icon: (
      <FileWarning
        aria-hidden="true"
        size={15}
        strokeWidth={1.8}
      />
    ),
  },

  DOCUMENT_REVIEW: {
    container: "bg-surface-blue text-primary-dark",
    icon: (
      <FileCheck2
        aria-hidden="true"
        size={15}
        strokeWidth={1.8}
      />
    ),
  },

  PENDING_SEGIP: {
    container: "bg-admin-accent-soft text-accent-dark",
    icon: (
      <ShieldCheck
        aria-hidden="true"
        size={15}
        strokeWidth={1.8}
      />
    ),
  },

  PENDING_SCORING: {
    container: "bg-surface-blue text-primary-dark",
    icon: (
      <SearchCheck
        aria-hidden="true"
        size={15}
        strokeWidth={1.8}
      />
    ),
  },

  SCORING_PROCESSED: {
    container: "bg-success-bg text-success",
    icon: (
      <CheckCircle2
        aria-hidden="true"
        size={15}
        strokeWidth={1.8}
      />
    ),
  },

  PREAPPROVED: {
    container: "bg-success-bg text-success",
    icon: (
      <CheckCircle2
        aria-hidden="true"
        size={15}
        strokeWidth={1.8}
      />
    ),
  },

  REJECTED: {
    container: "bg-error-bg text-error",
    icon: (
      <XCircle
        aria-hidden="true"
        size={15}
        strokeWidth={1.8}
      />
    ),
  },

  COMPLEMENTARY_DOCUMENTATION: {
    container: "bg-warning-bg text-warning",
    icon: (
      <AlertTriangle
        aria-hidden="true"
        size={15}
        strokeWidth={1.8}
      />
    ),
  },

  FORMALIZATION: {
    container: "bg-admin-surface-soft text-admin-text",
    icon: (
      <Landmark
        aria-hidden="true"
        size={15}
        strokeWidth={1.8}
      />
    ),
  },
};

export default function ApplicationStatusBadge({
  status,
  compact = false,
}: ApplicationStatusBadgeProps) {
  const styles = statusStyles[status];

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full font-bold",
        compact
          ? "px-2.5 py-1 text-[11px]"
          : "px-3 py-1.5 text-xs",
        styles.container,
      ].join(" ")}
    >
      {styles.icon}
      {APPLICATION_STATUS_LABELS[status]}
    </span>
  );
}
