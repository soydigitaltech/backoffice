"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  MapPin,
  Radio,
  UserRound,
  Columns3,
  GripVertical,
  LayoutList,} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import ApplicationStatusBadge from "@/components/applications/ApplicationStatusBadge";
import OnboardingTimeline from "@/components/applications/OnboardingTimeline";
import BackofficeLayout from "@/components/layout/BackofficeLayout";
import NotificationSummaryModal from "@/components/notifications/NotificationSummaryModal";
import { useAuth } from "@/hooks/useAuth";
import { INITIAL_APPLICATIONS } from "@/mocks/applications";
import type { Application } from "@/types/application";

type DashboardPeriod =
  | "TODAY"
  | "YESTERDAY"
  | "WEEK"
  | "MONTH";

type DashboardView = "LIST" | "FLOW";

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
  label: string;
  description: string;
  headerClass: string;
  countClass: string;
}[] = [
  {
    id: "NEW",
    label: "Nuevas",
    description: "Ingresaron al tablero",
    headerClass: "bg-surface-blue",
    countClass: "bg-primary text-white",
  },
  {
    id: "REVIEW",
    label: "En revisión",
    description: "Gestión de Clientes",
    headerClass: "bg-[#FFF7EB]",
    countClass: "bg-[#FE9806] text-white",
  },
  {
    id: "APPROVED",
    label: "Aprobadas",
    description: "Listas para asignar",
    headerClass: "bg-[#F0FBF7]",
    countClass: "bg-[#16855E] text-white",
  },
  {
    id: "ASSIGNED",
    label: "Asignadas",
    description: "Con asesor responsable",
    headerClass: "bg-[#F8F1FF]",
    countClass: "bg-[#9003FD] text-white",
  },
];

const DASHBOARD_PERIODS: {
  value: DashboardPeriod;
  label: string;
}[] = [
  { value: "TODAY", label: "Hoy" },
  { value: "YESTERDAY", label: "Ayer" },
  { value: "WEEK", label: "Esta semana" },
  { value: "MONTH", label: "Este mes" },
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

function formatRelativeTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Sin actividad";
  }

  const now = new Date();

  const differenceInMinutes = Math.max(
    0,
    Math.floor((now.getTime() - date.getTime()) / 60000),
  );

  if (differenceInMinutes < 1) {
    return "Ahora";
  }

  if (differenceInMinutes < 60) {
    return `Hace ${differenceInMinutes} min`;
  }

  const hours = Math.floor(differenceInMinutes / 60);

  if (hours < 24) {
    return `Hace ${hours} h`;
  }

  const days = Math.floor(hours / 24);

  return `Hace ${days} día${days === 1 ? "" : "s"}`;
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

function ApplicationAccordionCard({
  application,
  defaultOpen = false,
}: {
  application: Application;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const [inReview, setInReview] = useState(false);

  const completedSteps = application.onboarding.steps.filter(
    (step) => step.status === "COMPLETED",
  ).length;

  const initials = `${application.applicant.firstName.charAt(
    0,
  )}${application.applicant.lastName.charAt(0)}`.toUpperCase();

  return (
    <article className="overflow-hidden rounded-2xl border border-admin-border bg-white transition-all hover:border-primary/25">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-4 p-5 text-left sm:p-6"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-blue text-sm font-bold text-primary-dark">
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
              "text-admin-text-muted transition-transform duration-200",
              open ? "rotate-180" : "",
            ].join(" ")}
          />
        </div>
      </button>

      {open ? (
        <div className="border-t border-admin-border">
          <div className="p-5 sm:p-6">
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
                    {completedSteps}/
                    {application.onboarding.steps.length} etapas
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
      ) : null}
    </article>
  );
}

