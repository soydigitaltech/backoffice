"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  IdCard,
  MessageSquareWarning,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import { useAuth } from "@/hooks/useAuth";
import {
  DOCUMENT_STATUS_LABELS,
  type ApplicationDocument,
  type ApplicationDocumentStatus,
} from "@/types/application";

type ApplicationDocumentsPanelProps = {
  applicationId: string;
  initialDocuments: ApplicationDocument[];
};

type ReviewAction = "VALIDATED" | "OBSERVED" | "REJECTED";

type PendingReview = {
  document: ApplicationDocument;
  action: ReviewAction;
} | null;

function getStorageKey(applicationId: string) {
  return `kivo-application-documents-${applicationId}`;
}

function readStoredDocuments(
  applicationId: string,
  fallbackDocuments: ApplicationDocument[],
) {
  try {
    const storedValue = window.localStorage.getItem(
      getStorageKey(applicationId),
    );

    if (!storedValue) {
      return fallbackDocuments;
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      throw new Error(
        "Los documentos almacenados no tienen un formato válido.",
      );
    }

    return parsedValue as ApplicationDocument[];
  } catch (error) {
    console.error(
      "No se pudieron recuperar los documentos del expediente:",
      error,
    );

    return fallbackDocuments;
  }
}

function persistDocuments(
  applicationId: string,
  documents: ApplicationDocument[],
) {
  window.localStorage.setItem(
    getStorageKey(applicationId),
    JSON.stringify(documents),
  );
}

const statusClasses: Record<ApplicationDocumentStatus, string> = {
  MISSING: "bg-admin-surface-soft text-admin-text-soft",
  UPLOADED: "bg-surface-blue text-primary-dark",
  OBSERVED: "bg-warning-bg text-warning",
  VALIDATED: "bg-success-bg text-success",
  REJECTED: "bg-error-bg text-error",
};

const statusOptions = [
  {
    value: "",
    label: "Todos los estados",
  },
  {
    value: "MISSING",
    label: "Faltantes",
  },
  {
    value: "UPLOADED",
    label: "Cargados",
  },
  {
    value: "OBSERVED",
    label: "Observados",
  },
  {
    value: "VALIDATED",
    label: "Validados",
  },
  {
    value: "REJECTED",
    label: "Rechazados",
  },
];

function getDocumentIcon(document: ApplicationDocument) {
  switch (document.type) {
    case "BIC_AUTHORIZATION":
      return ShieldCheck;

    case "ID_FRONT":
    case "ID_BACK":
      return IdCard;

    case "SELFIE":
      return UserRound;

    default:
      return FileText;
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Sin registro";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/La_Paz",
  })
    .format(date)
    .replace(/[\u00A0\u202F]/g, " ");
}

