"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronRight,
  Columns3,
  LayoutList,
  MapPin,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import LoanAdvisorDashboard from "@/components/advisor/LoanAdvisorDashboard";
import BackofficeLayout from "@/components/layout/BackofficeLayout";
import NotificationSummaryModal from "@/components/notifications/NotificationSummaryModal";
import { useAuth } from "@/hooks/useAuth";
import { INITIAL_APPLICATIONS } from "@/mocks/applications";
import type { Application } from "@/types/application";

type DashboardView = "LIST" | "FLOW";

type WorkStage =
  | "FOLLOW_UP"
  | "READY_REVIEW"
  | "EVALUATION";

const ONBOARDING_TOTAL_STEPS = 6;

function createMockApplication(
  base: Application,
  options: {
    id: string;
    code: string;
    firstName: string;
    lastName: string;
    identityNumber: string;
    city: string;
    currentStep:
      | "PERSONAL_DATA"
      | "EMPLOYMENT"
      | "FINANCIAL_INFORMATION"
      | "LOAN_SIMULATION"
      | "DOCUMENTS";
    completedStepCodes: string[];
    progress: number;
    nextAction: string;
  },
): Application {
  return {
    ...base,
    id: options.id,
    code: options.code,
    applicant: {
      ...base.applicant,
      firstName: options.firstName,
      lastName: options.lastName,
      fullName: `${options.firstName} ${options.lastName}`,
      identityNumber: options.identityNumber,
      city: options.city,
    },
    progress: options.progress,
    nextAction: options.nextAction,
    onboarding: {
      ...base.onboarding,
      currentStep: options.currentStep,
      currentStepLabel:
        base.onboarding.steps.find(
          (step) => step.code === options.currentStep,
        )?.label ?? "Onboarding",
      progress: options.progress,
      responsible: "CLIENT",
      state: "WAITING_CLIENT",
      steps: base.onboarding.steps.map((step) => {
        const completed =
          options.completedStepCodes.includes(step.code);

        const current = step.code === options.currentStep;

        if (completed) {
          return {
            ...step,
            status: "COMPLETED",
            progress: 100,
            responsible: "NONE",
          };
        }

        if (current) {
          return {
            ...step,
            status: "IN_PROGRESS",
            progress: 0,
            responsible: "CLIENT",
          };
        }

        return {
          ...step,
          status: "NOT_STARTED",
          progress: 0,
          responsible: "NONE",
          completedFields: [],
          pendingFields: [],
          lastCompletedField: null,
          completedAt: null,
        };
      }),
    },
  };
}

function getCompletedSteps(application: Application) {
  return application.onboarding.steps.filter(
    (step) => step.status === "COMPLETED",
  ).length;
}

function hasCompletedOnboarding(application: Application) {
  return (
    getCompletedSteps(application) >= ONBOARDING_TOTAL_STEPS ||
    application.onboarding.progress >= 100
  );
}

function getWorkStage(application: Application): WorkStage {
  if (
    application.status === "PREAPPROVED" ||
    application.status === "COMPLEMENTARY_DOCUMENTATION" ||
    application.status === "FORMALIZATION"
  ) {
    return "EVALUATION";
  }

  if (hasCompletedOnboarding(application)) {
    return "READY_REVIEW";
  }

  return "FOLLOW_UP";
}

function getStageLabel(stage: WorkStage) {
  switch (stage) {
    case "FOLLOW_UP":
      return "En seguimiento";
    case "READY_REVIEW":
      return "Listo para revisar";
    case "EVALUATION":
      return "En evaluación";
  }
}

function getStageDescription(stage: WorkStage) {
  switch (stage) {
    case "FOLLOW_UP":
      return "Esperando al cliente";
    case "READY_REVIEW":
      return "Requiere tu atención";
    case "EVALUATION":
      return "Expediente enviado";
  }
}

function getStageClasses(stage: WorkStage) {
  switch (stage) {
    case "FOLLOW_UP":
      return "bg-[#EAF7FF] text-[#1B5BB6]";
    case "READY_REVIEW":
      return "bg-[#FFF4E5] text-[#B76000]";
    case "EVALUATION":
      return "bg-[#ECF8F3] text-[#167454]";
  }
}

