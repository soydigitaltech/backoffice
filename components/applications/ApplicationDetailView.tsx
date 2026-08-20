"use client";

import IdentityDocumentCarousel from "@/components/applications/IdentityDocumentCarousel";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  FileCheck2,
  FileText,
  Home,
  Mail,
  MessageCircle,
  ShieldCheck,
  UserRound,
  WalletCards,
  Bell,
  NotebookPen,
  Pencil,
  Plus,
  Trash2,
  X,} from "lucide-react";

import BackofficeLayout from "@/components/layout/BackofficeLayout";
import { INITIAL_APPLICATIONS } from "@/mocks/applications";
import Modal from "@/components/ui/Modal";
import {
  DOCUMENT_STATUS_LABELS,
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
  | "DOCUMENTS";

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
};


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
      return "bg-surface-blue text-[#1B5BB6]";
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
  open,
  onToggle,
}: {
  title: string;
  description?: string;
  icon: React.ElementType;
  children: React.ReactNode;
  reviewStatus?: ReviewStatus;
  onReviewChange?: (status: ReviewStatus) => void;
  open: boolean;
  onToggle: () => void;
}) {
  const [reviewMenuOpen, setReviewMenuOpen] = useState(false);
  const reviewMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!reviewMenuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        reviewMenuRef.current &&
        !reviewMenuRef.current.contains(event.target as Node)
      ) {
        setReviewMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, [reviewMenuOpen]);

  const status = reviewStatus ?? "PENDING";

  return (
    <section
      className={[
        "relative overflow-visible rounded-2xl border transition-all duration-200 ease-out",
        reviewMenuOpen ? "z-40" : "z-0",
        open
          ? "border-[#03AEFE]/35 shadow-[0_6px_24px_rgba(0,0,0,0.04)]"
          : "hover:border-[#03AEFE]/30",
        getReviewCardClasses(status),
      ].join(" ")}
    >
      <div
        className={[
          "group relative flex items-start justify-between gap-4 border-b border-admin-border px-5 py-4 transition-all duration-200 ease-out sm:px-6",
          open
            ? "bg-[#DFF4FF]"
            : "hover:bg-[#EAF7FF]",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 text-left"
        >
          <div
            className={[
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ease-out",
              open
                ? "scale-[1.03] bg-[#03AEFE] text-white shadow-sm"
                : "bg-admin-surface-soft text-admin-text-soft group-hover:bg-[#03AEFE] group-hover:text-white",
            ].join(" ")}
          >
            <Icon
              aria-hidden="true"
              size={17}
              strokeWidth={1.8}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-admin-text">
                {title}
              </h2>

              <ChevronDown
                aria-hidden="true"
                size={15}
                className={[
                  "shrink-0 transition-all duration-200 ease-out",
                  open
                    ? "rotate-180 text-[#1B5BB6]"
                    : "text-admin-text-muted group-hover:translate-y-0.5 group-hover:text-[#1B5BB6]",
                ].join(" ")}
              />
            </div>

            {description ? (
              <p className="mt-0.5 text-xs text-admin-text-soft">
                {description}
              </p>
            ) : null}
          </div>
        </button>

        {onReviewChange ? (
          <div
            ref={reviewMenuRef}
            className={[
              "relative shrink-0",
              reviewMenuOpen ? "z-50" : "z-10",
            ].join(" ")}
          >
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
              <div className="absolute right-0 top-11 z-[100] w-[210px] overflow-hidden rounded-2xl border border-admin-border bg-white p-2 shadow-[0_16px_45px_rgba(15,23,42,0.16)]">
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

      <div
        className={[
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
          open
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="overflow-hidden">
          <div
            className={[
              "p-5 transition-transform duration-300 ease-out sm:p-6",
              open ? "translate-y-0" : "-translate-y-1.5",
            ].join(" ")}
          >
            {children}
          </div>
        </div>
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
        className="inline-flex h-10 w-fit items-center gap-2 text-sm font-semibold text-admin-text-soft transition-colors hover:text-[#1B5BB6]"
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
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-admin-border bg-white px-4 text-xs font-bold text-admin-text transition-colors hover:border-primary/30 hover:bg-surface-blue hover:text-[#1B5BB6]"
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
  const [openAccordion, setOpenAccordion] =
    useState<string | null>(null);

  const toggleAccordion = (key: string) => {
    setOpenAccordion((current) =>
      current === key ? null : key,
    );
  };
  const [editableApplicant, setEditableApplicant] = useState({
    fullName: application.applicant.fullName,
    birthDate: application.applicant.birthDate ?? "",
    identityNumber: application.applicant.identityNumber,
  });

  const [editingPersonalData, setEditingPersonalData] =
    useState(false);

  const [applicationInReview, setApplicationInReview] =
    useState(
      application.status === "DOCUMENT_REVIEW" ||
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

  const [identityViewerOpen, setIdentityViewerOpen] =
    useState(false);

  const [
    identityViewerDocumentId,
    setIdentityViewerDocumentId,
  ] = useState<string | null>(null);

  const [documentReviews, setDocumentReviews] =
    useState<Record<
      string,
      "PENDING" | "OBSERVED" | "VALIDATE" | "APPROVED"
    >>({});
const [creditReportFile, setCreditReportFile] =
    useState<File | null>(null);



  const identityDocuments =
    application.documents.filter((document) =>
      ["ID_FRONT", "ID_BACK", "SELFIE"].includes(
        document.type,
      ),
    );

  const openIdentityViewer = (documentId: string) => {
    setIdentityViewerDocumentId(documentId);
    setIdentityViewerOpen(true);
  };

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

      const notes = Array.isArray(parsed.notes)
        ? parsed.notes
        : [];

      const reminders = Array.isArray(parsed.reminders)
        ? parsed.reminders
        : [];

      const timeoutId = window.setTimeout(() => {
        setReviewNotes(notes);
        setReviewReminders(reminders);
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
      };
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

  const readyForReview =
    sectionsApproved && documentsApproved;

  const approvedSectionsCount =
    requiredReviewSections.filter(
      (section) => reviews[section] === "APPROVED",
    ).length;

  const approvedDocumentsCount =
    application.documents.filter((document) => {
      const localStatus = documentReviews[document.id];

      return (
        localStatus === "APPROVED" ||
        document.status === "VALIDATED"
      );
    }).length;

  const totalValidationItems =
    requiredReviewSections.length +
    application.documents.length;

  const approvedValidationItems =
    approvedSectionsCount + approvedDocumentsCount;

  const pendingValidationItems =
    totalValidationItems - approvedValidationItems;

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
        <section className="rounded-2xl border border-admin-border bg-white">
          <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-blue text-base font-bold text-[#1B5BB6]">
                {getInitials(application)}
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold tracking-[-0.02em] text-admin-text">
                  {application.applicant.fullName}
                </h1>
              </div>
            </div>

            
          </div>
        </section>

        {/* EXPEDIENTE DE VALIDACIÓN */}
        <div className="grid gap-5 xl:grid-cols-2">
          <section className="overflow-visible rounded-2xl border border-admin-border bg-white">
            <div className="border-b border-admin-border px-5 py-4 sm:px-6">
              <h2 className="text-base font-bold text-admin-text">
                Datos ingresados
              </h2>
              <p className="mt-1 text-xs text-admin-text-soft">
                Revisa y valida la información registrada por el cliente.
              </p>
            </div>

            <div className="space-y-4 bg-admin-page/30 p-4 sm:p-5">

            <Section
              title="Datos personales"
              reviewStatus={reviews.PERSONAL_DATA}
              onReviewChange={(status) =>
                handleReviewChange("PERSONAL_DATA", status)
              }
              description="Información registrada por el cliente."
              icon={UserRound}
              open={openAccordion === "PERSONAL_DATA"}
              onToggle={() => toggleAccordion("PERSONAL_DATA")}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-xs text-admin-text-soft">
                  El gestor puede corregir los datos principales antes de validar.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setEditingPersonalData((current) => !current)
                  }
                  className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border border-admin-border bg-white px-3 text-xs font-bold text-admin-text transition-colors hover:border-primary/30 hover:bg-surface-blue"
                >
                  <Pencil aria-hidden="true" size={14} />
                  {editingPersonalData ? "Finalizar edición" : "Editar"}
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-medium text-admin-text-muted">
                    Nombre completo
                  </label>

                  {editingPersonalData ? (
                    <input
                      value={editableApplicant.fullName}
                      onChange={(event) =>
                        setEditableApplicant((current) => ({
                          ...current,
                          fullName: event.target.value,
                        }))
                      }
                      className="mt-1 h-11 w-full rounded-xl border border-admin-border bg-white px-3 text-sm font-semibold text-admin-text outline-none transition-colors focus:border-primary"
                    />
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-admin-text">
                      {editableApplicant.fullName || "—"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-medium text-admin-text-muted">
                    Carnet de identidad
                  </label>

                  {editingPersonalData ? (
                    <input
                      value={editableApplicant.identityNumber}
                      onChange={(event) =>
                        setEditableApplicant((current) => ({
                          ...current,
                          identityNumber: event.target.value,
                        }))
                      }
                      className="mt-1 h-11 w-full rounded-xl border border-admin-border bg-white px-3 text-sm font-semibold text-admin-text outline-none transition-colors focus:border-primary"
                    />
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-admin-text">
                      {editableApplicant.identityNumber || "—"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-medium text-admin-text-muted">
                    Fecha de nacimiento
                  </label>

                  {editingPersonalData ? (
                    <input
                      type="date"
                      value={editableApplicant.birthDate}
                      onChange={(event) =>
                        setEditableApplicant((current) => ({
                          ...current,
                          birthDate: event.target.value,
                        }))
                      }
                      className="mt-1 h-11 w-full rounded-xl border border-admin-border bg-white px-3 text-sm font-semibold text-admin-text outline-none transition-colors focus:border-primary"
                    />
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-admin-text">
                      {formatDate(editableApplicant.birthDate)}
                    </p>
                  )}
                </div>

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
              open={openAccordion === "EMPLOYMENT"}
              onToggle={() => toggleAccordion("EMPLOYMENT")}
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
              open={openAccordion === "LOAN"}
              onToggle={() => toggleAccordion("LOAN")}
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
              open={openAccordion === "FINANCIAL"}
              onToggle={() => toggleAccordion("FINANCIAL")}
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
          </section>

          <section className="overflow-hidden rounded-2xl border border-admin-border bg-white">
            <div className="border-b border-admin-border px-5 py-4 sm:px-6">
              <h2 className="text-base font-bold text-admin-text">
                Documentación
              </h2>
              <p className="mt-1 text-xs text-admin-text-soft">
                Valida la autorización, el carnet y la selfie sin salir de esta vista.
              </p>
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              {application.documents.map((document) => {
                const reviewStatus =
                  documentReviews[document.id] ?? "PENDING";

                const statusLabel =
                  reviewStatus === "OBSERVED"
                    ? "Observado"
                    : reviewStatus === "APPROVED"
                      ? "Aprobado"
                      : DOCUMENT_STATUS_LABELS[document.status];

                const statusClasses =
                  reviewStatus === "OBSERVED"
                    ? "bg-red-50 text-red-600"
                    : reviewStatus === "APPROVED"
                      ? "bg-emerald-50 text-emerald-700"
                      : getDocumentStatusClasses(document.status);

                return (
                  <article
                    key={document.id}
                    className={[
                      "overflow-hidden rounded-2xl border bg-white transition-all duration-200 ease-out",
                      openAccordion === `DOCUMENT:${document.id}`
                        ? "border-[#03AEFE]/45 shadow-[0_6px_24px_rgba(3,174,254,0.10)]"
                        : "border-admin-border hover:border-[#03AEFE]/40 hover:shadow-[0_4px_18px_rgba(3,174,254,0.06)]",
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        toggleAccordion(`DOCUMENT:${document.id}`)
                      }
                      className={[
                        "group flex w-full cursor-pointer items-start justify-between gap-3 border-b border-admin-border p-4 text-left transition-all duration-200 ease-out",
                        openAccordion === `DOCUMENT:${document.id}`
                          ? "bg-[#DFF4FF]"
                          : "hover:bg-[#EAF7FF]",
                      ].join(" ")}
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={[
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
                            openAccordion === `DOCUMENT:${document.id}`
                              ? "bg-[#03AEFE] text-white shadow-sm"
                              : "bg-admin-surface-soft text-admin-text-soft group-hover:bg-[#03AEFE] group-hover:text-white",
                          ].join(" ")}
                        >
                          <FileText
                            aria-hidden="true"
                            size={17}
                            strokeWidth={1.8}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-bold text-admin-text">
                              {document.name}
                            </p>
                          <ChevronDown
                            aria-hidden="true"
                            size={15}
                            className={[
                              "shrink-0 transition-all duration-200 ease-out",
                              openAccordion === `DOCUMENT:${document.id}`
                                ? "rotate-180 text-[#1B5BB6]"
                                : "text-admin-text-muted group-hover:translate-y-0.5 group-hover:text-[#1B5BB6]",
                            ].join(" ")}
                          />
                        </div>
                          <p className="mt-1 text-xs text-admin-text-soft">
                            {document.uploadedAt
                              ? `Cargado ${formatDate(document.uploadedAt)}`
                              : "Documento pendiente"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={[
                          "inline-flex shrink-0 rounded-full px-3 py-1.5 text-xs font-bold",
                          statusClasses,
                        ].join(" ")}
                      >
                        {statusLabel}
                      </span>
                    </button>

                    <div
                      className={[
                        "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                        openAccordion === `DOCUMENT:${document.id}`
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0",
                      ].join(" ")}
                    >
                      <div className="overflow-hidden">
                        <div
                          className={[
                            "p-4 transition-transform duration-300 ease-out",
                            openAccordion === `DOCUMENT:${document.id}`
                              ? "translate-y-0"
                              : "-translate-y-1.5",
                          ].join(" ")}
                        >
                      {document.fileUrl ? (
                        document.mimeType === "application/pdf" ? (
                          <div className="overflow-hidden rounded-xl bg-admin-surface-soft">
                            <iframe
                              src={document.fileUrl}
                              title={document.name}
                              className="h-[420px] w-full border-0"
                            />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                ["ID_FRONT", "ID_BACK", "SELFIE"].includes(
                                  document.type,
                                )
                              ) {
                                openIdentityViewer(document.id);
                              }
                            }}
                            className={[
                              "group relative block w-full overflow-hidden rounded-xl bg-admin-surface-soft",
                              ["ID_FRONT", "ID_BACK", "SELFIE"].includes(
                                document.type,
                              )
                                ? "cursor-zoom-in"
                                : "cursor-default",
                            ].join(" ")}
                          >
                            <img
                              src={document.fileUrl}
                              alt={document.name}
                              className="h-[240px] w-full object-contain transition-transform duration-200 group-hover:scale-[1.01]"
                            />

                            {["ID_FRONT", "ID_BACK", "SELFIE"].includes(
                              document.type,
                            ) ? (
                              <span className="absolute bottom-3 right-3 rounded-lg bg-black px-3 py-2 text-[11px] font-bold text-white">
                                Ver en grande
                              </span>
                            ) : null}
                          </button>
                        )
                      ) : (
                        <div className="flex min-h-[190px] items-center justify-center rounded-xl bg-admin-surface-soft">
                          <div className="max-w-[220px] text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#1B5BB6]">
                              <FileText
                                aria-hidden="true"
                                size={22}
                                strokeWidth={1.6}
                              />
                            </div>

                            <p className="mt-3 text-xs font-bold text-admin-text">
                              Documento pendiente
                            </p>

                            <p className="mt-1 text-[11px] leading-4 text-admin-text-soft">
                              El cliente todavía no cargó este archivo.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setDocumentReview(
                              document.id,
                              "OBSERVED",
                            )
                          }
                          className="h-9 flex-1 rounded-xl bg-red-50 px-3 text-xs font-bold text-red-600 transition-colors hover:bg-red-100"
                        >
                          Observar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setDocumentReview(
                              document.id,
                              "APPROVED",
                            )
                          }
                          className="h-9 flex-1 rounded-xl bg-emerald-50 px-3 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
                        >
                          Aprobar
                        </button>
                      </div>

                      {document.name
                        .toLowerCase()
                        .includes("autorización bic") ||
                      document.name
                        .toLowerCase()
                        .includes("autorizacion bic") ? (
                        <div className="mt-5 border-t border-admin-border pt-5">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF7FF] text-[#1B5BB6]">
                              <FileCheck2
                                aria-hidden="true"
                                size={18}
                                strokeWidth={1.8}
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-bold text-admin-text">
                                Reporte crediticio
                              </p>

                              <p className="mt-1 text-xs leading-5 text-admin-text-soft">
                                Adjunta el reporte crediticio del cliente en formato PDF.
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 overflow-hidden rounded-xl bg-admin-surface-soft">
                            <iframe
                              src={
                                creditReportFile
                                  ? URL.createObjectURL(creditReportFile)
                                  : "/reporte-crediticio-demo.pdf"
                              }
                              title="Reporte crediticio"
                              className="h-[420px] w-full border-0"
                            />
                          </div>

                          <div className="mt-4 overflow-hidden rounded-xl border border-admin-border bg-white">
                            <iframe
                              src="/reporte-crediticio-demo.pdf"
                              title="Reporte crediticio"
                              className="h-[420px] w-full border-0"
                            />
                          </div>

                          <label
                            className="group mt-3 flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-admin-border bg-white px-4 text-center transition-colors hover:bg-admin-surface-soft"
                          >
                            <div
                              className={[
                                "flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200",
                                creditReportFile
                                  ? "bg-[#03AEFE] text-white shadow-sm"
                                  : "bg-white text-[#1B5BB6] shadow-sm group-hover:bg-[#03AEFE] group-hover:text-white",
                              ].join(" ")}
                            >
                              <FileText
                                aria-hidden="true"
                                size={20}
                                strokeWidth={1.7}
                              />
                            </div>

                            <p className="text-xs font-bold text-admin-text">
                              {creditReportFile
                                ? "Cambiar reporte crediticio"
                                : "Reemplazar reporte crediticio"}
                            </p>

                            <input
                              type="file"
                              accept="application/pdf,.pdf"
                              className="hidden"
                              onChange={(event) => {
                                const file =
                                  event.target.files?.[0] ?? null;

                                if (
                                  file &&
                                  file.type !== "application/pdf" &&
                                  !file.name
                                    .toLowerCase()
                                    .endsWith(".pdf")
                                ) {
                                  event.target.value = "";
                                  setCreditReportFile(null);
                                  return;
                                }

                                setCreditReportFile(file);
                              }}
                            />
                          </label>

                          {creditReportFile ? (
                            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3">
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700">
                                  <FileCheck2
                                    aria-hidden="true"
                                    size={17}
                                    strokeWidth={1.8}
                                  />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-xs font-bold text-emerald-700">
                                    {creditReportFile.name}
                                  </p>

                                  <p className="mt-0.5 text-[10px] text-emerald-700/70">
                                    {(
                                      creditReportFile.size /
                                      1024 /
                                      1024
                                    ).toFixed(2)}{" "}
                                    MB · PDF cargado
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  setCreditReportFile(null);
                                }}
                                className="shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-red-600 transition-colors hover:bg-red-50"
                              >
                                Quitar
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        {/* ACCIÓN FINAL DE VALIDACIÓN */}
        <section
          className={[
            "overflow-hidden rounded-2xl border transition-all duration-300",
            applicationInReview
              ? "border-emerald-200 bg-emerald-50/60"
              : readyForReview
                ? "border-[#03AEFE]/35 bg-[#F5FBFF] shadow-[0_8px_30px_rgba(3,174,254,0.08)]"
                : "border-admin-border bg-white",
          ].join(" ")}
        >
          <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div
                className={[
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                  applicationInReview
                    ? "bg-emerald-500 text-white"
                    : readyForReview
                      ? "bg-[#03AEFE] text-white shadow-sm"
                      : "bg-admin-surface-soft text-admin-text-muted",
                ].join(" ")}
              >
                {applicationInReview ? (
                  <Check
                    aria-hidden="true"
                    size={20}
                    strokeWidth={2.3}
                  />
                ) : (
                  <ShieldCheck
                    aria-hidden="true"
                    size={20}
                    strokeWidth={1.9}
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-bold text-admin-text">
                    {applicationInReview
                      ? "Solicitud enviada a revisión"
                      : readyForReview
                        ? "Expediente listo para evaluación"
                        : "Completa la validación"}
                  </h2>

                  {!applicationInReview ? (
                    <span
                      className={[
                        "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold",
                        readyForReview
                          ? "bg-[#DFF4FF] text-[#1B5BB6]"
                          : "bg-admin-surface-soft text-admin-text-soft",
                      ].join(" ")}
                    >
                      {approvedValidationItems} de{" "}
                      {totalValidationItems}
                    </span>
                  ) : null}
                </div>

                <p className="mt-1 text-xs leading-5 text-admin-text-soft">
                  {applicationInReview
                    ? "El expediente ya forma parte del proceso de evaluación."
                    : readyForReview
                      ? "Todos los datos y documentos fueron validados. Ya puedes continuar con la evaluación."
                      : `Faltan ${pendingValidationItems} ${
                          pendingValidationItems === 1
                            ? "elemento"
                            : "elementos"
                        } por validar antes de continuar.`}
                </p>

                {!applicationInReview ? (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1.5 w-full max-w-[280px] overflow-hidden rounded-full bg-admin-border">
                      <div
                        className={[
                          "h-full rounded-full transition-all duration-500 ease-out",
                          readyForReview
                            ? "bg-[#03AEFE]"
                            : "bg-[#1B5BB6]",
                        ].join(" ")}
                        style={{
                          width: `${
                            totalValidationItems > 0
                              ? (approvedValidationItems /
                                  totalValidationItems) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>

                    <span className="shrink-0 text-[11px] font-bold text-admin-text-soft">
                      {approvedValidationItems}/
                      {totalValidationItems}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            {!applicationInReview ? (
              <button
                type="button"
                disabled={!readyForReview}
                onClick={() =>
                  setApplicationInReview(true)
                }
                className={[
                  "group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-xs font-bold transition-all duration-200",
                  readyForReview
                    ? "bg-black text-white shadow-sm hover:-translate-y-0.5 hover:bg-[#1B5BB6] hover:shadow-md active:translate-y-0"
                    : "cursor-not-allowed bg-admin-surface-soft text-admin-text-muted",
                ].join(" ")}
              >
                <ShieldCheck
                  aria-hidden="true"
                  size={16}
                  strokeWidth={1.9}
                />

                Pasar a revisión

                <ChevronRight
                  aria-hidden="true"
                  size={15}
                  className={
                    readyForReview
                      ? "transition-transform duration-200 group-hover:translate-x-0.5"
                      : ""
                  }
                />
              </button>
            ) : (
              <div className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-white px-4 text-xs font-bold text-emerald-700 shadow-sm">
                <Check
                  aria-hidden="true"
                  size={15}
                  strokeWidth={2.3}
                />

                En revisión
              </div>
            )}
          </div>
        </section>

        {applicationInReview ? (
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-blue text-[#1B5BB6]">
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
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-admin-text-soft transition-colors hover:bg-[#EAF7FF] hover:text-admin-text"
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
                        : "text-admin-text-soft hover:bg-[#EAF7FF]",
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
                        : "text-admin-text-soft hover:bg-[#EAF7FF]",
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
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-admin-border bg-white px-5 text-sm font-bold text-admin-text transition-colors hover:bg-[#EAF7FF]"
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
                        : "border-admin-border bg-white text-admin-text-soft hover:bg-[#EAF7FF]",
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
                        : "border-admin-border bg-white text-admin-text-soft hover:bg-[#EAF7FF]",
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
                        ? "border-primary bg-surface-blue text-[#1B5BB6]"
                        : "border-admin-border bg-white text-admin-text-soft hover:bg-[#EAF7FF]",
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
          <IdentityDocumentCarousel
        open={identityViewerOpen}
        documents={identityDocuments}
        selectedDocumentId={identityViewerDocumentId}
        reviews={documentReviews}
        applicantName={application.applicant.fullName}
        onClose={() => {
          setIdentityViewerOpen(false);
          setIdentityViewerDocumentId(null);
        }}
        onSelect={setIdentityViewerDocumentId}
        onReview={(documentId, status) => {
          setDocumentReview(documentId, status);
        }}
      />

</BackofficeLayout>
  );
}