export default function ApplicationDocumentsPanel({
  applicationId,
  initialDocuments,
}: ApplicationDocumentsPanelProps) {
  const { user } = useAuth();

  const [documents, setDocuments] =
    useState<ApplicationDocument[]>(initialDocuments);

  const [isReady, setIsReady] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedDocument, setSelectedDocument] =
    useState<ApplicationDocument | null>(null);

  const [pendingReview, setPendingReview] =
    useState<PendingReview>(null);

  const [reviewReason, setReviewReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const storedDocuments = readStoredDocuments(
        applicationId,
        initialDocuments,
      );

      setDocuments(storedDocuments);
      setIsReady(true);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [applicationId, initialDocuments]);

  const filteredDocuments = useMemo(() => {
    if (!statusFilter) {
      return documents;
    }

    return documents.filter(
      (document) => document.status === statusFilter,
    );
  }, [documents, statusFilter]);

  const validatedCount = documents.filter(
    (document) => document.status === "VALIDATED",
  ).length;

  const missingCount = documents.filter(
    (document) => document.status === "MISSING",
  ).length;

  const observedCount = documents.filter(
    (document) =>
      document.status === "OBSERVED" ||
      document.status === "REJECTED",
  ).length;

  const updateDocumentStatus = (
    documentId: string,
    status: ReviewAction,
    observation: string | null,
  ) => {
    const reviewedAt = new Date().toISOString();
    const reviewedBy = user?.fullName ?? "Usuario del backoffice";

    setDocuments((currentDocuments) => {
      const nextDocuments = currentDocuments.map((document) =>
        document.id === documentId
          ? {
              ...document,
              status,
              observation,
              reviewedAt,
              reviewedBy,
            }
          : document,
      );

      persistDocuments(applicationId, nextDocuments);

      return nextDocuments;
    });

    setSelectedDocument((currentDocument) =>
      currentDocument?.id === documentId
        ? {
            ...currentDocument,
            status,
            observation,
            reviewedAt,
            reviewedBy,
          }
        : currentDocument,
    );
  };

  const openReview = (
    document: ApplicationDocument,
    action: ReviewAction,
  ) => {
    setPendingReview({
      document,
      action,
    });

    setReviewReason("");
    setErrorMessage("");
  };

  const closeReview = () => {
    setPendingReview(null);
    setReviewReason("");
    setErrorMessage("");
  };

  const confirmReview = () => {
    if (!pendingReview) {
      return;
    }

    const requiresReason =
      pendingReview.action === "OBSERVED" ||
      pendingReview.action === "REJECTED";

    if (requiresReason && !reviewReason.trim()) {
      setErrorMessage(
        "Ingresa el motivo antes de confirmar la acción.",
      );
      return;
    }

    updateDocumentStatus(
      pendingReview.document.id,
      pendingReview.action,
      requiresReason ? reviewReason.trim() : null,
    );

    closeReview();
  };

  const reviewTitle = pendingReview
    ? {
        VALIDATED: "Validar documento",
        OBSERVED: "Observar documento",
        REJECTED: "Rechazar documento",
      }[pendingReview.action]
    : "";

  const reviewButtonLabel = pendingReview
    ? {
        VALIDATED: "Validar",
        OBSERVED: "Guardar observación",
        REJECTED: "Rechazar",
      }[pendingReview.action]
    : "";

  return (
    <section className="rounded-2xl bg-admin-surface">
      <div className="flex flex-col gap-4 border-b border-admin-border p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-admin-text">
            Documentos del onboarding
          </h2>

          <p className="mt-1 text-sm text-admin-text-soft">
            Revisa la autorización BIC, documento de identidad y selfie.
          </p>
        </div>

        <div className="w-full lg:w-56">
          <Select
            value={statusFilter}
            options={statusOptions}
            placeholder="Todos los estados"
            onChange={setStatusFilter}
          />
        </div>
      </div>

      <div className="grid gap-3 border-b border-admin-border p-5 sm:grid-cols-3 sm:p-6">
        <article className="rounded-xl bg-success-bg p-4">
          <p className="text-xs font-semibold text-admin-text-soft">
            Validados
          </p>

          <p className="mt-2 text-2xl font-bold text-success">
            {validatedCount}
          </p>
        </article>

        <article className="rounded-xl bg-warning-bg p-4">
          <p className="text-xs font-semibold text-admin-text-soft">
            Faltantes
          </p>

          <p className="mt-2 text-2xl font-bold text-warning">
            {missingCount}
          </p>
        </article>

        <article className="rounded-xl bg-error-bg p-4">
          <p className="text-xs font-semibold text-admin-text-soft">
            Observados o rechazados
          </p>

          <p className="mt-2 text-2xl font-bold text-error">
            {observedCount}
          </p>
        </article>
      </div>

      <div className="grid gap-4 p-5 sm:p-6 xl:grid-cols-2">
        {!isReady ? (
          <div className="rounded-2xl border border-dashed border-admin-border p-10 text-center xl:col-span-2">
            <Clock3
              aria-hidden="true"
              size={28}
              strokeWidth={1.6}
              className="mx-auto text-admin-text-muted"
            />

            <p className="mt-4 text-sm font-bold text-admin-text">
              Cargando documentos...
            </p>
          </div>
        ) : null}

        {isReady
          ? filteredDocuments.map((document) => {
          const DocumentIcon = getDocumentIcon(document);

          return (
            <article
              key={document.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedDocument(document)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  setSelectedDocument(document);
                }
              }}
              className="group cursor-pointer rounded-2xl border border-admin-border bg-white p-5 transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-admin-surface-soft text-primary-dark">
                    <DocumentIcon
                      aria-hidden="true"
                      size={20}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-admin-text">
                      {document.name}
                    </h3>

                    <p className="mt-1 text-xs text-admin-text-soft">
                      Versión {document.version}
                    </p>
                  </div>
                </div>

                <span
                  className={[
                    "inline-flex shrink-0 rounded-full px-3 py-1 text-[11px] font-bold",
                    statusClasses[document.status],
                  ].join(" ")}
                >
                  {DOCUMENT_STATUS_LABELS[document.status]}
                </span>
              </div>

              <div className="mt-5 space-y-2 text-xs">
                <div className="flex justify-between gap-4">
                  <span className="text-admin-text-muted">
                    Cargado por
                  </span>

                  <strong className="text-right text-admin-text">
                    {document.uploadedBy ?? "No cargado"}
                  </strong>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-admin-text-muted">
                    Fecha de carga
                  </span>

                  <strong className="text-right text-admin-text">
                    {formatDate(document.uploadedAt)}
                  </strong>
                </div>
              </div>

              {document.observation ? (
                <div className="mt-4 rounded-xl bg-warning-bg px-4 py-3">
                  <div className="flex items-start gap-2">
                    <MessageSquareWarning
                      aria-hidden="true"
                      size={16}
                      strokeWidth={1.8}
                      className="mt-0.5 shrink-0 text-warning"
                    />

                    <p className="text-xs font-semibold leading-5 text-warning">
                      {document.observation}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="mt-5 flex items-center justify-between border-t border-admin-border pt-4">
                <span className="text-xs font-semibold text-admin-text-soft">
                  Ver documento
                </span>

                <Eye
                  aria-hidden="true"
                  size={17}
                  strokeWidth={1.8}
                  className="text-admin-text-muted transition-colors group-hover:text-primary-dark"
                />
              </div>
            </article>
          );
        })
          : null}

        {isReady && filteredDocuments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-admin-border p-10 text-center xl:col-span-2">
            <Clock3
              aria-hidden="true"
              size={28}
              strokeWidth={1.6}
              className="mx-auto text-admin-text-muted"
            />

            <p className="mt-4 text-sm font-bold text-admin-text">
              No existen documentos con ese estado
            </p>
          </div>
        ) : null}
      </div>

      {selectedDocument ? (
        <Modal
          open
          title={selectedDocument.name}
          description="Revisa el archivo cargado por el cliente."
          size="lg"
          onClose={() => setSelectedDocument(null)}
          footer={
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-admin-text-soft">
                Estado actual:{" "}
                <strong className="text-admin-text">
                  {DOCUMENT_STATUS_LABELS[selectedDocument.status]}
                </strong>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDocument(null)}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-black px-5 text-sm font-bold text-white"
              >
                Cerrar
              </button>
            </div>
          }
        >
          <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
            {/* Vista del documento */}
            <div className="border-b border-admin-border p-5 sm:p-6 lg:border-b-0 lg:border-r">
              <div className="flex min-h-[420px] items-center justify-center rounded-2xl bg-admin-surface-soft">
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
                    Aquí se mostrará el archivo original cargado por el cliente cuando conectemos el backend.
                  </p>
                </div>
              </div>
            </div>

            {/* Panel de revisión */}
            <div className="p-5 sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-admin-text-muted">
                Revisión
              </p>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs text-admin-text-muted">
                    Estado
                  </p>

                  <span
                    className={[
                      "mt-1.5 inline-flex rounded-full px-3 py-1.5 text-xs font-bold",
                      statusClasses[selectedDocument.status],
                    ].join(" ")}
                  >
                    {DOCUMENT_STATUS_LABELS[selectedDocument.status]}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-admin-text-muted">
                    Cargado por
                  </p>

                  <p className="mt-1 text-sm font-bold text-admin-text">
                    {selectedDocument.uploadedBy ?? "Sin registro"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-admin-text-muted">
                    Fecha de carga
                  </p>

                  <p className="mt-1 text-sm font-bold text-admin-text">
                    {formatDate(selectedDocument.uploadedAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-admin-text-muted">
                    Revisado por
                  </p>

                  <p className="mt-1 text-sm font-bold text-admin-text">
                    {selectedDocument.reviewedBy ?? "Sin revisión"}
                  </p>
                </div>
              </div>

              {selectedDocument.observation ? (
                <div className="mt-5 rounded-xl bg-warning-bg p-4">
                  <div className="flex gap-2">
                    <MessageSquareWarning
                      aria-hidden="true"
                      size={16}
                      className="mt-0.5 shrink-0 text-warning"
                    />

                    <div>
                      <p className="text-xs font-bold text-warning">
                        Observación
                      </p>

                      <p className="mt-1 text-xs leading-5 text-warning">
                        {selectedDocument.observation}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {selectedDocument.status !== "MISSING" ? (
                <div className="mt-6 border-t border-admin-border pt-5">
                  <p className="mb-3 text-xs font-bold text-admin-text">
                    Validación
                  </p>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() =>
                        openReview(
                          selectedDocument,
                          "VALIDATED",
                        )
                      }
                      className="flex h-11 w-full items-center gap-3 rounded-xl bg-success-bg px-4 text-sm font-bold text-success transition-opacity hover:opacity-80"
                    >
                      <CheckCircle2
                        aria-hidden="true"
                        size={17}
                      />

                      Validar documento
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openReview(
                          selectedDocument,
                          "OBSERVED",
                        )
                      }
                      className="flex h-11 w-full items-center gap-3 rounded-xl bg-warning-bg px-4 text-sm font-bold text-warning transition-opacity hover:opacity-80"
                    >
                      <AlertTriangle
                        aria-hidden="true"
                        size={17}
                      />

                      Observar documento
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openReview(
                          selectedDocument,
                          "REJECTED",
                        )
                      }
                      className="flex h-11 w-full items-center gap-3 rounded-xl bg-error-bg px-4 text-sm font-bold text-error transition-opacity hover:opacity-80"
                    >
                      <XCircle
                        aria-hidden="true"
                        size={17}
                      />

                      Rechazar documento
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </Modal>
      ) : null}

      {pendingReview?.action === "VALIDATED" ? (
        <ConfirmDialog
          open
          title={reviewTitle}
          description={`Confirma que ${pendingReview.document.name} es legible, válido y corresponde al cliente.`}
          confirmLabel={reviewButtonLabel}
          tone="success"
          onCancel={closeReview}
          onConfirm={confirmReview}
        />
      ) : null}

      {pendingReview &&
      pendingReview.action !== "VALIDATED" ? (
        <Modal
          open
          title={reviewTitle}
          description={`Registra el motivo para ${pendingReview.document.name}.`}
          size="sm"
          onClose={closeReview}
          footer={
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeReview}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-admin-border bg-white px-5 text-sm font-bold text-admin-text"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmReview}
                className={[
                  "inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-bold",
                  pendingReview.action === "REJECTED"
                    ? "bg-error text-white"
                    : "bg-accent text-ink",
                ].join(" ")}
              >
                {reviewButtonLabel}
              </button>
            </div>
          }
        >
          <div className="p-5 sm:p-6">
            <label
              htmlFor="reviewReason"
              className="mb-2 block text-sm font-semibold text-admin-text"
            >
              Motivo
            </label>

            <textarea
              id="reviewReason"
              value={reviewReason}
              onChange={(event) => {
                setReviewReason(event.target.value);

                if (errorMessage) {
                  setErrorMessage("");
                }
              }}
              rows={5}
              placeholder="Describe claramente qué debe corregirse o por qué se rechaza el documento."
              className="w-full resize-none rounded-xl border border-admin-border bg-white px-4 py-3 text-sm text-admin-text outline-none transition-colors placeholder:text-admin-text-muted focus:border-primary"
            />

            {errorMessage ? (
              <p
                role="alert"
                className="mt-3 rounded-xl bg-error-bg px-4 py-3 text-sm font-semibold text-error"
              >
                {errorMessage}
              </p>
            ) : null}
          </div>
        </Modal>
      ) : null}
    </section>
  );
}