function ProgressDots({
  completed,
}: {
  completed: number;
}) {
  const currentIndex =
    completed >= ONBOARDING_TOTAL_STEPS ? -1 : completed;

  return (
    <div className="flex items-center">
      {Array.from({ length: ONBOARDING_TOTAL_STEPS }).map(
        (_, index) => {
          const isCompleted = index < completed;
          const isCurrent = index === currentIndex;
          const isLast =
            index === ONBOARDING_TOTAL_STEPS - 1;

          return (
            <div
              key={index}
              className="flex items-center"
            >
              <span
                aria-hidden="true"
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-[12px] font-bold transition-colors",
                  isCompleted || isCurrent
                    ? "border-primary bg-black text-white"
                    : "border-[#C9D1DD] bg-white text-[#9AA3B2]",
                ].join(" ")}
              >
                {isCompleted ? (
                  <Check
                    aria-hidden="true"
                    size={14}
                    strokeWidth={2.4}
                  />
                ) : (
                  <span>{index + 1}</span>
                )}
              </span>

              {!isLast ? (
                <span
                  aria-hidden="true"
                  className="h-[2px] w-6 bg-[#D7DEE8]"
                />
              ) : null}
            </div>
          );
        },
      )}
    </div>
  );
}

function WorkSummaryButton({
  active,
  count,
  label,
  onClick,
}: {
  active: boolean;
  count: number;
  label: string;
  onClick: () => void;
  emphasis?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex h-12 items-center gap-3 rounded-xl px-4 text-left transition-colors",
        active
          ? "bg-primary text-white"
          : "text-admin-text hover:bg-primary hover:text-white",
      ].join(" ")}
    >
      <span className="whitespace-nowrap text-sm font-semibold">
        {label}
      </span>

      <span
        className={[
          "inline-flex h-6 min-w-6 items-center justify-center rounded-lg px-1.5 text-[11px] font-bold transition-colors",
          active
            ? "bg-white/20 text-white"
            : "bg-admin-surface-soft text-admin-text group-hover:bg-white/20 group-hover:text-white",
        ].join(" ")}
      >
        {count}
      </span>
    </button>
  );
}

