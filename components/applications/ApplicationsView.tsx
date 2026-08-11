"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
} from "lucide-react";
import { useMemo, useState } from "react";

import ApplicationStatusBadge from "@/components/applications/ApplicationStatusBadge";
import OnboardingTimeline from "@/components/applications/OnboardingTimeline";
import BackofficeLayout from "@/components/layout/BackofficeLayout";
import { INITIAL_APPLICATIONS } from "@/mocks/applications";
import type { Application } from "@/types/application";

type DashboardPeriod =
  | "TODAY"
  | "YESTERDAY"
  | "WEEK"
  | "MONTH";

type SolicitudesView =
  | "revision"
  | "aprobados"
  | "asignados";

const ASSIGNED_ADVISORS = [
  {
    id: "usr-002",
    name: "Carlos Mendoza",
    initials: "CM",
    assignments: 12,
  },
  {
    id: "usr-003",
    name: "Luis Paredes",
    initials: "LP",
    assignments: 8,
  },
  {
    id: "usr-004",
    name: "Andrea Rojas",
    initials: "AR",
    assignments: 6,
  },
  {
    id: "usr-005",
    name: "María Fernández",
    initials: "MF",
    assignments: 4,
  },
] as const;

const ASSIGNED_APPLICATIONS = {
  "usr-002": [
    {
      id: "app-001",
      code: "KIV-2026-001",
      applicant: "Juan Carlos Pérez Rojas",
      status: "Observado",
    },
    {
      id: "app-002",
      code: "KIV-2026-002",
      applicant: "Mariela Condori Quispe",
      status: "En gestión",
    },
    {
      id: "app-004",
      code: "KIV-2026-004",
      applicant: "Paola Vargas Salinas",
      status: "Asignado",
    },
    {
      id: "app-005",
      code: "KIV-2026-005",
      applicant: "Roberto Mamani Choque",
      status: "En gestión",
    },
  ],

  "usr-003": [
    {
      id: "app-003",
      code: "KIV-2026-003",
      applicant: "Diego Fernández López",
      status: "Asignado",
    },
    {
      id: "app-001",
      code: "KIV-2026-006",
      applicant: "Gabriela Flores",
      status: "En gestión",
    },
    {
      id: "app-002",
      code: "KIV-2026-007",
      applicant: "Mauricio Quispe",
      status: "Asignado",
    },
  ],

  "usr-004": [
    {
      id: "app-004",
      code: "KIV-2026-008",
      applicant: "Valeria Rojas",
      status: "Observado",
    },
    {
      id: "app-005",
      code: "KIV-2026-009",
      applicant: "José Salazar",
      status: "En gestión",
    },
  ],

  "usr-005": [
    {
      id: "app-001",
      code: "KIV-2026-010",
      applicant: "Lucía Fernández",
      status: "Asignado",
    },
    {
      id: "app-003",
      code: "KIV-2026-011",
      applicant: "Alejandro Vargas",
      status: "En gestión",
    },
  ],
} as const;

const ASSIGNED_ACTIVITY = [
  {
    id: "activity-001",
    advisor: "Carlos Mendoza",
    initials: "CM",
    applicationId: "app-001",
    applicationCode: "KIV-2026-001",
    applicant: "Juan Carlos Pérez Rojas",
    time: "Hace 8 min",
    type: "OBSERVATION",
    message:
      "Observó la documentación de ingresos. El respaldo presentado necesita ser actualizado.",
    actionRequired: true,
  },
  {
    id: "activity-002",
    advisor: "Luis Paredes",
    initials: "LP",
    applicationId: "app-003",
    applicationCode: "KIV-2026-003",
    applicant: "Diego Mamani",
    time: "Hace 22 min",
    type: "INFO",
    message:
      "Revisó la solicitud y solicitó documentación complementaria al cliente.",
    actionRequired: false,
  },
  {
    id: "activity-003",
    advisor: "Andrea Rojas",
    initials: "AR",
    applicationId: "app-004",
    applicationCode: "KIV-2026-004",
    applicant: "Carla Flores",
    time: "Hace 41 min",
    type: "OBSERVATION",
    message:
      "Encontró una diferencia en la información declarada y recomienda devolver la solicitud a revisión.",
    actionRequired: true,
  },
  {
    id: "activity-004",
    advisor: "María Fernández",
    initials: "MF",
    applicationId: "app-005",
    applicationCode: "KIV-2026-005",
    applicant: "Luis Quispe",
    time: "Hace 1 h",
    type: "INFO",
    message:
      "Completó la revisión inicial de la solicitud. No registró nuevas observaciones.",
    actionRequired: false,
  },
] as const;

