"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Clock3,
  MapPin,
  Columns3,
  GripVertical,
  LayoutList,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import ApplicationStatusBadge from "@/components/applications/ApplicationStatusBadge";
import OnboardingTimeline from "@/components/applications/OnboardingTimeline";
import BackofficeLayout from "@/components/layout/BackofficeLayout";
import NotificationSummaryModal from "@/components/notifications/NotificationSummaryModal";
import LoanAdvisorDashboard from "@/components/advisor/LoanAdvisorDashboard";
import { useAuth } from "@/hooks/useAuth";
import { INITIAL_APPLICATIONS } from "@/mocks/applications";
import type { Application } from "@/types/application";


type DashboardView = "LIST" | "FLOW";
type DashboardGroup = "FOLLOW_UP" | "PRE_APPROVED";
type FollowUpFilter = "ALL" | "IN_PROGRESS" | "COMPLETED";

type GlobalApplicationStatus =
  | "NEW"
  | "REVIEW"
  | "APPROVED"
  | "ASSIGNED";

type BoardState = Record<
  GlobalApplicationStatus,
  string[]
>;

const BOARD_COLUMNS: {
  id: GlobalApplicationStatus;
  group: DashboardGroup;
  label: string;
  description: string;
  headerClass: string;
  countClass: string;
}[] = [
  {
    id: "NEW",
    group: "FOLLOW_UP",
    label: "Nuevas",
    description: "Ingresaron al tablero",
    headerClass: "bg-surface-blue",
    countClass: "bg-primary text-white",
  },
  {
    id: "REVIEW",
    group: "FOLLOW_UP",
    label: "En revisión",
    description: "Gestión de Clientes",
    headerClass: "bg-[#FFF7EB]",
    countClass: "bg-[#FE9806] text-white",
  },
  {
    id: "APPROVED",
    group: "PRE_APPROVED",
    label: "Pre aprobados",
    description: "Listos para continuar la gestión",
    headerClass: "bg-[#F0FBF7]",
    countClass: "bg-[#16855E] text-white",
  },
  {
    id: "ASSIGNED",
    group: "PRE_APPROVED",
    label: "Asignadas",
    description: "Con asesor responsable",
    headerClass: "bg-[#F8F1FF]",
    countClass: "bg-[#9003FD] text-white",
  },
];

