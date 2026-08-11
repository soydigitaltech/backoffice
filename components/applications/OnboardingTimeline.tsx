import {
  AlertTriangle,
  Check,
} from "lucide-react";

import type {
  OnboardingStepCode,
  OnboardingStepProgress,
  OnboardingStepStatus,
} from "@/types/application";

type OnboardingTimelineProps = {
  steps: OnboardingStepProgress[];
  compact?: boolean;
};

const visibleSteps: {
  code: OnboardingStepCode;
  label: string;
  shortLabel: string;
}[] = [
  {
    code: "PERSONAL_DATA",
    label: "Datos personales",
    shortLabel: "Datos",
  },
  {
    code: "EMPLOYMENT",
    label: "Actividad laboral",
    shortLabel: "Trabajo",
  },
  {
    code: "FINANCIAL_INFORMATION",
    label: "Información financiera",
    shortLabel: "Finanzas",
  },
  {
    code: "LOAN_SIMULATION",
    label: "Simulación",
    shortLabel: "Simulación",
  },
  {
    code: "DOCUMENTS",
    label: "Documentos",
    shortLabel: "Documentos",
  },
  {
    code: "SEGIP",
    label: "Validación SEGIP",
    shortLabel: "SEGIP",
  },
  {
    code: "SCORING",
    label: "Scoring",
    shortLabel: "Scoring",
  },
  {
    code: "FORMALIZATION",
    label: "Formalización",
    shortLabel: "Formalización",
  },
];

const circleClasses: Record<OnboardingStepStatus, string> = {
  COMPLETED:
    "border-ink bg-ink text-white ring-2 ring-primary/20",
  IN_PROGRESS:
    "border-admin-accent bg-admin-accent text-ink ring-4 ring-admin-accent-soft",
  BLOCKED:
    "border-error bg-error text-white ring-4 ring-error-bg",
  NOT_STARTED:
    "border-admin-border-strong bg-white text-admin-text-muted",
};

const connectorClasses: Record<OnboardingStepStatus, string> = {
  COMPLETED: "bg-ink",
  IN_PROGRESS: "bg-admin-accent",
  BLOCKED: "bg-error",
  NOT_STARTED: "bg-admin-border",
};

function getStepStatus(
  steps: OnboardingStepProgress[],
  code: OnboardingStepCode,
): OnboardingStepStatus {
  return (
    steps.find((step) => step.code === code)?.status ??
    "NOT_STARTED"
  );
}

function getStepProgress(
  steps: OnboardingStepProgress[],
  code: OnboardingStepCode,
) {
  return steps.find((step) => step.code === code)?.progress ?? 0;
}

export default function OnboardingTimeline({
  steps,
  compact = false,
}: OnboardingTimelineProps) {
  return (
    <div className="min-w-[780px]">
      <div className="flex items-start">
        {visibleSteps.map((item, index) => {
          const status = getStepStatus(steps, item.code);
          const progress = getStepProgress(steps, item.code);
          const isLast = index === visibleSteps.length - 1;

          return (
            <div
              key={item.code}
              className="relative flex min-w-0 flex-1 flex-col items-center"
            >
              {!isLast ? (
                <div
                  aria-hidden="true"
                  className={[
                    "absolute left-1/2 top-[19px] h-[2px] w-full",
                    connectorClasses[status],
                  ].join(" ")}
                />
              ) : null}

              <div
                title={`${item.label}: ${progress}%`}
                className={[
                  "relative z-10 flex shrink-0 items-center justify-center rounded-full border-2 font-bold transition-transform",
                  compact
                    ? "h-9 w-9 text-xs"
                    : "h-10 w-10 text-sm",
                  circleClasses[status],
                ].join(" ")}
              >
                {status === "COMPLETED" ? (
                  <Check
                    aria-hidden="true"
                    size={18}
                    strokeWidth={2.6}
                  />
                ) : null}

                {status === "BLOCKED" ? (
                  <AlertTriangle
                    aria-hidden="true"
                    size={17}
                    strokeWidth={2.2}
                  />
                ) : null}

                {status === "IN_PROGRESS" ? (
                  <span>{index + 1}</span>
                ) : null}

                {status === "NOT_STARTED" ? (
                  <span>{index + 1}</span>
                ) : null}
              </div>

              <div className="mt-2 min-w-0 px-1 text-center">
                <p
                  className={[
                    "whitespace-nowrap font-semibold",
                    compact ? "text-[10px]" : "text-[11px]",
                    status === "COMPLETED"
                      ? "text-admin-text"
                      : "",
                    status === "IN_PROGRESS"
                      ? "text-accent-dark"
                      : "",
                    status === "BLOCKED"
                      ? "text-error"
                      : "",
                    status === "NOT_STARTED"
                      ? "text-admin-text-muted"
                      : "",
                  ].join(" ")}
                >
                  {item.shortLabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
