"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  FileCheck2,
  FileText,
  Home,
  Landmark,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  UserPlus,
  UserRound,
  UsersRound,
  WalletCards,
  Bell,
  NotebookPen,
  Plus,
  Trash2,
  X,} from "lucide-react";

import ApplicationStatusBadge from "@/components/applications/ApplicationStatusBadge";
import OnboardingTimeline from "@/components/applications/OnboardingTimeline";
import BackofficeLayout from "@/components/layout/BackofficeLayout";
import { INITIAL_APPLICATIONS } from "@/mocks/applications";
import Modal from "@/components/ui/Modal";
import {
  DOCUMENT_STATUS_LABELS,
  SCORING_STATUS_LABELS,
  SEGIP_STATUS_LABELS,
  type Application,
  type ApplicationDocumentStatus,
} from "@/types/application";

type ApplicationDetailViewProps = {
  application: Application;
};

type ReviewStatus =
  | "PENDING"
  | "VALIDATE"
  | "OBSERVED"
  | "APPROVED";

type ReviewSection =
  | "PERSONAL_DATA"
  | "EMPLOYMENT"
  | "LOAN"
  | "FINANCIAL"
  | "DOCUMENTS"
  | "SEGIP"
  | "SCORING";

type ReviewState = Partial<
  Record<ReviewSection, ReviewStatus>
>;

type ContactChannel = "WHATSAPP" | "EMAIL" | "BOTH";

type ReviewWorkspaceTab = "NOTES" | "REMINDERS";

type ReviewNote = {
  id: string;
  text: string;
  createdAt: string;
};

type ReviewReminder = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
};

const REVIEW_SECTION_LABELS: Record<ReviewSection, string> = {
  PERSONAL_DATA: "Datos personales",
  EMPLOYMENT: "Actividad laboral",
  LOAN: "Préstamo solicitado",
  FINANCIAL: "Capacidad financiera",
  DOCUMENTS: "Documentación",
  SEGIP: "Validación SEGIP",
  SCORING: "Scoring",
};

const ADVISORS = [
  {
    id: "usr-002",
    name: "Carlos Mendoza",
  },
  {
    id: "usr-003",
    name: "Luis Paredes",
  },
] as const;

function getReviewLabel(status: ReviewStatus) {
  switch (status) {
    case "OBSERVED":
      return "Observado";
    case "VALIDATE":
      return "Validar";
    case "APPROVED":
      return "Aprobado";
    default:
      return "Revisar";
  }
}

function getReviewCardClasses(status: ReviewStatus) {
  switch (status) {
    case "OBSERVED":
      return "border-red-200 bg-red-50/40";

    case "VALIDATE":
      return "border-amber-200 bg-amber-50/45";

    case "APPROVED":
      return "border-emerald-200 bg-emerald-50/40";

    default:
      return "border-admin-border bg-white";
  }
}

function getReviewButtonClasses(status: ReviewStatus) {
  switch (status) {
    case "OBSERVED":
      return "border-red-200 bg-red-50 text-red-600";

    case "VALIDATE":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "APPROVED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    default:
      return "border-admin-border bg-white text-admin-text-soft hover:border-primary/30 hover:bg-surface-blue hover:text-primary-dark";
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "Pendiente";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Pendiente";
  }

  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/La_Paz",
  })
    .format(date)
    .replace(/[\u00A0\u202F]/g, " ");
}

function formatMonths(value: number) {
  if (value < 12) {
    return `${value} ${value === 1 ? "mes" : "meses"}`;
  }

  const years = Math.floor(value / 12);
  const months = value % 12;

  if (months === 0) {
    return `${years} ${years === 1 ? "año" : "años"}`;
  }

  return `${years} ${years === 1 ? "año" : "años"} ${months} ${
    months === 1 ? "mes" : "meses"
  }`;
}

function getInitials(application: Application) {
  return `${application.applicant.firstName.charAt(0)}${application.applicant.lastName.charAt(0)}`.toUpperCase();
}