function ApplicationsFlowBoard({
  applications,
}: {
  applications: Application[];
}) {
  const router = useRouter();

  const [draggedApplicationId, setDraggedApplicationId] =
    useState<string | null>(null);

  const [board, setBoard] = useState<BoardState>(() => {
    const ids = applications.map(
      (application) => application.id,
    );

    return {
      NEW: ids.slice(0, 2),
      REVIEW: ids.slice(2, 4),
      APPROVED: ids.slice(4, 5),
      ASSIGNED: ids.slice(5, 6),
    };
  });

  const getApplication = (id: string) =>
    applications.find(
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

  return (
    <section className="overflow-x-auto pb-3">
      <div className="grid min-w-[1180px] grid-cols-4 gap-4">
        {BOARD_COLUMNS.map((column) => (
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
                  {board[column.id].length}
                </span>
              </div>
            </div>

            <div className="mt-3 space-y-3">
              {board[column.id].map(
                (applicationId) => {
                  const application =
                    getApplication(applicationId);

                  if (!application) {
                    return null;
                  }

                  const initials =
                    `${application.applicant.firstName.charAt(
                      0,
                    )}${application.applicant.lastName.charAt(
                      0,
                    )}`.toUpperCase();

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
                      onClick={() => {
                        if (
                          draggedApplicationId ===
                          application.id
                        ) {
                          return;
                        }

                        router.push(
                          `/solicitudes/${application.id}`,
                        );
                      }}
                      className={[
                        "group cursor-pointer rounded-2xl border border-admin-border bg-white p-4 transition-all",
                        "hover:border-primary/30 hover:shadow-[0_10px_30px_rgba(3,174,254,0.08)]",
                        draggedApplicationId ===
                        application.id
                          ? "opacity-40"
                          : "",
                      ].join(" ")}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-blue text-xs font-bold text-primary-dark">
                          {initials}
                        </div>

                        <div className="min-w-0 flex-1">
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

                      <div className="mt-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[11px] font-medium text-admin-text-soft">
                            {
                              application.onboarding
                                .currentStepLabel
                            }
                          </span>

                          <span className="text-xs font-bold text-primary-dark">
                            {
                              application.onboarding
                                .progress
                            }
                            %
                          </span>
                        </div>

                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-admin-border">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{
                              width: `${application.onboarding.progress}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 border-t border-admin-border pt-3">
                        {column.id === "ASSIGNED" ? (
                          <p className="text-xs text-admin-text-soft">
                            Asesor:{" "}
                            <span className="font-bold text-admin-text">
                              {application.assignedAdvisorName ||
                                "Asignado"}
                            </span>
                          </p>
                        ) : (
                          <p className="line-clamp-2 text-xs leading-5 text-admin-text-soft">
                            {application.nextAction}
                          </p>
                        )}
                      </div>
                    </article>
                  );
                },
              )}

              {board[column.id].length === 0 ? (
                <div className="flex min-h-[120px] items-center justify-center rounded-2xl border border-dashed border-admin-border bg-white/50 p-5 text-center">
                  <p className="text-xs text-admin-text-muted">
                    Arrastra una solicitud aquí
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const [loginSummaryOpen, setLoginSummaryOpen] =
    useState(false);

  const [period, setPeriod] =
    useState<DashboardPeriod>("TODAY");

  const [dashboardView, setDashboardView] =
    useState<DashboardView>("LIST");

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

    setLoginSummaryOpen(true);
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
        completedStepCodes: [
          "PERSONAL_DATA",
          "EMPLOYMENT",
          "FINANCIAL_INFORMATION",
          "LOAN_SIMULATION",
        ],
        progress: 40,
        nextAction: "Cargar documentación",
      }),

      createMockApplication(baseApplication, {
        id: "app-006",
        code: "KIV-2026-006",
        firstName: "Paola",
        lastName: "Vargas",
        identityNumber: "7482365",
        city: "La Paz",
        currentStep: "EMPLOYMENT",
        completedStepCodes: ["PERSONAL_DATA"],
        progress: 10,
        nextAction: "Completar actividad laboral",
      }),
    ];
  }, [baseApplication]);

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

                  En seguimiento
                </span>
              </div>

              <p className="mt-1 text-sm text-admin-text-soft">
                Revisa los ingresos según el periodo seleccionado.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-3 rounded-2xl bg-[#03AEFE] px-5 py-3 text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <UserRound
                  aria-hidden="true"
                  size={19}
                />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/70">
                  {period === "TODAY"
                    ? "Hoy"
                    : period === "YESTERDAY"
                      ? "Ayer"
                      : period === "WEEK"
                        ? "Esta semana"
                        : "Este mes"}
                </p>

                <p className="mt-0.5 text-sm font-bold leading-[14px] text-white">
                  {applications.length} solicitudes
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex rounded-xl border border-admin-border bg-white p-1">
              <button
                type="button"
                onClick={() =>
                  setDashboardView("LIST")
                }
                className={[
                  "inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3.5 text-xs font-bold transition-colors",
                  dashboardView === "LIST"
                    ? "bg-black text-white"
                    : "text-admin-text-soft hover:bg-admin-surface-soft",
                ].join(" ")}
              >
                <LayoutList
                  aria-hidden="true"
                  size={15}
                />

                Lista
              </button>

              <button
                type="button"
                onClick={() =>
                  setDashboardView("FLOW")
                }
                className={[
                  "inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3.5 text-xs font-bold transition-colors",
                  dashboardView === "FLOW"
                    ? "bg-black text-white"
                    : "text-admin-text-soft hover:bg-admin-surface-soft",
                ].join(" ")}
              >
                <Columns3
                  aria-hidden="true"
                  size={15}
                />

                Flujo
              </button>
            </div>

            {dashboardView === "FLOW" ? (
              <p className="hidden text-xs text-admin-text-muted sm:block">
                Arrastra las solicitudes para cambiar su estado.
              </p>
            ) : null}
          </div>

          {dashboardView === "LIST" ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-admin-border bg-white p-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1 overflow-x-auto">
              {DASHBOARD_PERIODS.map((item) => {
                const active = period === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setPeriod(item.value)}
                    className={[
                      "h-10 shrink-0 rounded-xl px-4 text-sm font-semibold transition-colors",
                      active
                        ? "bg-ink text-white"
                        : "text-admin-text-soft hover:bg-admin-surface-soft hover:text-admin-text",
                    ].join(" ")}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-admin-text-soft transition-colors hover:bg-admin-surface-soft hover:text-admin-text"
            >
              <CalendarDays
                aria-hidden="true"
                size={16}
              />

              Elegir fecha
            </button>
          </div>
          ) : null}
        </section>

        {dashboardView === "FLOW" ? (
          <ApplicationsFlowBoard
            applications={applications}
          />
        ) : (
        <section className="space-y-3">
          {applications.map((application, index) => (
            <ApplicationAccordionCard
              key={application.id}
              application={application}
              defaultOpen={index === 0}
            />
          ))}
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