const VIEW_CONFIG = {
  revision: {
    title: "En revisión",
    description:
      "Solicitudes que están siendo revisadas por Gestión de Clientes.",
    heading: "Solicitudes en revisión",
    badge: "En revisión",
    badgeClass: "bg-[#FFF4E5] text-[#C66A00]",
    countClass: "bg-[#FE9806]",
  },

  aprobados: {
    title: "Aprobados",
    description:
      "Solicitudes aprobadas y listas para asignar a un asesor.",
    heading: "Solicitudes aprobadas",
    badge: "Aprobado",
    badgeClass: "bg-[#EAF8F1] text-[#16855E]",
    countClass: "bg-[#16855E]",
  },

  asignados: {
    title: "Asignados",
    description:
      "Solicitudes que ya tienen un asesor responsable.",
    heading: "Solicitudes asignadas",
    badge: "Asignado",
    badgeClass: "bg-surface-blue text-primary-dark",
    countClass: "bg-[#03AEFE]",
  },
} as const;

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
  view,
  defaultOpen = false,
}: {
  application: Application;
  view: SolicitudesView;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

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
          {view === "revision" ? null : view === "aprobados" ? (
            <span className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#EAF8F1] px-4 text-sm font-bold leading-[14px] text-[#16855E]">
              <Check
                aria-hidden="true"
                size={15}
                strokeWidth={2.2}
              />

              Aprobado
            </span>
          ) : (
            <span className="inline-flex h-10 items-center rounded-xl bg-surface-blue px-4 text-sm font-bold leading-[14px] text-primary-dark">
              {application.assignedAdvisorName || "Asesor asignado"}
            </span>
          )}

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
              {view === "aprobados" ? (
                <span className="inline-flex h-11 items-center justify-center rounded-xl bg-[#EAF8F1] px-4 text-sm font-bold text-[#16855E]">
                  Lista para asignar
                </span>
              ) : null}

              {view === "asignados" ? (
                <span className="inline-flex h-11 items-center justify-center rounded-xl bg-surface-blue px-4 text-sm font-bold text-primary-dark">
                  {application.assignedAdvisorName || "Asesor asignado"}
                </span>
              ) : null}

              <Link
                href={`/solicitudes/${application.id}`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ink px-5 text-sm font-bold leading-none text-white transition-colors hover:bg-primary-dark"
              >
                {view === "revision"
                  ? "Ver solicitud"
                  : view === "aprobados"
                    ? "Revisar y asignar"
                    : "Ver gestión"}

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

export default function ApplicationsView() {
  const searchParams = useSearchParams();

  const requestedView = searchParams.get("estado");

  const currentView: SolicitudesView =
    requestedView === "aprobados" ||
    requestedView === "asignados"
      ? requestedView
      : "revision";

  const config = VIEW_CONFIG[currentView];

  type ActivityConversationStatus =
    | "OPEN"
    | "APPROVED"
    | "CLOSED";

  type ActivityMessage = {
    id: string;
    author: "ADVISOR" | "MANAGER";
    text: string;
  };

  const [openAdvisorId, setOpenAdvisorId] =
    useState<string | null>(null);

  const [openConversationId, setOpenConversationId] =
    useState<string | null>(null);

  const [activityStatus, setActivityStatus] =
    useState<Record<string, ActivityConversationStatus>>({});

  const [activityMessages, setActivityMessages] =
    useState<Record<string, ActivityMessage[]>>({});

  const [activityDrafts, setActivityDrafts] =
    useState<Record<string, string>>({});

  const getActivityStatus = (activityId: string) =>
    activityStatus[activityId] ?? "OPEN";

  const sendActivityMessage = (activityId: string) => {
    const message =
      activityDrafts[activityId]?.trim();

    if (!message) {
      return;
    }

    setActivityMessages((current) => ({
      ...current,
      [activityId]: [
        ...(current[activityId] ?? []),
        {
          id: `${activityId}-${Date.now()}`,
          author: "MANAGER",
          text: message,
        },
      ],
    }));

    setActivityDrafts((current) => ({
      ...current,
      [activityId]: "",
    }));
  };

  const approveActivity = (activityId: string) => {
    setActivityStatus((current) => ({
      ...current,
      [activityId]: "APPROVED",
    }));

    setActivityMessages((current) => ({
      ...current,
      [activityId]: [
        ...(current[activityId] ?? []),
        {
          id: `${activityId}-approval-${Date.now()}`,
          author: "ADVISOR",
          text: "Revisado. Todo está correcto, doy mi visto bueno.",
        },
      ],
    }));
  };

  const closeActivity = (activityId: string) => {
    setActivityStatus((current) => ({
      ...current,
      [activityId]: "CLOSED",
    }));
  };

  const [period, setPeriod] =
    useState<DashboardPeriod>("TODAY");

  const applications = useMemo(() => {
    const find = (id: string) =>
      INITIAL_APPLICATIONS.find(
        (application) => application.id === id,
      );

    if (currentView === "revision") {
      return [
        find("app-001"),
        find("app-002"),
        find("app-005"),
      ].filter(Boolean) as Application[];
    }

    if (currentView === "aprobados") {
      const base = find("app-004");

      if (!base) {
        return [];
      }

      /*
       * Sólo para visualizar correctamente esta etapa.
       * Cuando llegue backend, este estado vendrá persistido.
       */
      const approved: Application = {
        ...base,

        assignedAdvisorId: "",
        assignedAdvisorName: "",

        progress: 100,

        nextAction:
          "Asignar un asesor para continuar la gestión",

        onboarding: {
          ...base.onboarding,

          progress: 100,
          state: "COMPLETED",
          responsible: "NONE",

          steps: base.onboarding.steps.map(
            (step) => ({
              ...step,
              status: "COMPLETED",
              progress: 100,
              responsible: "NONE",
              pendingFields: [],
            }),
          ),
        },

        documents: base.documents.map(
          (document) => ({
            ...document,
            status: "VALIDATED",
          }),
        ),
      };

      return [approved];
    }

    const base = find("app-003");

    if (!base) {
      return [];
    }

    const assigned: Application = {
      ...base,

      assignedAdvisorId: "usr-003",
      assignedAdvisorName: "Luis Paredes",

      progress: 100,

      nextAction:
        "Continuar seguimiento con el asesor asignado",

      onboarding: {
        ...base.onboarding,

        progress: 100,
        state: "COMPLETED",
        responsible: "ADVISOR",

        steps: base.onboarding.steps.map(
          (step) => ({
            ...step,
            status: "COMPLETED",
            progress: 100,
            pendingFields: [],
          }),
        ),
      },

      documents: base.documents.map(
        (document) => ({
          ...document,
          status: "VALIDATED",
        }),
      ),
    };

    return [assigned];
  }, [currentView]);

  return (
    <BackofficeLayout
      title={config.title}
      description={config.description}
    >
      <div className="mx-auto max-w-[1500px] space-y-5">
        <section className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold tracking-[-0.02em] text-admin-text">
                  {config.heading}
                </h2>

                <span
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold",
                    config.badgeClass,
                  ].join(" ")}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-20" />

                    <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
                  </span>

                  {config.badge}
                </span>
              </div>

              <p className="mt-1 text-sm text-admin-text-soft">
                {currentView === "revision"
                  ? "Revisa y valida cada solicitud antes de aprobarla."
                  : currentView === "aprobados"
                    ? "Estas solicitudes están listas para asignar un asesor."
                    : "Consulta las solicitudes que ya tienen un asesor responsable."}
              </p>
            </div>

            <div
              className={[
                "inline-flex w-fit items-center gap-3 rounded-2xl px-5 py-3 text-white",
                config.countClass,
              ].join(" ")}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <UserRound
                  aria-hidden="true"
                  size={19}
                  strokeWidth={1.9}
                />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/70">
                  {currentView === "revision"
                    ? "En revisión"
                    : currentView === "aprobados"
                      ? "Aprobadas"
                      : "Asignadas"}
                </p>

                <p className="mt-0.5 text-sm font-bold leading-[14px] text-white">
                  {currentView === "asignados"
                    ? `${ASSIGNED_ADVISORS.length} asignados`
                    : `${applications.length} ${
                        applications.length === 1
                          ? "solicitud"
                          : "solicitudes"
                      }`}
                </p>
              </div>
            </div>
          </div>

          {currentView !== "asignados" ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-admin-border bg-white p-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1 overflow-x-auto">
              {DASHBOARD_PERIODS.map((item) => {
                const active =
                  period === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      setPeriod(item.value)
                    }
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
                strokeWidth={1.8}
              />

              Elegir fecha
            </button>
          </div>
          ) : null}
        </section>

        {currentView === "asignados" ? (
          <section className="space-y-3">
            {ASSIGNED_ADVISORS.map((advisor, index) => {
              const open =
                openAdvisorId === advisor.id;

              const advisorActivities =
                ASSIGNED_ACTIVITY.filter(
                  (activity) =>
                    activity.advisor === advisor.name &&
                    activity.actionRequired,
                );

              const advisorAssignedApplications =
                ASSIGNED_APPLICATIONS[
                  advisor.id as keyof typeof ASSIGNED_APPLICATIONS
                ] ?? [];

              /*
               * Mock visual del flujo del asesor.
               * Luego lo reemplazaremos por solicitudes reales
               * relacionadas mediante advisor.id.
               */
              const advisorApplications =
                applications.filter(
                  (application) =>
                    application.assignedAdvisorName ===
                    advisor.name,
                );

              const flowApplications =
                advisorApplications.length > 0
                  ? advisorApplications
                  : index === 0
                    ? applications.slice(0, 1)
                    : [];

              return (
                <article
                  key={advisor.id}
                  className={[
                    "overflow-hidden rounded-2xl border bg-white transition-all",
                    open
                      ? "border-primary/30 shadow-[0_12px_35px_rgba(3,174,254,0.08)]"
                      : "border-admin-border",
                  ].join(" ")}
                >
                  {/* CABECERA DEL ASESOR */}
                  <button
                    type="button"
                    onClick={() => {
                      setOpenAdvisorId(
                        open ? null : advisor.id,
                      );

                    }}
                    className="flex w-full items-center gap-4 px-5 py-5 text-left transition-colors hover:bg-admin-surface-soft/40 sm:px-6"
                  >
                    <div
                      className={[
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                        index === 0
                          ? "bg-surface-blue text-primary-dark"
                          : index === 1
                            ? "bg-[#F0FBF7] text-[#16855E]"
                            : index === 2
                              ? "bg-[#FFF7EB] text-[#D97706]"
                              : "bg-[#F8F1FF] text-[#9003FD]",
                      ].join(" ")}
                    >
                      {advisor.initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-bold text-admin-text">
                          {advisor.name}
                        </p>

                        {advisorActivities.length > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600">
                            <AlertTriangle
                              aria-hidden="true"
                              size={11}
                            />

                            {advisorActivities.length}{" "}
                            {advisorActivities.length === 1
                              ? "observación"
                              : "observaciones"}
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-1 text-xs text-admin-text-soft">
                        {advisor.assignments} asignaciones
                      </p>
                    </div>

                    <ChevronDown
                      aria-hidden="true"
                      size={19}
                      strokeWidth={1.9}
                      className={[
                        "shrink-0 text-admin-text-muted transition-transform duration-200",
                        open ? "rotate-180" : "",
                      ].join(" ")}
                    />
                  </button>

                  {/* CONTENIDO DEL ACORDEÓN */}
                  {open && (
                    <div className="border-t border-admin-border">
                      <div className="border-b border-admin-border p-5 sm:p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-bold text-admin-text">
                              Solicitudes asignadas
                            </p>

                            <p className="mt-1 text-xs text-admin-text-soft">
                              Acceso rápido a las solicitudes de {advisor.name}.
                            </p>
                          </div>

                          <span className="text-xs font-bold text-admin-text-soft">
                            {advisor.assignments} asignaciones
                          </span>
                        </div>

                        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                          {advisorAssignedApplications.map(
                            (item) => {
                              const activity =
                                ASSIGNED_ACTIVITY.find(
                                  (activity) =>
                                    activity.applicationId ===
                                      item.id &&
                                    activity.advisor ===
                                      advisor.name,
                                );

                              const chatOpen =
                                openConversationId ===
                                `${advisor.id}-${item.id}`;

                              const status = activity
                                ? getActivityStatus(
                                    activity.id,
                                  )
                                : "OPEN";

                              const messages = activity
                                ? activityMessages[
                                    activity.id
                                  ] ?? []
                                : [];

                              return (
                                <div
                                  key={`${advisor.id}-${item.code}`}
                                  className={[
                                    "overflow-hidden rounded-xl border bg-white transition-all",
                                    chatOpen
                                      ? "border-primary/30 shadow-sm sm:col-span-2 xl:col-span-4"
                                      : "border-admin-border",
                                  ].join(" ")}
                                >
                                  {/* CARD DE LA SOLICITUD */}
                                  <div className="p-3">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <p className="truncate text-xs font-bold text-admin-text">
                                          {item.applicant}
                                        </p>

                                        <p className="mt-1 text-[10px] text-admin-text-muted">
                                          {item.code}
                                        </p>
                                      </div>

                                      <span
                                        className={[
                                          "shrink-0 rounded-full px-2 py-1 text-[9px] font-bold",
                                          item.status ===
                                          "Observado"
                                            ? "bg-red-50 text-red-600"
                                            : item.status ===
                                                "En gestión"
                                              ? "bg-[#FFF7EB] text-[#C66A00]"
                                              : "bg-surface-blue text-primary-dark",
                                        ].join(" ")}
                                      >
                                        {item.status}
                                      </span>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-admin-border pt-3">
                                      <Link
                                        href={`/solicitudes/${item.id}?from=assigned&advisor=${advisor.id}`}
                                        className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[10px] font-bold text-primary-dark transition-colors hover:bg-surface-blue"
                                      >
                                        Ver solicitud

                                        <ArrowRight
                                          aria-hidden="true"
                                          size={12}
                                        />
                                      </Link>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          setOpenConversationId(
                                            chatOpen
                                              ? null
                                              : `${advisor.id}-${item.id}`,
                                          )
                                        }
                                        className={[
                                          "inline-flex h-8 items-center justify-center rounded-lg px-3 text-[10px] font-bold transition-colors",
                                          chatOpen
                                            ? "bg-black text-white"
                                            : "bg-surface-blue text-primary-dark hover:bg-primary hover:text-white",
                                        ].join(" ")}
                                      >
                                        {chatOpen
                                          ? "Cerrar chat"
                                          : "Chatear"}
                                      </button>
                                    </div>
                                  </div>

                                  {/* CHAT DE ESTA SOLICITUD */}
                                  {chatOpen ? (
                                    <div className="border-t border-admin-border bg-admin-surface-soft/30 p-4">
                                      <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                          <p className="text-xs font-bold text-admin-text">
                                            {item.applicant}
                                          </p>

                                          <p className="mt-1 text-[10px] text-admin-text-soft">
                                            Conversación con{" "}
                                            {advisor.name} ·{" "}
                                            {item.code}
                                          </p>
                                        </div>

                                        {activity ? (
                                          <span
                                            className={[
                                              "rounded-full px-2.5 py-1 text-[9px] font-bold",
                                              status === "OPEN"
                                                ? "bg-red-50 text-red-600"
                                                : "bg-emerald-50 text-emerald-700",
                                            ].join(" ")}
                                          >
                                            {status === "OPEN"
                                              ? "Observado"
                                              : "Cerrado"}
                                          </span>
                                        ) : (
                                          <span className="rounded-full bg-surface-blue px-2.5 py-1 text-[9px] font-bold text-primary-dark">
                                            Nueva conversación
                                          </span>
                                        )}
                                      </div>

                                      {activity ? (
                                        <>
                                          {/* MENSAJE INICIAL DEL ASESOR */}
                                          <div className="mt-5 flex justify-start">
                                            <div className="flex max-w-[82%] items-end gap-2">
                                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-admin-text">
                                                {advisor.initials}
                                              </div>

                                              <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm">
                                                <p className="text-[10px] font-bold text-admin-text">
                                                  {advisor.name}
                                                </p>

                                                <p className="mt-1 text-sm leading-6 text-admin-text">
                                                  {
                                                    activity.message
                                                  }
                                                </p>

                                                <p className="mt-1 text-right text-[9px] text-admin-text-muted">
                                                  {activity.time}
                                                </p>
                                              </div>
                                            </div>
                                          </div>

                                          {/* RESPUESTAS */}
                                          <div className="mt-3 space-y-3">
                                            {messages.map(
                                              (message) => (
                                                <div
                                                  key={
                                                    message.id
                                                  }
                                                  className={[
                                                    "flex",
                                                    message.author ===
                                                    "MANAGER"
                                                      ? "justify-end"
                                                      : "justify-start",
                                                  ].join(
                                                    " ",
                                                  )}
                                                >
                                                  <div
                                                    className={[
                                                      "max-w-[82%] rounded-2xl px-4 py-3",
                                                      message.author ===
                                                      "MANAGER"
                                                        ? "rounded-br-md bg-[#EAF7FF]"
                                                        : "rounded-bl-md bg-white",
                                                    ].join(
                                                      " ",
                                                    )}
                                                  >
                                                    <p
                                                      className={[
                                                        "text-[10px] font-bold",
                                                        message.author ===
                                                        "MANAGER"
                                                          ? "text-primary-dark"
                                                          : "text-admin-text",
                                                      ].join(
                                                        " ",
                                                      )}
                                                    >
                                                      {message.author ===
                                                      "MANAGER"
                                                        ? "Gestión de Clientes"
                                                        : advisor.name}
                                                    </p>

                                                    <p className="mt-1 text-sm leading-6 text-admin-text">
                                                      {
                                                        message.text
                                                      }
                                                    </p>
                                                  </div>
                                                </div>
                                              ),
                                            )}
                                          </div>

                                          {status ===
                                          "OPEN" ? (
                                            <>
                                              <div className="mt-5 flex gap-2 rounded-2xl border border-admin-border bg-white p-2">
                                                <input
                                                  type="text"
                                                  value={
                                                    activityDrafts[
                                                      activity.id
                                                    ] ?? ""
                                                  }
                                                  onChange={(
                                                    event,
                                                  ) =>
                                                    setActivityDrafts(
                                                      (
                                                        current,
                                                      ) => ({
                                                        ...current,
                                                        [activity.id]:
                                                          event
                                                            .target
                                                            .value,
                                                      }),
                                                    )
                                                  }
                                                  onKeyDown={(
                                                    event,
                                                  ) => {
                                                    if (
                                                      event.key ===
                                                      "Enter"
                                                    ) {
                                                      sendActivityMessage(
                                                        activity.id,
                                                      );
                                                    }
                                                  }}
                                                  placeholder={`Responder a ${advisor.name}...`}
                                                  className="h-10 min-w-0 flex-1 bg-transparent px-2 text-xs text-admin-text outline-none placeholder:text-admin-text-muted"
                                                />

                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    sendActivityMessage(
                                                      activity.id,
                                                    )
                                                  }
                                                  className="h-10 rounded-xl bg-black px-5 text-xs font-bold text-white transition-colors hover:bg-primary-dark"
                                                >
                                                  Enviar
                                                </button>
                                              </div>

                                              <div className="mt-3 flex justify-end">
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    closeActivity(
                                                      activity.id,
                                                    )
                                                  }
                                                  className="h-9 rounded-xl border border-admin-border bg-white px-4 text-[10px] font-bold text-admin-text transition-colors hover:bg-admin-surface-soft"
                                                >
                                                  Cerrar conversación
                                                </button>
                                              </div>
                                            </>
                                          ) : (
                                            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
                                              <Check
                                                aria-hidden="true"
                                                size={14}
                                              />

                                              Conversación cerrada
                                            </div>
                                          )}
                                        </>
                                      ) : (
                                        /* TODAVÍA NO EXISTE CHAT */
                                        <div className="mt-5">
                                          <div className="rounded-xl border border-dashed border-admin-border bg-white/70 px-4 py-5 text-center">
                                            <p className="text-xs font-bold text-admin-text">
                                              Sin mensajes todavía
                                            </p>

                                            <p className="mt-1 text-[10px] text-admin-text-soft">
                                              Inicia una conversación sobre esta solicitud.
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ) : null}
                                </div>
                              );
                            },
                          )}
                        {advisor.assignments >
                        advisorAssignedApplications.length ? (
                          <button
                            type="button"
                            className="mt-3 text-xs font-bold text-primary-dark transition-colors hover:text-primary"
                          >
                            Ver todas las asignaciones
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  )}
                </article>
              );
            })}
          </section>
        ) : (
          <section className="space-y-3">
            {applications.length > 0 ? (
              applications.map(
                (application, index) => (
                  <ApplicationAccordionCard
                    key={`${currentView}-${application.id}`}
                    application={application}
                    view={currentView}
                    defaultOpen={index === 0}
                  />
                ),
              )
            ) : (
              <div className="rounded-2xl border border-admin-border bg-white p-10 text-center">
                <p className="text-sm font-bold text-admin-text">
                  No existen solicitudes en este estado
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </BackofficeLayout>
  );
}