function getDocumentStatusClasses(
  status: ApplicationDocumentStatus,
) {
  switch (status) {
    case "VALIDATED":
      return "bg-success-bg text-success";
    case "UPLOADED":
      return "bg-surface-blue text-primary-dark";
    case "OBSERVED":
      return "bg-warning-bg text-warning";
    case "REJECTED":
      return "bg-error-bg text-error";
    default:
      return "bg-admin-surface-soft text-admin-text-muted";
  }
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium text-admin-text-muted">
        {label}
      </p>

      <div className="mt-1 text-sm font-semibold leading-5 text-admin-text">
        {value || "—"}
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  icon: Icon,
  children,
  reviewStatus,
  onReviewChange,
}: {
  title: string;
  description?: string;
  icon: React.ElementType;
  children: React.ReactNode;
  reviewStatus?: ReviewStatus;
  onReviewChange?: (status: ReviewStatus) => void;
}) {
  const [reviewMenuOpen, setReviewMenuOpen] = useState(false);

  const status = reviewStatus ?? "PENDING";

  return (
    <section
      className={[
        "overflow-visible rounded-2xl border transition-colors duration-200",
        getReviewCardClasses(status),
      ].join(" ")}
    >
      <div className="relative flex items-start justify-between gap-4 border-b border-admin-border px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-admin-surface-soft text-admin-text-soft">
            <Icon
              aria-hidden="true"
              size={17}
              strokeWidth={1.8}
            />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-admin-text">
              {title}
            </h2>

            {description ? (
              <p className="mt-0.5 text-xs text-admin-text-soft">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {onReviewChange ? (
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() =>
                setReviewMenuOpen((current) => !current)
              }
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-black px-4 text-xs font-bold text-white transition-all hover:bg-black/80"
            >
              {status === "APPROVED" ? (
                <Check
                  aria-hidden="true"
                  size={14}
                  strokeWidth={2.2}
                />
              ) : null}

              {status === "OBSERVED" ? (
                <AlertTriangle
                  aria-hidden="true"
                  size={14}
                  strokeWidth={2}
                />
              ) : null}

              {status === "VALIDATE" ? (
                <ShieldCheck
                  aria-hidden="true"
                  size={14}
                  strokeWidth={2}
                />
              ) : null}

              {getReviewLabel(status)}

              <ChevronRight
                aria-hidden="true"
                size={13}
                className={[
                  "transition-transform",
                  reviewMenuOpen ? "rotate-90" : "",
                ].join(" ")}
              />
            </button>

            {reviewMenuOpen ? (
              <div className="absolute right-0 top-11 z-50 w-[190px] overflow-hidden rounded-2xl border border-admin-border bg-white p-2 shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    onReviewChange("OBSERVED");
                    setReviewMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-red-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                    <AlertTriangle
                      aria-hidden="true"
                      size={15}
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-red-600">
                      Observado
                    </p>
                    <p className="mt-0.5 text-[10px] text-admin-text-muted">
                      Requiere corrección
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onReviewChange("VALIDATE");
                    setReviewMenuOpen(false);
                  }}
                  className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-amber-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <ShieldCheck
                      aria-hidden="true"
                      size={15}
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-amber-700">
                      Validar
                    </p>
                    <p className="mt-0.5 text-[10px] text-admin-text-muted">
                      Requiere revisión
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onReviewChange("APPROVED");
                    setReviewMenuOpen(false);
                  }}
                  className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-emerald-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Check
                      aria-hidden="true"
                      size={15}
                      strokeWidth={2.3}
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-emerald-700">
                      Aprobado
                    </p>
                    <p className="mt-0.5 text-[10px] text-admin-text-muted">
                      Información correcta
                    </p>
                  </div>
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

function ApplicationNavigation({
  previousApplication,
  nextApplication,
}: {
  previousApplication: Application | null;
  nextApplication: Application | null;
}) {
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Link
        href="/dashboard"
        className="inline-flex h-10 w-fit items-center gap-2 text-sm font-semibold text-admin-text-soft transition-colors hover:text-primary-dark"
      >
        <ArrowLeft
          aria-hidden="true"
          size={16}
          strokeWidth={1.9}
        />

        Volver al tablero
      </Link>

      <div className="flex items-center gap-2">
        {previousApplication ? (
          <Link
            href={`/solicitudes/${previousApplication.id}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-admin-border bg-white px-4 text-xs font-bold text-admin-text transition-colors hover:border-primary/30 hover:bg-surface-blue hover:text-primary-dark"
          >
            <ArrowLeft
              aria-hidden="true"
              size={15}
              strokeWidth={1.9}
            />

            Anterior
          </Link>
        ) : (
          <span className="inline-flex h-10 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-admin-border bg-admin-surface-soft px-4 text-xs font-bold text-admin-text-muted opacity-50">
            <ArrowLeft
              aria-hidden="true"
              size={15}
              strokeWidth={1.9}
            />

            Anterior
          </span>
        )}

        {nextApplication ? (
          <Link
            href={`/solicitudes/${nextApplication.id}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-black px-4 text-xs font-bold text-white transition-colors hover:bg-primary-dark"
          >
            Siguiente solicitud

            <ChevronRight
              aria-hidden="true"
              size={15}
              strokeWidth={1.9}
            />
          </Link>
        ) : (
          <span className="inline-flex h-10 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-admin-surface-soft px-4 text-xs font-bold text-admin-text-muted opacity-50">
            Siguiente solicitud

            <ChevronRight
              aria-hidden="true"
              size={15}
              strokeWidth={1.9}
            />
          </span>
        )}
      </div>
    </div>
  );
}

export default function ApplicationDetailView({
  application,
}: ApplicationDetailViewProps) {
  const [applicationInReview, setApplicationInReview] =
    useState(
      application.status === "DOCUMENT_REVIEW" ||
      application.status === "PREAPPROVED" ||
      application.status === "FORMALIZATION",
    );

  const [applicationApproved, setApplicationApproved] =
    useState(
      application.status === "PREAPPROVED" ||
      application.status === "FORMALIZATION",
    );

  const [reviewWorkspaceOpen, setReviewWorkspaceOpen] =
    useState(false);

  const [reviewWorkspaceTab, setReviewWorkspaceTab] =
    useState<ReviewWorkspaceTab>("NOTES");

  const [reviewNoteText, setReviewNoteText] =
    useState("");

  const [reviewReminderText, setReviewReminderText] =
    useState("");

  const [reviewNotes, setReviewNotes] =
    useState<ReviewNote[]>([]);

  const [reviewReminders, setReviewReminders] =
    useState<ReviewReminder[]>([]);

  const reviewWorkspaceStorageKey =
    `kivo-review-workspace-${application.id}`;


  const [reviews, setReviews] =
    useState<ReviewState>({});

  const [documentReviews, setDocumentReviews] =
    useState<Record<
      string,
      "PENDING" | "OBSERVED" | "VALIDATE" | "APPROVED"
    >>({});

  const [selectedDocumentId, setSelectedDocumentId] =
    useState<string | null>(null);

  const selectedDocument =
    application.documents.find(
      (document) => document.id === selectedDocumentId,
    ) ?? null;

  const setDocumentReview = (
    documentId: string,
    status: "PENDING" | "OBSERVED" | "VALIDATE" | "APPROVED",
  ) => {
    setDocumentReviews((current) => ({
      ...current,
      [documentId]: status,
    }));
  };

  const [observationModalOpen, setObservationModalOpen] =
    useState(false);

  const [observedSection, setObservedSection] =
    useState<ReviewSection | null>(null);

  const [observationMessage, setObservationMessage] =
    useState("");

  const [contactChannel, setContactChannel] =
    useState<ContactChannel>("WHATSAPP");

  const [assignModalOpen, setAssignModalOpen] =
    useState(false);

  const [selectedAdvisorId, setSelectedAdvisorId] =
    useState("");

  const [assignedAdvisor, setAssignedAdvisor] =
    useState<string | null>(null);

  const [assignmentMessage, setAssignmentMessage] =
    useState("");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(
        reviewWorkspaceStorageKey,
      );

      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored) as {
        notes?: ReviewNote[];
        reminders?: ReviewReminder[];
      };

      setReviewNotes(
        Array.isArray(parsed.notes)
          ? parsed.notes
          : [],
      );

      setReviewReminders(
        Array.isArray(parsed.reminders)
          ? parsed.reminders
          : [],
      );
    } catch (error) {
      console.error(
        "No se pudo cargar el bloc de revisión:",
        error,
      );
    }
  }, [reviewWorkspaceStorageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        reviewWorkspaceStorageKey,
        JSON.stringify({
          notes: reviewNotes,
          reminders: reviewReminders,
        }),
      );
    } catch (error) {
      console.error(
        "No se pudo guardar el bloc de revisión:",
        error,
      );
    }
  }, [
    reviewNotes,
    reviewReminders,
    reviewWorkspaceStorageKey,
  ]);

  const addReviewNote = () => {
    const value = reviewNoteText.trim();

    if (!value) {
      return;
    }

    setReviewNotes((current) => [
      {
        id: crypto.randomUUID(),
        text: value,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);

    setReviewNoteText("");
  };

  const removeReviewNote = (id: string) => {
    setReviewNotes((current) =>
      current.filter((note) => note.id !== id),
    );
  };

  const addReviewReminder = () => {
    const value = reviewReminderText.trim();

    if (!value) {
      return;
    }

    setReviewReminders((current) => [
      {
        id: crypto.randomUUID(),
        text: value,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);

    setReviewReminderText("");
  };

  const toggleReviewReminder = (id: string) => {
    setReviewReminders((current) =>
      current.map((reminder) =>
        reminder.id === id
          ? {
              ...reminder,
              completed: !reminder.completed,
            }
          : reminder,
      ),
    );
  };

  const removeReviewReminder = (id: string) => {
    setReviewReminders((current) =>
      current.filter(
        (reminder) => reminder.id !== id,
      ),
    );
  };

  const handleReviewChange = (
    section: ReviewSection,
    status: ReviewStatus,
  ) => {
    setReviews((current) => ({
      ...current,
      [section]: status,
    }));

    if (status === "OBSERVED") {
      const sectionLabel =
        REVIEW_SECTION_LABELS[section];

      setObservedSection(section);

      setObservationMessage(
        `Hola ${application.applicant.firstName}, te escribimos de Kivo por tu solicitud ${application.code}. Encontramos una observación en ${sectionLabel}. Por favor, necesitamos que revises o completes esta información para poder continuar con tu solicitud.`,
      );

      setContactChannel("WHATSAPP");
      setObservationModalOpen(true);
    }
  };

  const currentApplicationIndex =
    INITIAL_APPLICATIONS.findIndex(
      (item) => item.id === application.id,
    );

  const previousApplication =
    currentApplicationIndex > 0
      ? INITIAL_APPLICATIONS[currentApplicationIndex - 1]
      : null;

  const nextApplication =
    currentApplicationIndex >= 0 &&
    currentApplicationIndex < INITIAL_APPLICATIONS.length - 1
      ? INITIAL_APPLICATIONS[currentApplicationIndex + 1]
      : null;

  const requiredReviewSections: ReviewSection[] = [
    "PERSONAL_DATA",
    "EMPLOYMENT",
    "LOAN",
    "FINANCIAL",
    "SEGIP",
    "SCORING",
  ];

  const sectionsApproved =
    requiredReviewSections.every(
      (section) => reviews[section] === "APPROVED",
    );

  const documentsApproved =
    application.documents.every((document) => {
      const localStatus =
        documentReviews[document.id];

      return (
        localStatus === "APPROVED" ||
        document.status === "VALIDATED"
      );
    });

  const approvedForAssignment =
    sectionsApproved && documentsApproved;

  const rawPhone =
    application.applicant.phone.replace(/\D/g, "");

  const whatsappPhone = rawPhone.startsWith("591")
    ? rawPhone
    : `591${rawPhone}`;

  const whatsappMessage = encodeURIComponent(
    `Hola ${application.applicant.firstName}, te escribimos de Kivo por tu solicitud ${application.code}. Tenemos información pendiente de revisar contigo. ¿Podemos ayudarte a completarla?`,
  );

  const whatsappUrl =
    `https://wa.me/${whatsappPhone}?text=${whatsappMessage}`;

  const handleAssignAdvisor = () => {
    const advisor = ADVISORS.find(
      (item) => item.id === selectedAdvisorId,
    );

    if (!advisor) {
      return;
    }

    setAssignedAdvisor(advisor.name);
    setAssignmentMessage(
      `Asesor asignado correctamente: ${advisor.name}`,
    );
    setAssignModalOpen(false);
  };

  const handleSendObservation = () => {
    if (!observationMessage.trim()) {
      return;
    }

    const message = observationMessage.trim();

    const rawPhone =
      application.applicant.phone.replace(/\D/g, "");

    const whatsappPhone = rawPhone.startsWith("591")
      ? rawPhone
      : `591${rawPhone}`;

    const whatsappUrl =
      `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;

    const subject = encodeURIComponent(
      `Observación de tu solicitud ${application.code} - Kivo`,
    );

    const body = encodeURIComponent(message);

    const emailUrl =
      `mailto:${application.applicant.email}?subject=${subject}&body=${body}`;

    if (contactChannel === "WHATSAPP") {
      window.open(
        whatsappUrl,
        "_blank",
        "noopener,noreferrer",
      );
    }

    if (contactChannel === "EMAIL") {
      window.location.href = emailUrl;
    }

    if (contactChannel === "BOTH") {
      window.open(
        whatsappUrl,
        "_blank",
        "noopener,noreferrer",
      );

      window.setTimeout(() => {
        window.location.href = emailUrl;
      }, 300);
    }

    setObservationModalOpen(false);
  };

  const totalDeclaredDebt = application.declaredDebts.reduce(
    (total, debt) => total + debt.amount,
    0,
  );

  const completedSteps = application.onboarding.steps.filter(
    (step) => step.status === "COMPLETED",
  ).length;

  return (
    <BackofficeLayout
      title="Expediente del cliente"
      description="Información registrada durante el proceso de onboarding."
    >
      <div className="mx-auto max-w-[1500px] space-y-5">
        <ApplicationNavigation
          previousApplication={previousApplication}
          nextApplication={nextApplication}
        />

        {/* CLIENTE */}
        <section className="overflow-hidden rounded-2xl border border-admin-border bg-white">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-blue text-base font-bold text-primary-dark">
                  {getInitials(application)}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-bold tracking-[-0.02em] text-admin-text">
                      {application.applicant.fullName}
                    </h1>

                    <ApplicationStatusBadge
                      status={application.status}
                      compact
                    />
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-admin-text-soft">
                    <span className="inline-flex items-center gap-1.5">
                      <FileText
                        aria-hidden="true"
                        size={13}
                      />

                      {application.code}
                    </span>

                    <span>
                      CI {application.applicant.identityNumber}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <MapPin
                        aria-hidden="true"
                        size={13}
                      />

                      {application.applicant.city}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="h-[52px] rounded-xl bg-admin-surface-soft px-4 py-2.5">
                  <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-admin-text-muted">
                    Etapa actual
                  </p>

                  <p className="mt-0.5 text-xs font-bold text-admin-text">
                    {application.onboarding.currentStepLabel}
                  </p>
                </div>

                <div className="h-[52px] rounded-xl bg-surface-blue px-4 py-2.5">
                  <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-primary-dark/70">
                    Avance
                  </p>

                  <p className="mt-0.5 text-xs font-bold text-primary-dark">
                    {application.onboarding.progress}%
                  </p>
                </div>

                {!applicationInReview ? (
                  <button
                    type="button"
                    onClick={() =>
                      setApplicationInReview(true)
                    }
                    className="inline-flex h-[52px] items-center justify-center gap-2 rounded-xl bg-black px-5 text-xs font-bold text-white transition-colors hover:bg-primary-dark"
                  >
                    <ShieldCheck
                      aria-hidden="true"
                      size={16}
                      strokeWidth={1.9}
                    />

                    Pasar a revisión
                  </button>
                ) : assignedAdvisor ? (
                  <div className="inline-flex h-[52px] items-center gap-3 rounded-xl bg-surface-blue px-4">
                    <UserRound
                      aria-hidden="true"
                      size={17}
                      strokeWidth={1.9}
                      className="text-primary-dark"
                    />

                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-primary-dark/60">
                        Asignada
                      </p>

                      <p className="mt-0.5 text-xs font-bold text-primary-dark">
                        {assignedAdvisor}
                      </p>
                    </div>
                  </div>
                ) : applicationApproved ? (
                  <>
                    <div className="inline-flex h-[52px] items-center gap-2 rounded-xl bg-emerald-50 px-4 text-emerald-700">
                      <Check
                        aria-hidden="true"
                        size={16}
                        strokeWidth={2.2}
                      />

                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-emerald-600/70">
                          Estado
                        </p>

                        <p className="mt-0.5 text-xs font-bold">
                          Aprobada
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAdvisorId("");
                        setAssignModalOpen(true);
                      }}
                      className="inline-flex h-[52px] items-center justify-center gap-2 rounded-xl bg-black px-5 text-xs font-bold text-white transition-colors hover:bg-primary-dark"
                    >
                      <UserPlus
                        aria-hidden="true"
                        size={16}
                        strokeWidth={1.9}
                      />

                      Asignar asesor
                    </button>
                  </>
                ) : (
                  <>
                    <div className="inline-flex h-[52px] items-center gap-2 rounded-xl bg-amber-50 px-4 text-amber-700">
                      <ShieldCheck
                        aria-hidden="true"
                        size={16}
                        strokeWidth={2}
                      />

                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-amber-600/70">
                          Estado
                        </p>

                        <p className="mt-0.5 text-xs font-bold">
                          En revisión
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!approvedForAssignment}
                      onClick={() =>
                        setApplicationApproved(true)
                      }
                      title={
                        approvedForAssignment
                          ? "Aprobar solicitud"
                          : "Debes aprobar todos los datos y documentos antes de continuar"
                      }
                      className={[
                        "inline-flex h-[52px] items-center justify-center gap-2 rounded-xl px-5 text-xs font-bold transition-colors",
                        approvedForAssignment
                          ? "bg-black text-white hover:bg-primary-dark"
                          : "cursor-not-allowed bg-admin-surface-soft text-admin-text-muted opacity-60",
                      ].join(" ")}
                    >
                      <Check
                        aria-hidden="true"
                        size={16}
                        strokeWidth={2.2}
                      />

                      Aprobar
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-4 border-t border-admin-border pt-5 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem
                label="Celular"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <Phone size={13} aria-hidden="true" />
                    {application.applicant.phone}
                  </span>
                }
              />

              <InfoItem
                label="Correo electrónico"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <Mail size={13} aria-hidden="true" />
                    {application.applicant.email}
                  </span>
                }
              />

              <InfoItem
                label="Edad"
                value={`${application.applicant.age} años`}
              />

              <InfoItem
                label="Responsable"
                value={
                  assignedAdvisor
                    ? assignedAdvisor
                    : "Sin asignar"
                }
              />
            </div>
          </div>
        </section>

        {/* ONBOARDING */}
        <section className="overflow-hidden rounded-2xl border border-admin-border bg-white">
          <div className="flex flex-col gap-3 border-b border-admin-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-sm font-bold text-admin-text">
                Proceso del onboarding
              </h2>

              <p className="mt-0.5 text-xs text-admin-text-soft">
                {completedSteps} de{" "}
                {application.onboarding.steps.length} etapas completadas
              </p>
            </div>

            <p className="text-xs font-bold text-primary-dark">
              {application.onboarding.progress}% completado
            </p>
          </div>

          <div className="overflow-x-auto p-5 sm:p-6">
            <OnboardingTimeline
              steps={application.onboarding.steps}
            />
          </div>

          <div className="border-t border-admin-border bg-admin-surface-soft px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] font-medium text-admin-text-muted">
                  Próxima acción
                </p>

                <p className="mt-1 text-sm font-bold text-admin-text">
                  {application.nextAction}
                </p>

                {application.onboarding.nextPendingField ? (
                  <p className="mt-1 text-xs text-admin-text-soft">
                    Pendiente:{" "}
                    {application.onboarding.nextPendingField}
                  </p>
                ) : null}
              </div>

              <div className="text-xs text-admin-text-soft">
                Responsable:{" "}
                <span className="font-bold text-admin-text">
                  Sin asignar
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* RESUMEN */}
        <div className="grid gap-5 xl:grid-cols-2">
          <Section
            title="Datos personales"
            reviewStatus={reviews.PERSONAL_DATA}
            onReviewChange={(status) =>
              handleReviewChange("PERSONAL_DATA", status)
            }
            description="Información registrada por el cliente."
            icon={UserRound}
          >
            <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <InfoItem
                label="Nombre completo"
                value={application.applicant.fullName}
              />

              <InfoItem
                label="Documento de identidad"
                value={application.applicant.identityNumber}
              />

              <InfoItem
                label="Fecha de nacimiento"
                value={formatDate(
                  application.applicant.birthDate,
                )}
              />

              <InfoItem
                label="Edad"
                value={`${application.applicant.age} años`}
              />

              <InfoItem
                label="Estado civil"
                value={application.applicant.maritalStatus}
              />

              <InfoItem
                label="Tipo de vivienda"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <Home size={14} aria-hidden="true" />
                    {application.applicant.housingType}
                  </span>
                }
              />

              <InfoItem
                label="Ciudad"
                value={application.applicant.city}
              />

              <InfoItem
                label="Personas dependientes"
                value={application.employment.dependents}
              />
            </div>
          </Section>

          <Section
            title="Actividad laboral"
            reviewStatus={reviews.EMPLOYMENT}
            onReviewChange={(status) =>
              handleReviewChange("EMPLOYMENT", status)
            }
            description="Situación e ingresos declarados."
            icon={BriefcaseBusiness}
          >
            <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <InfoItem
                label="Tipo de actividad"
                value={
                  application.employment.activityType ===
                  "SALARIED"
                    ? "Asalariado"
                    : "Independiente"
                }
              />

              <InfoItem
                label={
                  application.employment.activityType ===
                  "SALARIED"
                    ? "Empresa"
                    : "Actividad"
                }
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 size={14} aria-hidden="true" />
                    {application.employment.companyOrActivity}
                  </span>
                }
              />

              <InfoItem
                label={
                  application.employment.activityType ===
                  "SALARIED"
                    ? "Cargo"
                    : "Ocupación"
                }
                value={
                  application.employment.positionOrOccupation
                }
              />

              <InfoItem
                label="Antigüedad"
                value={formatMonths(
                  application.employment.jobSeniorityMonths,
                )}
              />

              <InfoItem
                label="Ingreso neto mensual"
                value={formatCurrency(
                  application.employment.monthlyNetIncome,
                )}
              />

              <InfoItem
                label="Dependientes"
                value={application.employment.dependents}
              />
            </div>
          </Section>

          <Section
            title="Préstamo solicitado"
            reviewStatus={reviews.LOAN}
            onReviewChange={(status) =>
              handleReviewChange("LOAN", status)
            }
            description="Condiciones calculadas durante la simulación."
            icon={CircleDollarSign}
          >
            <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <InfoItem
                label="Monto solicitado"
                value={formatCurrency(
                  application.loan.requestedAmount,
                )}
              />

              <InfoItem
                label="Plazo"
                value={`${application.loan.termMonths} meses`}
              />

              <InfoItem
                label="Cuota estimada"
                value={formatCurrency(
                  application.loan.estimatedInstallment,
                )}
              />

              <InfoItem
                label="Día de pago"
                value={`Día ${application.loan.paymentDay}`}
              />

              <InfoItem
                label="Tasa anual"
                value={`${application.loan.annualInterestRate}%`}
              />

              <InfoItem
                label="Destino del préstamo"
                value={application.loanPurpose}
              />
            </div>
          </Section>

          <Section
            title="Capacidad financiera"
            reviewStatus={reviews.FINANCIAL}
            onReviewChange={(status) =>
              handleReviewChange("FINANCIAL", status)
            }
            description="Resumen de ingresos, deudas y capacidad de pago."
            icon={WalletCards}
          >
            <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <InfoItem
                label="Ingreso mensual"
                value={formatCurrency(
                  application.employment.monthlyNetIncome,
                )}
              />

              <InfoItem
                label="Deuda declarada"
                value={formatCurrency(totalDeclaredDebt)}
              />

              <InfoItem
                label="Relación deuda / ingreso"
                value={`${application.loan.debtToIncomeRatio}%`}
              />

              <InfoItem
                label="Capacidad residual"
                value={formatCurrency(
                  application.loan.residualCapacity,
                )}
              />

              <InfoItem
                label="Resultado"
                value={
                  application.loan.paymentCapacityResult ===
                  "VIABLE"
                    ? "Viable"
                    : application.loan.paymentCapacityResult ===
                        "REVIEW"
                      ? "Requiere revisión"
                      : "No viable"
                }
              />

              <InfoItem
                label="Extractos disponibles"
                value={
                  application.hasBankStatementsAvailable
                    ? "Sí"
                    : "No"
                }
              />
            </div>

            {application.declaredDebts.length > 0 ? (
              <div className="mt-5 border-t border-admin-border pt-5">
                <p className="mb-3 text-xs font-bold text-admin-text">
                  Deudas declaradas
                </p>

                <div className="space-y-2">
                  {application.declaredDebts.map((debt) => (
                    <div
                      key={debt.id}
                      className="flex items-center justify-between gap-4 rounded-xl bg-admin-surface-soft px-4 py-3"
                    >
                      <span className="text-xs font-medium text-admin-text-soft">
                        {debt.entity}
                      </span>

                      <span className="text-sm font-bold text-admin-text">
                        {formatCurrency(debt.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </Section>
        </div>

        {/* DOCUMENTACIÓN */}
        <section className="overflow-hidden rounded-2xl border border-admin-border bg-white">
          <div className="flex items-start gap-3 border-b border-admin-border px-5 py-4 sm:px-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-admin-surface-soft text-admin-text-soft">
              <FileCheck2
                aria-hidden="true"
                size={17}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <h2 className="text-sm font-bold text-admin-text">
                Documentación
              </h2>

              <p className="mt-0.5 text-xs text-admin-text-soft">
                Selecciona un documento para revisarlo.
              </p>
            </div>
          </div>

          <div className="divide-y divide-admin-border px-5 sm:px-6">
            {application.documents.map((document) => {
              const reviewStatus =
                documentReviews[document.id] ?? "PENDING";

              const statusLabel =
                reviewStatus === "OBSERVED"
                  ? "Observado"
                  : reviewStatus === "VALIDATE"
                    ? "Validar"
                    : reviewStatus === "APPROVED"
                      ? "Aprobado"
                      : DOCUMENT_STATUS_LABELS[document.status];

              const statusClasses =
                reviewStatus === "OBSERVED"
                  ? "bg-red-50 text-red-600"
                  : reviewStatus === "VALIDATE"
                    ? "bg-amber-50 text-amber-700"
                    : reviewStatus === "APPROVED"
                      ? "bg-emerald-50 text-emerald-700"
                      : getDocumentStatusClasses(document.status);

              return (
                <button
                  key={document.id}
                  type="button"
                  onClick={() =>
                    setSelectedDocumentId(document.id)
                  }
                  className="group flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:bg-admin-surface-soft/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-admin-surface-soft text-admin-text-soft transition-colors group-hover:bg-surface-blue group-hover:text-primary-dark">
                      <FileText
                        aria-hidden="true"
                        size={17}
                        strokeWidth={1.8}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-admin-text">
                        {document.name}
                      </p>

                      <p className="mt-0.5 text-xs text-admin-text-muted">
                        {document.uploadedAt
                          ? `Cargado ${formatDate(
                              document.uploadedAt,
                            )}`
                          : "Documento pendiente"}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={[
                        "inline-flex rounded-full px-3 py-1.5 text-xs font-bold",
                        statusClasses,
                      ].join(" ")}
                    >
                      {statusLabel}
                    </span>

                    <ChevronRight
                      aria-hidden="true"
                      size={16}
                      className="text-admin-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary-dark"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {selectedDocument ? (
          <Modal
            open
            title={selectedDocument.name}
            description={`Revisión del documento de ${application.applicant.fullName}.`}
            size="lg"
            onClose={() => setSelectedDocumentId(null)}
            footer={
              <div className="flex w-full justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedDocumentId(null)
                  }
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-black px-5 text-sm font-bold text-white transition-colors hover:bg-black/80"
                >
                  Cerrar
                </button>
              </div>
            }
          >
            <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
              <div className="border-b border-admin-border p-5 sm:p-6 lg:border-b-0 lg:border-r">
                <div className="flex min-h-[430px] items-center justify-center rounded-2xl bg-admin-surface-soft">
                  <div className="max-w-xs text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-primary-dark shadow-sm">
                      <FileText
                        aria-hidden="true"
                        size={30}
                        strokeWidth={1.5}
                      />
                    </div>

                    <p className="mt-4 text-sm font-bold text-admin-text">
                      Vista previa del documento
                    </p>

                    <p className="mt-1 text-xs leading-5 text-admin-text-soft">
                      Aquí se mostrará el archivo original cargado por el cliente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-admin-text-muted">
                  Información
                </p>

                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs text-admin-text-muted">
                      Documento
                    </p>

                    <p className="mt-1 text-sm font-bold text-admin-text">
                      {selectedDocument.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-admin-text-muted">
                      Estado actual
                    </p>

                    <p className="mt-1 text-sm font-bold text-admin-text">
                      {DOCUMENT_STATUS_LABELS[
                        selectedDocument.status
                      ]}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-admin-text-muted">
                      Fecha de carga
                    </p>

                    <p className="mt-1 text-sm font-bold text-admin-text">
                      {formatDate(
                        selectedDocument.uploadedAt,
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-admin-border pt-5">
                  <p className="text-xs font-bold text-admin-text">
                    Validación
                  </p>

                  <div className="mt-3 space-y-2">
                    <button
                      type="button"
                      onClick={() =>
                        setDocumentReview(
                          selectedDocument.id,
                          "OBSERVED",
                        )
                      }
                      className="flex h-11 w-full items-center gap-3 rounded-xl bg-red-50 px-4 text-sm font-bold text-red-600 transition-colors hover:bg-red-100"
                    >
                      <AlertTriangle
                        aria-hidden="true"
                        size={17}
                      />

                      Observado
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setDocumentReview(
                          selectedDocument.id,
                          "VALIDATE",
                        )
                      }
                      className="flex h-11 w-full items-center gap-3 rounded-xl bg-amber-50 px-4 text-sm font-bold text-amber-700 transition-colors hover:bg-amber-100"
                    >
                      <ShieldCheck
                        aria-hidden="true"
                        size={17}
                      />

                      Validar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setDocumentReview(
                          selectedDocument.id,
                          "APPROVED",
                        )
                      }
                      className="flex h-11 w-full items-center gap-3 rounded-xl bg-emerald-50 px-4 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
                    >
                      <Check
                        aria-hidden="true"
                        size={17}
                        strokeWidth={2.2}
                      />

                      Aprobado
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        ) : null}

        {/* VALIDACIONES */}
        <div className="grid gap-5 xl:grid-cols-2">
          <Section
            title="Validación SEGIP"
            reviewStatus={reviews.SEGIP}
            onReviewChange={(status) =>
              handleReviewChange("SEGIP", status)
            }
            description="Verificación de identidad del cliente."
            icon={ShieldCheck}
          >
            <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <InfoItem
                label="Estado"
                value={
                  SEGIP_STATUS_LABELS[
                    application.segip.status
                  ]
                }
              />

              <InfoItem
                label="Fecha de consulta"
                value={formatDate(
                  application.segip.checkedAt,
                )}
              />

              <InfoItem
                label="Número de CI"
                value={
                  application.segip.identityNumberMatches ===
                  null
                    ? "Pendiente"
                    : application.segip.identityNumberMatches
                      ? "Coincide"
                      : "No coincide"
                }
              />

              <InfoItem
                label="Nombre completo"
                value={
                  application.segip.fullNameMatches === null
                    ? "Pendiente"
                    : application.segip.fullNameMatches
                      ? "Coincide"
                      : "No coincide"
                }
              />
            </div>

            {application.segip.differences.length > 0 ? (
              <div className="mt-5 rounded-xl bg-error-bg p-4">
                <div className="flex gap-2">
                  <AlertTriangle
                    aria-hidden="true"
                    size={16}
                    className="mt-0.5 shrink-0 text-error"
                  />

                  <div>
                    <p className="text-xs font-bold text-error">
                      Diferencias encontradas
                    </p>

                    {application.segip.differences.map(
                      (difference) => (
                        <p
                          key={difference}
                          className="mt-1 text-xs text-error"
                        >
                          {difference}
                        </p>
                      ),
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </Section>

          <Section
            title="Scoring"
            reviewStatus={reviews.SCORING}
            onReviewChange={(status) =>
              handleReviewChange("SCORING", status)
            }
            description="Evaluación del perfil crediticio."
            icon={Landmark}
          >
            <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <InfoItem
                label="Estado"
                value={
                  SCORING_STATUS_LABELS[
                    application.scoring.status
                  ]
                }
              />

              <InfoItem
                label="Score"
                value={
                  application.scoring.score ?? "Pendiente"
                }
              />

              <InfoItem
                label="Autorización BIC"
                value={
                  application.scoring.authorizedForBureau
                    ? "Autorizada"
                    : "Pendiente"
                }
              />

              <InfoItem
                label="Identidad validada"
                value={
                  application.scoring.identityValidated
                    ? "Sí"
                    : "Pendiente"
                }
              />

              <InfoItem
                label="PDF INFOCRED"
                value={
                  application.scoring.pdfFileName ??
                  "Pendiente de carga"
                }
              />

              <InfoItem
                label="Resultado"
                value={
                  application.scoring.result === "APPROVE"
                    ? "Aprobar"
                    : application.scoring.result === "REVIEW"
                      ? "Revisar"
                      : application.scoring.result === "REJECT"
                        ? "Rechazar"
                        : "Pendiente"
                }
              />
            </div>

            {application.scoring.reasons.length > 0 ? (
              <div className="mt-5 border-t border-admin-border pt-5">
                <p className="text-xs font-bold text-admin-text">
                  Observaciones del scoring
                </p>

                <div className="mt-2 space-y-2">
                  {application.scoring.reasons.map((reason) => (
                    <div
                      key={reason}
                      className="flex items-start gap-2 text-xs text-admin-text-soft"
                    >
                      <ChevronRight
                        aria-hidden="true"
                        size={14}
                        className="mt-0.5 shrink-0"
                      />

                      {reason}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </Section>
        </div>

        {applicationInReview &&
        !applicationApproved &&
        !assignedAdvisor ? (
          <>
            {!reviewWorkspaceOpen ? (
              <button
                type="button"
                onClick={() =>
                  setReviewWorkspaceOpen(true)
                }
                className="fixed bottom-6 right-6 z-40 inline-flex h-12 items-center gap-2 rounded-2xl bg-black px-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-primary-dark"
              >
                <NotebookPen
                  aria-hidden="true"
                  size={18}
                  strokeWidth={1.9}
                />

                Notas

                {(reviewNotes.length +
                  reviewReminders.filter(
                    (item) => !item.completed,
                  ).length) > 0 ? (
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                    {reviewNotes.length +
                      reviewReminders.filter(
                        (item) => !item.completed,
                      ).length}
                  </span>
                ) : null}
              </button>
            ) : null}

            <div
              className={[
                "fixed inset-0 z-50 transition-opacity",
                reviewWorkspaceOpen
                  ? "pointer-events-auto"
                  : "pointer-events-none",
              ].join(" ")}
            >
              <button
                type="button"
                aria-label="Cerrar panel"
                onClick={() =>
                  setReviewWorkspaceOpen(false)
                }
                className={[
                  "absolute inset-0 bg-black/20 transition-opacity lg:bg-black/10",
                  reviewWorkspaceOpen
                    ? "opacity-100"
                    : "opacity-0",
                ].join(" ")}
              />

              <aside
                className={[
                  "absolute bottom-0 right-0 top-0 flex w-full max-w-[420px] flex-col bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.12)] transition-transform duration-300",
                  reviewWorkspaceOpen
                    ? "translate-x-0"
                    : "translate-x-full",
                ].join(" ")}
              >
                <div className="flex items-center justify-between border-b border-admin-border px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-blue text-primary-dark">
                      <NotebookPen
                        aria-hidden="true"
                        size={18}
                        strokeWidth={1.9}
                      />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-admin-text">
                        Espacio de revisión
                      </p>

                      <p className="mt-0.5 text-xs text-admin-text-soft">
                        {application.applicant.fullName}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setReviewWorkspaceOpen(false)
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-admin-text-soft transition-colors hover:bg-admin-surface-soft hover:text-admin-text"
                  >
                    <X
                      aria-hidden="true"
                      size={18}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1 border-b border-admin-border p-2">
                  <button
                    type="button"
                    onClick={() =>
                      setReviewWorkspaceTab("NOTES")
                    }
                    className={[
                      "flex h-10 items-center justify-center gap-2 rounded-xl text-xs font-bold transition-colors",
                      reviewWorkspaceTab === "NOTES"
                        ? "bg-black text-white"
                        : "text-admin-text-soft hover:bg-admin-surface-soft",
                    ].join(" ")}
                  >
                    <NotebookPen
                      aria-hidden="true"
                      size={15}
                    />

                    Notas

                    {reviewNotes.length > 0 ? (
                      <span className="opacity-70">
                        {reviewNotes.length}
                      </span>
                    ) : null}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setReviewWorkspaceTab(
                        "REMINDERS",
                      )
                    }
                    className={[
                      "flex h-10 items-center justify-center gap-2 rounded-xl text-xs font-bold transition-colors",
                      reviewWorkspaceTab ===
                      "REMINDERS"
                        ? "bg-black text-white"
                        : "text-admin-text-soft hover:bg-admin-surface-soft",
                    ].join(" ")}
                  >
                    <Bell
                      aria-hidden="true"
                      size={15}
                    />

                    Recordatorios

                    {reviewReminders.filter(
                      (item) => !item.completed,
                    ).length > 0 ? (
                      <span className="opacity-70">
                        {
                          reviewReminders.filter(
                            (item) =>
                              !item.completed,
                          ).length
                        }
                      </span>
                    ) : null}
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                  {reviewWorkspaceTab === "NOTES" ? (
                    <div className="p-5">
                      <label className="text-xs font-bold text-admin-text">
                        Nueva nota
                      </label>

                      <textarea
                        value={reviewNoteText}
                        onChange={(event) =>
                          setReviewNoteText(
                            event.target.value,
                          )
                        }
                        rows={4}
                        placeholder="Escribe una nota interna sobre esta solicitud..."
                        className="mt-2 w-full resize-none rounded-2xl border border-admin-border bg-white px-4 py-3 text-sm leading-6 text-admin-text outline-none transition-colors placeholder:text-admin-text-muted focus:border-primary"
                      />

                      <button
                        type="button"
                        disabled={!reviewNoteText.trim()}
                        onClick={addReviewNote}
                        className="mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-black px-4 text-xs font-bold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Plus
                          aria-hidden="true"
                          size={15}
                        />

                        Agregar nota
                      </button>

                      <div className="mt-6 space-y-3">
                        {reviewNotes.length === 0 ? (
                          <div className="rounded-2xl bg-admin-surface-soft px-5 py-8 text-center">
                            <NotebookPen
                              aria-hidden="true"
                              size={22}
                              className="mx-auto text-admin-text-muted"
                            />

                            <p className="mt-3 text-sm font-bold text-admin-text">
                              Sin notas todavía
                            </p>

                            <p className="mt-1 text-xs text-admin-text-soft">
                              Usa este espacio para registrar información interna.
                            </p>
                          </div>
                        ) : (
                          reviewNotes.map((note) => (
                            <article
                              key={note.id}
                              className="rounded-2xl border border-admin-border bg-white p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <p className="whitespace-pre-wrap text-sm leading-6 text-admin-text">
                                  {note.text}
                                </p>

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeReviewNote(
                                      note.id,
                                    )
                                  }
                                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-admin-text-muted transition-colors hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2
                                    aria-hidden="true"
                                    size={14}
                                  />
                                </button>
                              </div>

                              <p className="mt-3 text-[10px] text-admin-text-muted">
                                {new Intl.DateTimeFormat(
                                  "es-BO",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    timeZone:
                                      "America/La_Paz",
                                  },
                                ).format(
                                  new Date(
                                    note.createdAt,
                                  ),
                                )}
                              </p>
                            </article>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-5">
                      <label className="text-xs font-bold text-admin-text">
                        Nuevo recordatorio
                      </label>

                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          value={reviewReminderText}
                          onChange={(event) =>
                            setReviewReminderText(
                              event.target.value,
                            )
                          }
                          onKeyDown={(event) => {
                            if (
                              event.key === "Enter"
                            ) {
                              addReviewReminder();
                            }
                          }}
                          placeholder="Ej. Llamar al cliente mañana"
                          className="h-11 min-w-0 flex-1 rounded-xl border border-admin-border bg-white px-4 text-sm text-admin-text outline-none placeholder:text-admin-text-muted focus:border-primary"
                        />

                        <button
                          type="button"
                          disabled={
                            !reviewReminderText.trim()
                          }
                          onClick={addReviewReminder}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus
                            aria-hidden="true"
                            size={17}
                          />
                        </button>
                      </div>

                      <div className="mt-6 space-y-2">
                        {reviewReminders.length ===
                        0 ? (
                          <div className="rounded-2xl bg-admin-surface-soft px-5 py-8 text-center">
                            <Bell
                              aria-hidden="true"
                              size={22}
                              className="mx-auto text-admin-text-muted"
                            />

                            <p className="mt-3 text-sm font-bold text-admin-text">
                              Sin recordatorios
                            </p>

                            <p className="mt-1 text-xs text-admin-text-soft">
                              Agrega pendientes internos para esta solicitud.
                            </p>
                          </div>
                        ) : (
                          reviewReminders.map(
                            (reminder) => (
                              <article
                                key={reminder.id}
                                className={[
                                  "flex items-start gap-3 rounded-2xl border p-4 transition-colors",
                                  reminder.completed
                                    ? "border-emerald-100 bg-emerald-50/40"
                                    : "border-admin-border bg-white",
                                ].join(" ")}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleReviewReminder(
                                      reminder.id,
                                    )
                                  }
                                  className={[
                                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                                    reminder.completed
                                      ? "border-emerald-500 bg-emerald-500 text-white"
                                      : "border-admin-border bg-white",
                                  ].join(" ")}
                                >
                                  {reminder.completed ? (
                                    <Check
                                      aria-hidden="true"
                                      size={12}
                                      strokeWidth={2.5}
                                    />
                                  ) : null}
                                </button>

                                <div className="min-w-0 flex-1">
                                  <p
                                    className={[
                                      "text-sm leading-5",
                                      reminder.completed
                                        ? "text-admin-text-muted line-through"
                                        : "font-medium text-admin-text",
                                    ].join(" ")}
                                  >
                                    {reminder.text}
                                  </p>

                                  <p className="mt-1.5 text-[10px] text-admin-text-muted">
                                    {new Intl.DateTimeFormat(
                                      "es-BO",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        timeZone:
                                          "America/La_Paz",
                                      },
                                    ).format(
                                      new Date(
                                        reminder.createdAt,
                                      ),
                                    )}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeReviewReminder(
                                      reminder.id,
                                    )
                                  }
                                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-admin-text-muted transition-colors hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2
                                    aria-hidden="true"
                                    size={14}
                                  />
                                </button>
                              </article>
                            ),
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-admin-border bg-admin-surface-soft px-5 py-3">
                  <p className="text-[10px] leading-4 text-admin-text-muted">
                    Notas internas de Gestión de Clientes. El solicitante no puede ver esta información.
                  </p>
                </div>
              </aside>
            </div>
          </>
        ) : null}

        <div className="border-t border-admin-border pt-5">
          <ApplicationNavigation
            previousApplication={previousApplication}
            nextApplication={nextApplication}
          />
        </div>

        {assignModalOpen ? (
          <Modal
            open
            title="Asignar asesor"
            description={`Selecciona el asesor que continuará con la solicitud de ${application.applicant.fullName}.`}
            size="sm"
            onClose={() => setAssignModalOpen(false)}
            footer={
              <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-admin-border bg-white px-5 text-sm font-bold text-admin-text"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  disabled={!selectedAdvisorId}
                  onClick={handleAssignAdvisor}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-black px-5 text-sm font-bold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Asignar asesor
                </button>
              </div>
            }
          >
            <div className="p-5 sm:p-6">
              <p className="text-xs font-semibold text-admin-text-soft">
                Asesores disponibles
              </p>

              <div className="mt-3 space-y-2">
                {ADVISORS.map((advisor) => {
                  const selected =
                    selectedAdvisorId === advisor.id;

                  return (
                    <button
                      key={advisor.id}
                      type="button"
                      onClick={() =>
                        setSelectedAdvisorId(advisor.id)
                      }
                      className={[
                        "flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition-colors",
                        selected
                          ? "border-primary bg-surface-blue"
                          : "border-admin-border bg-white hover:bg-admin-surface-soft",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={[
                            "flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold",
                            selected
                              ? "bg-primary text-white"
                              : "bg-admin-surface-soft text-admin-text",
                          ].join(" ")}
                        >
                          {advisor.name
                            .split(" ")
                            .slice(0, 2)
                            .map((part) => part.charAt(0))
                            .join("")}
                        </div>

                        <div>
                          <p className="text-sm font-bold text-admin-text">
                            {advisor.name}
                          </p>

                          <p className="mt-0.5 text-xs text-admin-text-soft">
                            Asesor de préstamos
                          </p>
                        </div>
                      </div>

                      <div
                        className={[
                          "flex h-5 w-5 items-center justify-center rounded-full border",
                          selected
                            ? "border-primary bg-primary"
                            : "border-admin-border bg-white",
                        ].join(" ")}
                      >
                        {selected ? (
                          <Check
                            aria-hidden="true"
                            size={12}
                            strokeWidth={2.5}
                            className="text-white"
                          />
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-xl bg-admin-surface-soft px-4 py-3">
                <p className="text-xs leading-5 text-admin-text-soft">
                  El asesor seleccionado quedará a cargo de continuar la gestión de esta solicitud.
                </p>
              </div>
            </div>
          </Modal>
        ) : null}

        {observationModalOpen && observedSection ? (
          <Modal
            open
            title="Comunicar observación"
            description={`Informa al cliente sobre la observación en ${REVIEW_SECTION_LABELS[observedSection]}.`}
            size="md"
            onClose={() => setObservationModalOpen(false)}
            footer={
              <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setObservationModalOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-admin-border bg-white px-5 text-sm font-bold text-admin-text transition-colors hover:bg-admin-surface-soft"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  disabled={!observationMessage.trim()}
                  onClick={handleSendObservation}
                  className={[
                    "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-40",
                    contactChannel === "WHATSAPP"
                      ? "bg-[#25D366] hover:bg-[#1FBC5A]"
                      : contactChannel === "EMAIL"
                        ? "bg-black hover:bg-primary-dark"
                        : "bg-primary text-white hover:bg-primary-dark",
                  ].join(" ")}
                >
                  {contactChannel === "WHATSAPP" ? (
                    <MessageCircle
                      aria-hidden="true"
                      size={17}
                      strokeWidth={1.9}
                    />
                  ) : (
                    <Mail
                      aria-hidden="true"
                      size={17}
                      strokeWidth={1.9}
                    />
                  )}

                  {contactChannel === "WHATSAPP"
                    ? "Enviar por WhatsApp"
                    : contactChannel === "EMAIL"
                      ? "Enviar por correo"
                      : "Enviar por ambos"}
                </button>
              </div>
            }
          >
            <div className="p-5 sm:p-6">
              <div className="rounded-2xl bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-red-600">
                    <AlertTriangle
                      aria-hidden="true"
                      size={17}
                      strokeWidth={1.9}
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-red-600">
                      Observación registrada
                    </p>

                    <p className="mt-1 text-sm font-bold text-admin-text">
                      {REVIEW_SECTION_LABELS[observedSection]}
                    </p>

                    <p className="mt-1 text-xs text-admin-text-soft">
                      {application.applicant.fullName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-bold text-admin-text">
                  Enviar mediante
                </p>

                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() =>
                      setContactChannel("WHATSAPP")
                    }
                    className={[
                      "flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-bold transition-colors",
                      contactChannel === "WHATSAPP"
                        ? "border-[#25D366] bg-[#EAFBF0] text-[#168C43]"
                        : "border-admin-border bg-white text-admin-text-soft hover:bg-admin-surface-soft",
                    ].join(" ")}
                  >
                    <MessageCircle
                      aria-hidden="true"
                      size={17}
                      strokeWidth={1.9}
                    />

                    WhatsApp
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setContactChannel("EMAIL")
                    }
                    className={[
                      "flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-bold transition-colors",
                      contactChannel === "EMAIL"
                        ? "border-black bg-black text-white"
                        : "border-admin-border bg-white text-admin-text-soft hover:bg-admin-surface-soft",
                    ].join(" ")}
                  >
                    <Mail
                      aria-hidden="true"
                      size={17}
                      strokeWidth={1.9}
                    />

                    Correo
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setContactChannel("BOTH")
                    }
                    className={[
                      "flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-bold transition-colors",
                      contactChannel === "BOTH"
                        ? "border-primary bg-surface-blue text-primary-dark"
                        : "border-admin-border bg-white text-admin-text-soft hover:bg-admin-surface-soft",
                    ].join(" ")}
                  >
                    <MessageCircle
                      aria-hidden="true"
                      size={16}
                      strokeWidth={1.9}
                    />

                    <Mail
                      aria-hidden="true"
                      size={16}
                      strokeWidth={1.9}
                    />

                    Ambos
                  </button>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="observationMessage"
                    className="text-xs font-bold text-admin-text"
                  >
                    Mensaje al cliente
                  </label>

                  <span className="text-[10px] text-admin-text-muted">
                    Puedes editarlo antes de enviarlo
                  </span>
                </div>

                <textarea
                  id="observationMessage"
                  value={observationMessage}
                  onChange={(event) =>
                    setObservationMessage(event.target.value)
                  }
                  rows={7}
                  className="mt-2 w-full resize-none rounded-2xl border border-admin-border bg-white px-4 py-3 text-sm leading-6 text-admin-text outline-none transition-colors placeholder:text-admin-text-muted focus:border-primary"
                  placeholder="Escribe el mensaje para el cliente..."
                />
              </div>

              <div className="mt-4 rounded-xl bg-admin-surface-soft px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-admin-text-muted">
                  Destinatario
                </p>

                {contactChannel === "WHATSAPP" ? (
                  <p className="mt-1 text-sm font-bold text-admin-text">
                    {application.applicant.phone}
                  </p>
                ) : contactChannel === "EMAIL" ? (
                  <p className="mt-1 text-sm font-bold text-admin-text">
                    {application.applicant.email}
                  </p>
                ) : (
                  <div className="mt-1 space-y-1">
                    <p className="text-sm font-bold text-admin-text">
                      {application.applicant.phone}
                    </p>

                    <p className="text-sm font-bold text-admin-text">
                      {application.applicant.email}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Modal>
        ) : null}

      </div>
    </BackofficeLayout>
  );
}