function formatCurrency(value: number) {
  if (value <= 0) {
    return "Pendiente";
  }

  return new Intl.NumberFormat("es-BO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}


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

const ONBOARDING_TOTAL_STEPS = 6;

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

function ApplicationAccordionCard({
  application,
  open,
  onToggle,
}: {
  application: Application;
  open: boolean;
  onToggle: () => void;
}) {
  const completedSteps = getCompletedSteps(application);
  const onboardingCompleted = hasCompletedOnboarding(application);

  const initials = `${application.applicant.firstName.charAt(
    0,
  )}${application.applicant.lastName.charAt(0)}`.toUpperCase();

  return (
    <article
      className={[
        "overflow-hidden rounded-2xl border bg-white transition-all duration-200 ease-out",
        open
          ? "border-[#03AEFE]/45 shadow-[0_6px_24px_rgba(3,174,254,0.10)]"
          : "border-admin-border hover:border-[#03AEFE]/40 hover:shadow-[0_4px_18px_rgba(3,174,254,0.06)]",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onToggle}
        className={[
          "group flex w-full cursor-pointer items-center gap-4 p-5 text-left transition-all duration-200 ease-out sm:p-6",
          open
            ? "bg-[#DFF4FF]"
            : "hover:bg-[#EAF7FF]",
        ].join(" ")}
      >
        <div
          className={[
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-200 ease-out",
            open
              ? "bg-[#03AEFE] text-white shadow-sm"
              : "bg-surface-blue text-primary-dark group-hover:bg-[#03AEFE] group-hover:text-white",
          ].join(" ")}
        >
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-bold text-admin-text">
              {application.applicant.fullName}
            </h3>

            <ApplicationStatusBadge
              status={application.status}
              compact
            />

            {onboardingCompleted ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF8F2] px-2.5 py-1 text-[10px] font-bold text-[#16855E]">
                <Check aria-hidden="true" size={12} />
                Onboarding completado
              </span>
            ) : null}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-admin-text-soft">
            <span>{application.code}</span>
            <span>•</span>
            <span>CI {application.applicant.identityNumber}</span>
            <span>•</span>

            <span className="inline-flex items-center gap-1">
              <MapPin
                aria-hidden="true"
                size={13}
              />
              {application.applicant.city}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-primary-dark">
              {application.onboarding.currentStepLabel}
            </span>

            <span className="text-xs text-admin-text-muted">
              {application.onboarding.progress}% completado
            </span>
          </div>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <ChevronDown
            aria-hidden="true"
            size={20}
            className={[
              "transition-all duration-200 ease-out",
              open
                ? "rotate-180 text-[#1B5BB6]"
                : "text-admin-text-muted group-hover:translate-y-0.5 group-hover:text-[#1B5BB6]",
            ].join(" ")}
          />
        </div>
      </button>

      <div
        className={[
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
          open
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="overflow-hidden">
          <div className="border-t border-admin-border">
            <div
              className={[
                "p-5 transition-transform duration-300 ease-out sm:p-6",
                open ? "translate-y-0" : "-translate-y-1.5",
              ].join(" ")}
            >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl bg-surface-blue/35 px-4 py-3.5">
                <p className="text-[11px] font-medium text-admin-text-soft">
                  Monto solicitado
                </p>

                <p className="mt-1 text-[15px] font-semibold text-admin-text">
                  {formatCurrency(
                    application.loan.requestedAmount,
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-[#F0FBF7] px-4 py-3.5">
                <p className="text-[11px] font-medium text-admin-text-soft">
                  Ingreso mensual
                </p>

                <p className="mt-1 text-[15px] font-semibold text-admin-text">
                  {formatCurrency(
                    application.employment.monthlyNetIncome,
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-[#FFF7EB] px-4 py-3.5">
                <p className="text-[11px] font-medium text-admin-text-soft">
                  Actividad
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <BriefcaseBusiness
                    aria-hidden="true"
                    size={15}
                    className="text-[#FE9806]"
                  />

                  <p className="text-sm font-semibold text-admin-text">
                    {application.employment.companyOrActivity
                      ? application.employment.activityType ===
                        "SALARIED"
                        ? "Asalariado"
                        : "Independiente"
                      : "Pendiente"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-[#F8F1FF] px-4 py-3.5">
                <p className="text-[11px] font-medium text-admin-text-soft">
                  Avance
                </p>

                <div className="mt-1 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-admin-text">
                    {Math.min(completedSteps, ONBOARDING_TOTAL_STEPS)}/
                    {ONBOARDING_TOTAL_STEPS} pasos
                  </p>

                  <span className="text-sm font-bold text-[#9003FD]">
                    {application.onboarding.progress}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-admin-border pt-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-admin-text">
                    Proceso del onboarding
                  </p>

                  <p className="mt-1 text-xs text-admin-text-soft">
                    Etapa actual:{" "}
                    <span className="font-bold text-primary-dark">
                      {application.onboarding.currentStepLabel}
                    </span>
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 text-xs font-semibold text-admin-text-soft">
                  <Clock3
                    aria-hidden="true"
                    size={14}
                  />

                  {application.onboarding.progress}% completado
                </div>
              </div>

              <div className="mt-5 overflow-x-auto pb-2">
                <OnboardingTimeline
                  steps={application.onboarding.steps}
                  compact
                />
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-admin-border">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${application.onboarding.progress}%`,
                    }}
                  />
                </div>

                <span className="text-xs font-bold text-primary-dark">
                  {application.onboarding.progress}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-admin-border bg-admin-surface-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning-bg text-warning">
                {application.alerts.length > 0 ? (
                  <AlertTriangle
                    aria-hidden="true"
                    size={17}
                  />
                ) : (
                  <Check
                    aria-hidden="true"
                    size={17}
                  />
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-admin-text-soft">
                  Próxima acción
                </p>

                <p className="mt-1 text-sm font-bold text-admin-text">
                  {application.nextAction}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">


              <Link
                href={`/solicitudes/${application.id}`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ink px-5 text-sm font-bold leading-none text-white transition-colors hover:bg-primary-dark"
              >
                Ver solicitud

                <ArrowRight
                  aria-hidden="true"
                  size={16}
                />
              </Link>
            </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function ApplicationsFlowBoard({
  applications,
  group,
  followUpFilter,
}: {
  applications: Application[];
  group: DashboardGroup;
  followUpFilter: FollowUpFilter;
}) {
  const router = useRouter();

  const [draggedApplicationId, setDraggedApplicationId] =
    useState<string | null>(null);

  const filteredApplications = applications.filter(
    (application) => {
      if (group !== "FOLLOW_UP") {
        return true;
      }

      if (followUpFilter === "COMPLETED") {
        return hasCompletedOnboarding(application);
      }

      if (followUpFilter === "IN_PROGRESS") {
        return !hasCompletedOnboarding(application);
      }

      return true;
    },
  );

  const [board, setBoard] = useState<BoardState>(() => {
    const ids = filteredApplications.map(
      (application) => application.id,
    );

    if (
      group === "FOLLOW_UP" &&
      followUpFilter === "COMPLETED"
    ) {
      return {
        NEW: ids,
        REVIEW: [],
        APPROVED: [],
        ASSIGNED: [],
      };
    }

    if (group === "PRE_APPROVED") {
      return {
        NEW: [],
        REVIEW: [],
        APPROVED: ids.slice(0, Math.ceil(ids.length / 2)),
        ASSIGNED: ids.slice(Math.ceil(ids.length / 2)),
      };
    }

    return {
      NEW: ids.filter((_, index) => index % 2 === 0),
      REVIEW: ids.filter((_, index) => index % 2 !== 0),
      APPROVED: [],
      ASSIGNED: [],
    };
  });

  const getApplication = (id: string) =>
    filteredApplications.find(
      (application) => application.id === id,
    );

  const moveApplication = (
    applicationId: string,
    targetStatus: GlobalApplicationStatus,
  ) => {
    setBoard((current) => {
      const next: BoardState = {
        NEW: current.NEW.filter(
          (id) => id !== applicationId,
        ),
        REVIEW: current.REVIEW.filter(
          (id) => id !== applicationId,
        ),
        APPROVED: current.APPROVED.filter(
          (id) => id !== applicationId,
        ),
        ASSIGNED: current.ASSIGNED.filter(
          (id) => id !== applicationId,
        ),
      };

      next[targetStatus] = [
        ...next[targetStatus],
        applicationId,
      ];

      return next;
    });
  };

  const visibleColumns =
    group === "FOLLOW_UP"
      ? [
          {
            id: "NEW" as const,
            label:
              followUpFilter === "COMPLETED"
                ? "Onboarding completado"
                : "En seguimiento",
            description:
              followUpFilter === "COMPLETED"
                ? "Clientes que completaron los 6 pasos"
                : "Clientes avanzando en el onboarding",
            headerClass: "bg-surface-blue",
            countClass:
              "bg-[#03AEFE] text-white",
          },
          {
            id: "REVIEW" as const,
            label:
              followUpFilter === "COMPLETED"
                ? "Listos para evaluación"
                : "Requieren atención",
            description:
              followUpFilter === "COMPLETED"
                ? "Solicitudes listas para continuar"
                : "Casos que necesitan seguimiento",
            headerClass: "bg-[#FFF7EB]",
            countClass:
              "bg-[#FE9806] text-white",
          },
        ]
      : BOARD_COLUMNS.filter(
          (column) => column.group === group,
        );

  return (
    <section className="overflow-x-auto pb-3">
      <div className="grid min-w-[900px] grid-cols-2 gap-4">
        {visibleColumns.map((column) => {
          const columnApplications =
            board[column.id]
              .map((id) => getApplication(id))
              .filter(
                (
                  application,
                ): application is Application =>
                  Boolean(application),
              );

          return (
            <div
              key={column.id}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
              }}
              onDrop={(event) => {
                event.preventDefault();

                const applicationId =
                  event.dataTransfer.getData(
                    "text/application-id",
                  );

                if (!applicationId) {
                  return;
                }

                moveApplication(
                  applicationId,
                  column.id,
                );

                setDraggedApplicationId(null);
              }}
              className="min-h-[560px] rounded-2xl border border-admin-border bg-admin-page/40 p-3"
            >
              <div
                className={[
                  "rounded-2xl p-4",
                  column.headerClass,
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-admin-text">
                      {column.label}
                    </p>

                    <p className="mt-1 text-[11px] text-admin-text-soft">
                      {column.description}
                    </p>
                  </div>

                  <span
                    className={[
                      "inline-flex h-7 min-w-7 items-center justify-center rounded-lg px-2 text-xs font-bold",
                      column.countClass,
                    ].join(" ")}
                  >
                    {columnApplications.length}
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-3">
                {columnApplications.map(
                  (application) => {
                    const initials =
                      `${application.applicant.firstName.charAt(
                        0,
                      )}${application.applicant.lastName.charAt(
                        0,
                      )}`.toUpperCase();

                    const completedSteps =
                      getCompletedSteps(application);

                    return (
                      <article
                        key={application.id}
                        draggable
                        onDragStart={(event) => {
                          setDraggedApplicationId(
                            application.id,
                          );

                          event.dataTransfer.setData(
                            "text/application-id",
                            application.id,
                          );

                          event.dataTransfer.effectAllowed =
                            "move";
                        }}
                        onDragEnd={() =>
                          setDraggedApplicationId(null)
                        }
                        className={[
                          "group overflow-hidden rounded-2xl border border-admin-border bg-white transition-all duration-200",
                          "hover:border-[#03AEFE]/40 hover:shadow-[0_10px_30px_rgba(3,174,254,0.08)]",
                          draggedApplicationId ===
                          application.id
                            ? "scale-[0.98] opacity-40"
                            : "",
                        ].join(" ")}
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-blue text-xs font-bold text-primary-dark transition-colors group-hover:bg-[#03AEFE] group-hover:text-white">
                              {initials}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold text-admin-text">
                                    {
                                      application.applicant
                                        .fullName
                                    }
                                  </p>

                                  <p className="mt-1 text-[11px] text-admin-text-soft">
                                    {application.code}
                                  </p>
                                </div>

                                <GripVertical
                                  aria-hidden="true"
                                  size={17}
                                  className="shrink-0 cursor-grab text-admin-text-muted active:cursor-grabbing"
                                />
                              </div>

                              <div className="mt-2">
                                <ApplicationStatusBadge
                                  status={application.status}
                                  compact
                                />
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-admin-text-soft">
                            <span>
                              CI{" "}
                              {
                                application.applicant
                                  .identityNumber
                              }
                            </span>

                            <span>•</span>

                            <span className="inline-flex items-center gap-1">
                              <MapPin
                                aria-hidden="true"
                                size={12}
                              />
                              {
                                application.applicant
                                  .city
                              }
                            </span>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <div className="rounded-xl bg-surface-blue/40 px-3 py-3">
                              <p className="text-[10px] text-admin-text-soft">
                                Monto solicitado
                              </p>

                              <p className="mt-1 text-sm font-bold text-admin-text">
                                {formatCurrency(
                                  application.loan
                                    .requestedAmount,
                                )}
                              </p>
                            </div>

                            <div className="rounded-xl bg-[#F0FBF7] px-3 py-3">
                              <p className="text-[10px] text-admin-text-soft">
                                Ingreso mensual
                              </p>

                              <p className="mt-1 text-sm font-bold text-admin-text">
                                {formatCurrency(
                                  application.employment
                                    .monthlyNetIncome,
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 rounded-xl bg-admin-surface-soft p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-[10px] font-medium text-admin-text-muted">
                                  Etapa actual
                                </p>

                                <p className="mt-1 text-xs font-bold text-admin-text">
                                  {
                                    application.onboarding
                                      .currentStepLabel
                                  }
                                </p>
                              </div>

                              <span className="text-sm font-bold text-primary-dark">
                                {
                                  application.onboarding
                                    .progress
                                }
                                %
                              </span>
                            </div>

                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-admin-border">
                              <div
                                className="h-full rounded-full bg-[#03AEFE] transition-all duration-300"
                                style={{
                                  width: `${application.onboarding.progress}%`,
                                }}
                              />
                            </div>

                            <p className="mt-2 text-[10px] text-admin-text-muted">
                              {Math.min(
                                completedSteps,
                                ONBOARDING_TOTAL_STEPS,
                              )}
                              /{ONBOARDING_TOTAL_STEPS} pasos
                            </p>
                          </div>

                          <div className="mt-4 border-t border-admin-border pt-3">
                            <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-admin-text-muted">
                              Próxima acción
                            </p>

                            <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-admin-text">
                              {application.nextAction}
                            </p>
                          </div>

                          {application.alerts.length > 0 ? (
                            <div className="mt-3 flex items-start gap-2 rounded-xl bg-warning-bg px-3 py-2.5">
                              <AlertTriangle
                                aria-hidden="true"
                                size={14}
                                className="mt-0.5 shrink-0 text-warning"
                              />

                              <p className="line-clamp-2 text-[11px] leading-4 text-warning">
                                {
                                  application.alerts[0]
                                }
                              </p>
                            </div>
                          ) : null}
                        </div>

                        <div className="border-t border-admin-border bg-admin-surface-soft p-3">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/solicitudes/${application.id}`,
                              )
                            }
                            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-ink text-xs font-bold text-white transition-all hover:bg-primary-dark"
                          >
                            Abrir expediente

                            <ArrowRight
                              aria-hidden="true"
                              size={14}
                            />
                          </button>
                        </div>
                      </article>
                    );
                  },
                )}

                {columnApplications.length === 0 ? (
                  <div className="flex min-h-[150px] items-center justify-center rounded-2xl border border-dashed border-admin-border bg-white/50 p-5 text-center">
                    <div>
                      <p className="text-xs font-semibold text-admin-text-soft">
                        Sin solicitudes
                      </p>

                      <p className="mt-1 text-[11px] text-admin-text-muted">
                        Arrastra una solicitud aquí
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
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

  const [dashboardGroup, setDashboardGroup] =
    useState<DashboardGroup>("FOLLOW_UP");

  const [followUpFilter, setFollowUpFilter] =
    useState<FollowUpFilter>("ALL");

  const [openApplicationId, setOpenApplicationId] =
    useState<string | null>(null);

  const toggleApplication = (applicationId: string) => {
    setOpenApplicationId((current) =>
      current === applicationId
        ? null
        : applicationId,
    );
  };

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
        nextAction: "Realizar simulación del préstamo",
      }),

      createMockApplication(baseApplication, {
        id: "app-005",
        code: "KIV-2026-005",
        firstName: "Luis",
        lastName: "Quispe",
        identityNumber: "7214589",
        city: "El Alto",
        currentStep: "DOCUMENTS",
        completedStepCodes: baseApplication.onboarding.steps.map(
          (step) => step.code,
        ),
        progress: 100,
        nextAction: "Revisar para pre aprobación",
      }),

      createMockApplication(baseApplication, {
        id: "app-006",
        code: "KIV-2026-006",
        firstName: "Paola",
        lastName: "Vargas",
        identityNumber: "7482365",
        city: "La Paz",
        currentStep: "DOCUMENTS",
        completedStepCodes: baseApplication.onboarding.steps.map(
          (step) => step.code,
        ),
        progress: 100,
        nextAction: "Revisar para pre aprobación",
      }),
    ];
  }, [baseApplication]);

  const followUpApplications = applications.filter(
    (application) =>
      application.status !== "PREAPPROVED" &&
      application.status !== "COMPLEMENTARY_DOCUMENTATION" &&
      application.status !== "FORMALIZATION",
  );

  const preApprovedApplications = applications.filter(
    (application) =>
      application.status === "PREAPPROVED" ||
      application.status === "COMPLEMENTARY_DOCUMENTATION" ||
      application.status === "FORMALIZATION",
  );

  const groupedApplications =
    dashboardGroup === "FOLLOW_UP"
      ? followUpApplications
      : preApprovedApplications;

  const visibleApplications =
    dashboardGroup !== "FOLLOW_UP"
      ? groupedApplications
      : groupedApplications.filter((application) => {
          if (followUpFilter === "COMPLETED") {
            return hasCompletedOnboarding(application);
          }

          if (followUpFilter === "IN_PROGRESS") {
            return !hasCompletedOnboarding(application);
          }

          return true;
        });

  const completedOnboardingCount = followUpApplications.filter(
    hasCompletedOnboarding,
  ).length;

  if (user?.role === "ASESOR_PRESTAMOS") {
    return <LoanAdvisorDashboard />;
  }

  if (!baseApplication) {
    return (
      <BackofficeLayout
        title="Tablero"
        description="Seguimiento de solicitudes de préstamo."
      >
        <div className="rounded-2xl bg-white p-8">
          <p className="text-sm text-admin-text-soft">
            No se encontraron solicitudes.
          </p>
        </div>
      </BackofficeLayout>
    );
  }

  return (
    <BackofficeLayout
      title="Tablero"
      description="Revisa los nuevos ingresos y continúa la gestión de cada cliente."
    >
      <div className="mx-auto max-w-[1500px] space-y-5">
        <section className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-[-0.02em] text-admin-text">
                  Solicitudes
                </h2>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-blue px-2.5 py-1 text-[10px] font-bold text-primary-dark">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-30" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  {dashboardGroup === "FOLLOW_UP"
                    ? "En seguimiento"
                    : "Pre aprobados"}
                </span>
              </div>

              <p className="mt-1 text-sm text-admin-text-soft">
                {dashboardGroup === "FOLLOW_UP"
                  ? "Identifica rápidamente quién sigue en proceso y quién ya completó los 6 pasos."
                  : "Gestiona las solicitudes que ya pasaron a pre aprobación."}
              </p>
            </div>

            <div className="rounded-2xl bg-[#03AEFE] px-5 py-3 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/70">
                {dashboardGroup === "FOLLOW_UP"
                  ? "Seguimiento"
                  : "Pre aprobados"}
              </p>
              <p className="mt-0.5 text-sm font-bold">
                {visibleApplications.length} solicitudes
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-admin-border bg-white p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setDashboardGroup("FOLLOW_UP");
                  setFollowUpFilter("IN_PROGRESS");
                }}
                className={[
                  "inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-bold transition-all duration-200",
                  dashboardGroup === "FOLLOW_UP" &&
                  followUpFilter === "IN_PROGRESS"
                    ? "border-[#03AEFE] bg-[#03AEFE] text-white shadow-sm"
                    : "border-admin-border bg-white text-admin-text-soft hover:border-[#03AEFE]/40 hover:bg-[#EAF7FF] hover:text-primary-dark",
                ].join(" ")}
              >
                En seguimiento
              </button>

              <button
                type="button"
                onClick={() => {
                  setDashboardGroup("FOLLOW_UP");
                  setFollowUpFilter("COMPLETED");
                }}
                className={[
                  "inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-bold transition-all duration-200",
                  dashboardGroup === "FOLLOW_UP" &&
                  followUpFilter === "COMPLETED"
                    ? "border-[#03AEFE] bg-[#03AEFE] text-white shadow-sm"
                    : "border-admin-border bg-white text-admin-text-soft hover:border-[#03AEFE]/40 hover:bg-[#EAF7FF] hover:text-primary-dark",
                ].join(" ")}
              >
                Onboarding completado

                <span
                  className={[
                    "inline-flex h-6 min-w-6 items-center justify-center rounded-lg px-1.5 text-[11px] font-bold transition-colors",
                    dashboardGroup === "FOLLOW_UP" &&
                    followUpFilter === "COMPLETED"
                      ? "bg-white/20 text-white"
                      : "bg-surface-blue text-primary-dark",
                  ].join(" ")}
                >
                  {completedOnboardingCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setDashboardGroup("PRE_APPROVED")
                }
                className={[
                  "inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-bold transition-all duration-200",
                  dashboardGroup === "PRE_APPROVED"
                    ? "border-black bg-black text-white shadow-sm"
                    : "border-admin-border bg-white text-admin-text-soft hover:border-admin-text/20 hover:bg-admin-surface-soft hover:text-admin-text",
                ].join(" ")}
              >
                Proceso de evaluación
              </button>
            </div>

            <div className="inline-flex w-fit rounded-xl bg-admin-surface-soft p-1">
              <button
                type="button"
                onClick={() => setDashboardView("LIST")}
                className={[
                  "inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-xs font-bold transition-all duration-200",
                  dashboardView === "LIST"
                    ? "bg-white text-admin-text shadow-sm"
                    : "text-admin-text-soft hover:text-admin-text",
                ].join(" ")}
              >
                <LayoutList aria-hidden="true" size={15} />
                Lista
              </button>

              <button
                type="button"
                onClick={() => setDashboardView("FLOW")}
                className={[
                  "inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-xs font-bold transition-all duration-200",
                  dashboardView === "FLOW"
                    ? "bg-white text-admin-text shadow-sm"
                    : "text-admin-text-soft hover:text-admin-text",
                ].join(" ")}
              >
                <Columns3 aria-hidden="true" size={15} />
                Flujo
              </button>
            </div>
          </div>
        </section>


        {dashboardView === "FLOW" ? (
          <ApplicationsFlowBoard
            applications={groupedApplications}
            group={dashboardGroup}
            followUpFilter={followUpFilter}
          />
        ) : (
          <section className="space-y-3">
            {visibleApplications.length > 0 ? (
              visibleApplications.map((application) => (
                <ApplicationAccordionCard
                  key={application.id}
                  application={application}
                  open={openApplicationId === application.id}
                  onToggle={() =>
                    toggleApplication(application.id)
                  }
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-admin-border bg-white p-8 text-center">
                <p className="text-sm font-semibold text-admin-text">
                  No hay solicitudes en esta vista.
                </p>
                <p className="mt-1 text-xs text-admin-text-soft">
                  Cambia el filtro para revisar otras solicitudes.
                </p>
              </div>
            )}
          </section>
        )}
      </div>

      <NotificationSummaryModal
        open={loginSummaryOpen}
        onClose={() => setLoginSummaryOpen(false)}
        firstName={user?.firstName ?? "Jhoseline"}
      />
    </BackofficeLayout>
  );
}