function ClientApplicationCard({
  application,
}: {
  application: Application;
}) {
  const completedSteps = Math.min(
    getCompletedSteps(application),
    ONBOARDING_TOTAL_STEPS,
  );

  const stage = getWorkStage(application);
  const onboardingCompleted =
    stage !== "FOLLOW_UP";

  return (
    <article className="overflow-hidden rounded-2xl border border-admin-border bg-white transition-[border-color,background-color] duration-150 ease-out hover:border-primary hover:bg-[#F3FAFE]">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-base font-bold tracking-[-0.01em] text-admin-text">
                {application.applicant.fullName}
              </h3>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-admin-text-soft">
              <span>
                CI {application.applicant.identityNumber}
              </span>

              <span
                aria-hidden="true"
                className="text-admin-border"
              >
                •
              </span>

              <span className="inline-flex items-center gap-1">
                <MapPin
                  aria-hidden="true"
                  size={13}
                  strokeWidth={1.8}
                />
                {application.applicant.city}
              </span>

              <span
                aria-hidden="true"
                className="text-admin-border"
              >
                •
              </span>

              <span>{application.code}</span>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">

              <div>
                <div className="flex items-center gap-3">
                  <ProgressDots
                    completed={completedSteps}
                  />

                  <span className="text-xs font-semibold text-admin-text-soft">
                    {completedSteps} de {ONBOARDING_TOTAL_STEPS}
                  </span>
                </div>

                <p className="mt-1.5 text-[11px] text-admin-text-muted">
                  {onboardingCompleted
                    ? "Todos los pasos fueron completados"
                    : `${application.onboarding.progress}% del proceso`}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:w-[320px]">
            <div
              className={[
                "rounded-xl border p-4",
                stage === "EVALUATION"
                  ? "border-[#CDE9DE] bg-[#F7FCFA]"
                  : "border-primary bg-primary text-white hover:border-primary-dark hover:bg-primary-dark",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div
                  className={[
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    stage === "READY_REVIEW"
                      ? "bg-white/20 text-white"
                      : stage === "EVALUATION"
                        ? "bg-[#E4F5EE] text-[#167454]"
                        : "bg-white/20 text-white",
                  ].join(" ")}
                >
                  {stage !== "EVALUATION" ? (
                    <AlertTriangle
                      aria-hidden="true"
                      size={15}
                      strokeWidth={1.8}
                    />
                  ) : (
                    <Check
                      aria-hidden="true"
                      size={15}
                      strokeWidth={2}
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <p
                    className={[
                      "text-[11px] font-medium",
                      stage === "EVALUATION"
                        ? "text-admin-text-muted"
                        : "text-white/75",
                    ].join(" ")}
                  >
                    {getStageDescription(stage)}
                  </p>

                  <p
                    className={[
                      "mt-1 text-sm font-semibold leading-5",
                      "text-white",
                    ].join(" ")}
                  >
                    {application.nextAction}
                  </p>
                </div>
              </div>
            </div>

            <Link
              href={`/solicitudes/${application.id}`}
              className={[
                "mt-3 inline-flex h-11 w-full items-center justify-between rounded-xl px-4 text-sm font-bold transition-colors",
                "bg-ink text-white hover:bg-primary-dark active:scale-[0.99]",
              ].join(" ")}
            >
              <span>
                {stage === "READY_REVIEW"
                  ? "Revisar solicitud"
                  : "Ver cliente"}
              </span>

              <ArrowRight
                aria-hidden="true"
                size={16}
                strokeWidth={1.8}
              />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function FlowColumn({
  title,
  description,
  applications,
  stage,
}: {
  title: string;
  description: string;
  applications: Application[];
  stage: WorkStage;
}) {
  return (
    <section className="min-w-[300px] flex-1 rounded-2xl border border-admin-border bg-[#F9FAFB] p-3">
      <div className="flex items-start justify-between gap-3 px-2 py-2">
        <div>
          <h3 className="text-sm font-bold text-admin-text">
            {title}
          </h3>

          <p className="mt-1 text-[11px] leading-4 text-admin-text-soft">
            {description}
          </p>
        </div>

        <span
          className={[
            "inline-flex h-7 min-w-7 items-center justify-center rounded-lg px-2 text-xs font-bold",
            getStageClasses(stage),
          ].join(" ")}
        >
          {applications.length}
        </span>
      </div>

      <div className="mt-2 space-y-2.5">
        {applications.map((application) => {
          const completedSteps = Math.min(
            getCompletedSteps(application),
            ONBOARDING_TOTAL_STEPS,
          );

          return (
            <Link
              key={application.id}
              href={`/solicitudes/${application.id}`}
              className="block rounded-xl border border-admin-border bg-white p-4 transition-colors hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-admin-text">
                    {application.applicant.fullName}
                  </p>

                  <p className="mt-1 text-[11px] text-admin-text-soft">
                    CI {application.applicant.identityNumber}
                  </p>
                </div>

                <ChevronRight
                  aria-hidden="true"
                  size={16}
                  className="shrink-0 text-admin-text-muted"
                />
              </div>

              <div className="mt-4">
                <p className="text-[10px] font-medium text-admin-text-muted">
                  {stage === "FOLLOW_UP"
                    ? application.onboarding.currentStepLabel
                    : getStageDescription(stage)}
                </p>

                <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-admin-text">
                  {application.nextAction}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <ProgressDots completed={completedSteps} />

                <span className="text-[11px] font-semibold text-admin-text-soft">
                  {completedSteps}/{ONBOARDING_TOTAL_STEPS}
                </span>
              </div>
            </Link>
          );
        })}

        {applications.length === 0 ? (
          <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-admin-border bg-white p-5 text-center">
            <p className="text-xs text-admin-text-muted">
              No hay clientes en esta etapa.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const [loginSummaryOpen, setLoginSummaryOpen] =
    useState(false);

  const [dashboardView, setDashboardView] =
    useState<DashboardView>("LIST");

  const [activeStage, setActiveStage] =
    useState<WorkStage>("FOLLOW_UP");

  useEffect(() => {
    if (user?.id !== "usr-jhoseline") {
      return;
    }

    const shouldShow =
      window.sessionStorage.getItem(
        "kivo-show-login-summary",
      );

    if (shouldShow !== "1") {
      return;
    }

    window.sessionStorage.removeItem(
      "kivo-show-login-summary",
    );

    const timeoutId = window.setTimeout(() => {
      setLoginSummaryOpen(true);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [user]);

  const baseApplication = INITIAL_APPLICATIONS.find(
    (item) => item.id === "app-001",
  );

  const applications = useMemo(() => {
    if (!baseApplication) {
      return [];
    }

    return [
      baseApplication,

      createMockApplication(baseApplication, {
        id: "app-002",
        code: "KIV-2026-002",
        firstName: "Mariela",
        lastName: "Condori",
        identityNumber: "6842157",
        city: "La Paz",
        currentStep: "EMPLOYMENT",
        completedStepCodes: ["PERSONAL_DATA"],
        progress: 10,
        nextAction: "Completar actividad laboral",
      }),

      createMockApplication(baseApplication, {
        id: "app-003",
        code: "KIV-2026-003",
        firstName: "Diego",
        lastName: "Mamani",
        identityNumber: "7345218",
        city: "El Alto",
        currentStep: "FINANCIAL_INFORMATION",
        completedStepCodes: [
          "PERSONAL_DATA",
          "EMPLOYMENT",
        ],
        progress: 20,
        nextAction: "Completar información financiera",
      }),

      createMockApplication(baseApplication, {
        id: "app-004",
        code: "KIV-2026-004",
        firstName: "Carla",
        lastName: "Flores",
        identityNumber: "6958741",
        city: "La Paz",
        currentStep: "LOAN_SIMULATION",
        completedStepCodes: [
          "PERSONAL_DATA",
          "EMPLOYMENT",
          "FINANCIAL_INFORMATION",
        ],
        progress: 30,
        nextAction: "Elegir las condiciones del préstamo",
      }),

      createMockApplication(baseApplication, {
        id: "app-005",
        code: "KIV-2026-005",
        firstName: "Luis",
        lastName: "Quispe",
        identityNumber: "7214589",
        city: "El Alto",
        currentStep: "DOCUMENTS",
        completedStepCodes:
          baseApplication.onboarding.steps.map(
            (step) => step.code,
          ),
        progress: 100,
        nextAction:
          "Revisar datos y documentos para continuar",
      }),

      createMockApplication(baseApplication, {
        id: "app-006",
        code: "KIV-2026-006",
        firstName: "Paola",
        lastName: "Vargas",
        identityNumber: "7482365",
        city: "La Paz",
        currentStep: "DOCUMENTS",
        completedStepCodes:
          baseApplication.onboarding.steps.map(
            (step) => step.code,
          ),
        progress: 100,
        nextAction:
          "Revisar datos y documentos para continuar",
      }),
    ];
  }, [baseApplication]);

  if (user?.role === "ASESOR_PRESTAMOS") {
    return <LoanAdvisorDashboard />;
  }

  if (!baseApplication) {
    return (
      <BackofficeLayout
        title="Tablero"
        description="Gestión de Clientes"
      >
        <div className="rounded-2xl border border-admin-border bg-white p-8">
          <p className="text-sm text-admin-text-soft">
            No se encontraron solicitudes.
          </p>
        </div>
      </BackofficeLayout>
    );
  }

  const followUpApplications = applications.filter(
    (application) =>
      getWorkStage(application) === "FOLLOW_UP",
  );

  const readyReviewApplications = applications.filter(
    (application) =>
      getWorkStage(application) === "READY_REVIEW",
  );

  const evaluationApplications = applications.filter(
    (application) =>
      getWorkStage(application) === "EVALUATION",
  );

  const activeApplications =
    activeStage === "FOLLOW_UP"
      ? followUpApplications
      : activeStage === "READY_REVIEW"
        ? readyReviewApplications
        : evaluationApplications;

  const firstName =
    user?.firstName?.trim() || "Jhoselinne";

  return (
    <BackofficeLayout
      title="Tablero"
      description="Gestión de Clientes"
    >
      <div className="mx-auto max-w-[1440px]">
        <section>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[760px]">
              <div className="flex items-center gap-3">
                <span className="h-5 w-1 rounded-full bg-primary" />

                <p className="text-xs font-semibold text-primary-dark">
                  Gestión de Clientes
                </p>
              </div>

              <h1 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-admin-text sm:text-[28px]">
                Buenos días, {firstName}
              </h1>

              <p className="mt-2 text-sm leading-6 text-admin-text-soft">
                Tienes{" "}
                <span className="font-semibold text-admin-text">
                  {followUpApplications.length} clientes en seguimiento
                </span>{" "}
                y{" "}
                <span className="font-semibold text-admin-text">
                  {readyReviewApplications.length} listos para revisar
                </span>
                .
              </p>
            </div>

          </div>

          <div className="mt-7 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="inline-flex flex-wrap gap-1 rounded-2xl border border-admin-border bg-white p-1.5">
              <WorkSummaryButton
                active={activeStage === "FOLLOW_UP"}
                count={followUpApplications.length}
                label="Seguimiento"
                onClick={() =>
                  setActiveStage("FOLLOW_UP")
                }
              />

              <WorkSummaryButton
                active={activeStage === "READY_REVIEW"}
                count={readyReviewApplications.length}
                label="Por revisar"
                onClick={() =>
                  setActiveStage("READY_REVIEW")
                }
              />

              <WorkSummaryButton
                active={activeStage === "EVALUATION"}
                count={evaluationApplications.length}
                label="En evaluación"
                emphasis
                onClick={() =>
                  setActiveStage("EVALUATION")
                }
              />
            </div>


          </div>
        </section>

        <div className="my-6 h-px bg-admin-border" />

        {dashboardView === "LIST" ? (
          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-admin-text">
                  {activeStage === "FOLLOW_UP"
                    ? "Clientes en seguimiento"
                    : activeStage === "READY_REVIEW"
                      ? "Listos para tu revisión"
                      : "En proceso de evaluación"}
                </h2>

                <p className="mt-1 text-xs text-admin-text-soft">
                  {activeStage === "FOLLOW_UP"
                    ? "Clientes que todavía están completando su solicitud."
                    : activeStage === "READY_REVIEW"
                      ? "Clientes que terminaron el onboarding y necesitan tu validación."
                      : "Solicitudes que ya continuaron a la siguiente etapa."}
                </p>
              </div>

              <span className="shrink-0 text-xs font-semibold text-admin-text-muted">
                {activeApplications.length}{" "}
                {activeApplications.length === 1
                  ? "cliente"
                  : "clientes"}
              </span>
            </div>

            {activeApplications.length > 0 ? (
              <div className="space-y-3">
                {activeApplications.map((application) => (
                  <ClientApplicationCard
                    key={application.id}
                    application={application}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-admin-border bg-white px-6 py-12 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-admin-surface-soft text-admin-text-muted">
                  <Check
                    aria-hidden="true"
                    size={18}
                    strokeWidth={1.8}
                  />
                </div>

                <p className="mt-3 text-sm font-semibold text-admin-text">
                  No tienes clientes aquí
                </p>

                <p className="mt-1 text-xs text-admin-text-soft">
                  Cuando una solicitud llegue a esta etapa,
                  aparecerá automáticamente.
                </p>
              </div>
            )}
          </section>
        ) : (
          <section className="overflow-x-auto pb-3">
            <div className="flex min-w-[980px] gap-4">
              <FlowColumn
                title="Esperando al cliente"
                description="Continúan completando su solicitud."
                applications={followUpApplications}
                stage="FOLLOW_UP"
              />

              <FlowColumn
                title="Listos para revisar"
                description="Terminaron los 6 pasos y necesitan tu validación."
                applications={readyReviewApplications}
                stage="READY_REVIEW"
              />

              <FlowColumn
                title="En evaluación"
                description="Ya continuaron a la siguiente etapa."
                applications={evaluationApplications}
                stage="EVALUATION"
              />
            </div>
          </section>
        )}
      </div>

      <NotificationSummaryModal
        open={loginSummaryOpen}
        onClose={() => setLoginSummaryOpen(false)}
        firstName={firstName}
      />
    </BackofficeLayout>
  );
}
