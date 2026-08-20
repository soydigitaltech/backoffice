"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
} from "lucide-react";

import type { ApplicationDocument } from "@/types/application";

type ReviewStatus =
  | "PENDING"
  | "OBSERVED"
  | "VALIDATE"
  | "APPROVED";

type IdentityDocumentCarouselProps = {
  open: boolean;
  documents: ApplicationDocument[];
  selectedDocumentId: string | null;
  reviews: Record<string, ReviewStatus>;
  applicantName: string;
  onClose: () => void;
  onSelect: (documentId: string) => void;
  onReview: (
    documentId: string,
    status: "OBSERVED" | "APPROVED",
  ) => void;
};

function getReviewLabel(
  document: ApplicationDocument,
  review?: ReviewStatus,
) {
  if (review === "APPROVED") {
    return "Aprobado";
  }

  if (review === "OBSERVED") {
    return "Observado";
  }

  if (document.status === "VALIDATED") {
    return "Aprobado";
  }

  return "Por revisar";
}

export default function IdentityDocumentCarousel({
  open,
  documents,
  selectedDocumentId,
  reviews,
  applicantName,
  onClose,
  onSelect,
  onReview,
}: IdentityDocumentCarouselProps) {
  if (!open || documents.length === 0) {
    return null;
  }

  const selectedIndex = Math.max(
    0,
    documents.findIndex(
      (document) => document.id === selectedDocumentId,
    ),
  );

  const document = documents[selectedIndex];

  if (!document) {
    return null;
  }

  const previous = () => {
    const index =
      selectedIndex === 0
        ? documents.length - 1
        : selectedIndex - 1;

    onSelect(documents[index].id);
  };

  const next = () => {
    const index =
      selectedIndex === documents.length - 1
        ? 0
        : selectedIndex + 1;

    onSelect(documents[index].id);
  };

  const currentReview = reviews[document.id];

  const approved =
    currentReview === "APPROVED" ||
    document.status === "VALIDATED";

  const observed = currentReview === "OBSERVED";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Verificación de identidad"
    >
      <div className="flex max-h-[94vh] w-full max-w-[1180px] flex-col overflow-hidden rounded-2xl bg-white">
        <header className="flex shrink-0 items-center justify-between border-b border-admin-border px-5 py-4 sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <Eye
                aria-hidden="true"
                size={17}
                strokeWidth={1.8}
                className="text-primary"
              />

              <p className="text-sm font-bold text-admin-text">
                Verificación de identidad
              </p>
            </div>

            <p className="mt-1 text-xs text-admin-text-soft">
              {applicantName}
              <span className="mx-2 text-admin-border">•</span>
              Documento {selectedIndex + 1} de{" "}
              {documents.length}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-admin-border text-admin-text-soft transition-colors hover:bg-admin-surface-soft hover:text-admin-text"
            aria-label="Cerrar"
          >
            <X
              aria-hidden="true"
              size={20}
              strokeWidth={1.8}
            />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="relative flex min-h-[460px] items-center justify-center bg-[#F5F7FA] px-14 py-6 sm:min-h-[560px]">
            {documents.length > 1 ? (
              <button
                type="button"
                onClick={previous}
                className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-primary-dark"
                aria-label="Documento anterior"
              >
                <ChevronLeft
                  aria-hidden="true"
                  size={22}
                />
              </button>
            ) : null}

            {document.fileUrl ? (
              <img
                src={document.fileUrl}
                alt={document.name}
                className="max-h-[68vh] max-w-full object-contain"
              />
            ) : (
              <div className="text-center">
                <p className="text-sm font-bold text-admin-text">
                  Documento no disponible
                </p>

                <p className="mt-1 text-xs text-admin-text-soft">
                  El cliente todavía no cargó este archivo.
                </p>
              </div>
            )}

            {documents.length > 1 ? (
              <button
                type="button"
                onClick={next}
                className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-primary-dark"
                aria-label="Documento siguiente"
              >
                <ChevronRight
                  aria-hidden="true"
                  size={22}
                />
              </button>
            ) : null}
          </div>

          <div className="border-t border-admin-border px-5 py-4 sm:px-6">
            <div className="flex gap-3 overflow-x-auto pb-1">
              {documents.map((item, index) => {
                const active = item.id === document.id;

                const itemApproved =
                  reviews[item.id] === "APPROVED" ||
                  item.status === "VALIDATED";

                const itemObserved =
                  reviews[item.id] === "OBSERVED";

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className={[
                      "min-w-[150px] rounded-xl border p-2 text-left transition-colors",
                      active
                        ? "border-primary bg-surface-blue"
                        : "border-admin-border bg-white hover:border-primary/40",
                    ].join(" ")}
                  >
                    <div className="flex h-[78px] items-center justify-center overflow-hidden rounded-lg bg-admin-surface-soft">
                      {item.fileUrl ? (
                        <img
                          src={item.fileUrl}
                          alt=""
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-[10px] text-admin-text-muted">
                          Sin archivo
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="truncate text-[11px] font-bold text-admin-text">
                        {item.name}
                      </p>

                      {itemApproved ? (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                          <Check
                            aria-hidden="true"
                            size={12}
                            strokeWidth={2.2}
                          />
                        </span>
                      ) : itemObserved ? (
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
                      ) : (
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400" />
                      )}
                    </div>

                    <p className="mt-0.5 text-[10px] text-admin-text-muted">
                      {index + 1} de {documents.length}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <footer className="flex shrink-0 flex-col gap-4 border-t border-admin-border bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-admin-text">
                {document.name}
              </p>

              <span
                className={[
                  "rounded-full px-2.5 py-1 text-[10px] font-bold",
                  approved
                    ? "bg-emerald-50 text-emerald-700"
                    : observed
                      ? "bg-red-50 text-red-600"
                      : "bg-amber-50 text-amber-700",
                ].join(" ")}
              >
                {getReviewLabel(document, currentReview)}
              </span>
            </div>

            <p className="mt-1 text-xs text-admin-text-soft">
              Revisa que la información sea legible y corresponda
              al cliente.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={!document.fileUrl}
              onClick={() =>
                onReview(document.id, "OBSERVED")
              }
              className="h-11 rounded-xl bg-red-50 px-6 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Observar
            </button>

            <button
              type="button"
              disabled={!document.fileUrl}
              onClick={() => {
                onReview(document.id, "APPROVED");

                if (selectedIndex < documents.length - 1) {
                  onSelect(documents[selectedIndex + 1].id);
                }
              }}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Check
                aria-hidden="true"
                size={16}
                strokeWidth={2}
              />

              Aprobar
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
