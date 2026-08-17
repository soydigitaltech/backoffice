"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  Gauge,
  MessageCircle,
  Search,
  Send,
  UserRound,
  WalletCards,
} from "lucide-react";
import { useMemo, useState } from "react";

import ApplicationStatusBadge from "@/components/applications/ApplicationStatusBadge";
import BackofficeLayout from "@/components/layout/BackofficeLayout";
import { INITIAL_APPLICATIONS } from "@/mocks/applications";
import type { Application } from "@/types/application";

type AdvisorFilter =
  | "PENDING"
  | "IN_REVIEW"
  | "COMPLETED";

type EvaluationSubfilter =
  | "ALL"
  | "ANALYZING"
  | "OBSERVED"
  | "RESUMED";

type AdvisorEvaluationStatus =
  | "ASSIGNED"
  | "ANALYZING"
  | "OBSERVED"
  | "RESUMED"
  | "APPROVED"
  | "REJECTED";

type AdvisorTraceEvent = {
  id: string;
  time: string;
  title: string;
  description?: string;
};

type AdvisorChatMessage = {
  id: string;
  sender: "JUDITH" | "ADVISOR";
  senderName: string;
  message: string;
  time: string;
};

type AdvisorCase = {
  application: Application;
  advisorState: AdvisorFilter;
  assignedAt: string;
  scoringLabel: string;
  managerHandoff: boolean;
  assignedAdvisorName?: string;
  evaluationStatus?: AdvisorEvaluationStatus;
  trace?: AdvisorTraceEvent[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-BO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function cloneApplication(
  base: Application,
  overrides: {
    id: string;
    code: string;
    firstName: string;
    lastName: string;
    identityNumber: string;
    city: string;
    requestedAmount: number;
    monthlyNetIncome: number;
    residualCapacity: number;
    status?: Application["status"];
  },
): Application {
  return {
    ...base,
    id: overrides.id,
    code: overrides.code,
    status: overrides.status ?? base.status,
    applicant: {
      ...base.applicant,
      firstName: overrides.firstName,
      lastName: overrides.lastName,
      fullName: `${overrides.firstName} ${overrides.lastName}`,
      identityNumber: overrides.identityNumber,
      city: overrides.city,
    },
    employment: {
      ...base.employment,
      monthlyNetIncome: overrides.monthlyNetIncome,
    },
    loan: {
      ...base.loan,
      requestedAmount: overrides.requestedAmount,
      residualCapacity: overrides.residualCapacity,
    },
    assignedAdvisorId: "usr-judith",
    assignedAdvisorName: "Judith Blanco",
  };
}

function getFilterLabel(filter: AdvisorFilter) {
  switch (filter) {
    case "PENDING":
      return "Por asignar";
    case "IN_REVIEW":
      return "En evaluación";
    case "COMPLETED":
      return "Evaluadas";
  }
}

function getEvaluationStatusLabel(
  status?: AdvisorEvaluationStatus,
) {
  switch (status) {
    case "ASSIGNED":
      return "Asignado";
    case "ANALYZING":
      return "En análisis";
    case "OBSERVED":
      return "Observado";
    case "RESUMED":
      return "Evaluación retomada";
    case "APPROVED":
      return "Aprobado";
    case "REJECTED":
      return "Rechazado";
    default:
      return "Pendiente";
  }
}

function getEvaluationStatusClasses(
  status?: AdvisorEvaluationStatus,
) {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-50 text-emerald-700";
    case "REJECTED":
      return "bg-red-50 text-red-700";
    case "OBSERVED":
      return "bg-amber-50 text-amber-700";
    case "RESUMED":
      return "bg-[#EAF7FF] text-[#1B5BB6]";
    case "ANALYZING":
      return "bg-[#EAF7FF] text-[#1B5BB6]";
    case "ASSIGNED":
      return "bg-violet-50 text-violet-700";
    default:
      return "bg-admin-surface-soft text-admin-text-soft";
  }
}

function getStateClasses(state: AdvisorFilter) {
  switch (state) {
    case "PENDING":
      return "bg-[#EAF7FF] text-[#1B5BB6]";
    case "IN_REVIEW":
      return "bg-amber-50 text-amber-700";
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700";
  }
}

function FinancialMetric({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string;
  description?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-admin-border bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF7FF] text-[#1B5BB6]">
          <Icon
            aria-hidden="true"
            size={16}
            strokeWidth={1.8}
          />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-admin-text-muted">
            {label}
          </p>

          <p className="mt-1 text-base font-bold text-admin-text">
            {value}
          </p>

          {description ? (
            <p className="mt-1 text-[10px] leading-4 text-admin-text-soft">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function AdvisorApplicationCard({
  item,
  open,
  onToggle,
}: {
  item: AdvisorCase;
  open: boolean;
  onToggle: () => void;
}) {
  const { application } = item;

  const initials =
    `${application.applicant.firstName.charAt(
      0,
    )}${application.applicant.lastName.charAt(0)}`.toUpperCase();

  const documentsReady = application.documents.every(
    (document) =>
      document.status === "VALIDATED" ||
      document.status === "UPLOADED",
  );

  const debtToIncome =
    application.loan.debtToIncomeRatio;

  const capacityPositive =
    application.loan.residualCapacity > 0;

  const [chatInput, setChatInput] = useState("");

  const [chatMessages, setChatMessages] =
    useState<AdvisorChatMessage[]>(() => {
      if (
        item.advisorState !== "IN_REVIEW" ||
        !item.assignedAdvisorName
      ) {
        return [];
      }

      if (item.application.id === "advisor-004") {
        return [
          {
            id: "chat-004-1",
            sender: "ADVISOR",
            senderName: item.assignedAdvisorName,
            message:
              "Estoy revisando la capacidad de pago y el respaldo de ingresos.",
            time: "11:08",
          },
          {
            id: "chat-004-2",
            sender: "JUDITH",
            senderName: "Judith Blanco",
            message:
              "Perfecto. El expediente ya fue validado por Gestión de Clientes.",
            time: "11:12",
          },
        ];
      }

      if (item.application.id === "advisor-005") {
        return [
          {
            id: "chat-005-1",
            sender: "ADVISOR",
            senderName: item.assignedAdvisorName,
            message:
              "Ya recibí el respaldo adicional. Retomo la evaluación.",
            time: "10:31",
          },
          {
            id: "chat-005-2",
            sender: "JUDITH",
            senderName: "Judith Blanco",
            message:
              "Gracias. Avísame si necesitas otra validación.",
            time: "10:34",
          },
        ];
      }

      if (item.evaluationStatus === "OBSERVED") {
        return [
          {
            id: "chat-observed-1",
            sender: "ADVISOR",
            senderName: item.assignedAdvisorName,
            message:
              "Necesito respaldo adicional del ingreso variable para continuar.",
            time: "15:42",
          },
        ];
      }

      return [];
    });

  const sendChatMessage = () => {
    const message = chatInput.trim();

    if (!message) {
      return;
    }

    setChatMessages((current) => [
      ...current,
      {
        id: `chat-${Date.now()}`,
        sender: "JUDITH",
        senderName: "Judith Blanco",
        message,
        time: new Intl.DateTimeFormat("es-BO", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date()),
      },
    ]);

    setChatInput("");
  };

  return (
    <article
      className={[
        "overflow-hidden rounded-2xl border bg-white transition-all duration-300 ease-out",
        open
          ? "border-[#03AEFE]/45 shadow-[0_10px_32px_rgba(3,174,254,0.09)]"
          : "border-admin-border hover:border-[#03AEFE]/35 hover:shadow-[0_6px_22px_rgba(3,174,254,0.06)]",
      ].join(" ")}
    >
      {/* CABECERA / RESUMEN SIEMPRE VISIBLE */}
      <button
        type="button"
        onClick={onToggle}
        className={[
          "group flex w-full cursor-pointer flex-col gap-4 p-5 text-left transition-all duration-200 sm:p-6",
          open
            ? "bg-[#F2FAFF]"
            : "bg-white hover:bg-[#F6FBFF]",
        ].join(" ")}
      >
        <div className="flex w-full items-start gap-4">
          <div
            className={[
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-200",
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

              {item.evaluationStatus ? (
                <span
                  className={[
                    "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold",
                    getEvaluationStatusClasses(
                      item.evaluationStatus,
                    ),
                  ].join(" ")}
                >
                  {getEvaluationStatusLabel(
                    item.evaluationStatus,
                  )}
                </span>
              ) : null}

              <span
                className={[
                  "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold",
                  item.managerHandoff
                    ? "bg-violet-50 text-violet-700"
                    : getStateClasses(item.advisorState),
                ].join(" ")}
              >
                {item.managerHandoff
                  ? "Enviado a Jefe de cartera"
                  : getFilterLabel(item.advisorState)}
              </span>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-admin-text-soft">
              <span>{application.code}</span>
              <span>•</span>
              <span>
                CI {application.applicant.identityNumber}
              </span>
              <span>•</span>
              <span>{application.applicant.city}</span>
            </div>
          </div>

          <ChevronDown
            aria-hidden="true"
            size={19}
            className={[
              "mt-1 shrink-0 text-admin-text-muted transition-all duration-200",
              open
                ? "rotate-180 text-[#1B5BB6]"
                : "group-hover:translate-y-0.5 group-hover:text-[#1B5BB6]",
            ].join(" ")}
          />
        </div>

        {/* INDICADORES DE ESCANEO RÁPIDO */}
        <div className="grid w-full gap-2 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-xl bg-surface-blue/35 px-3 py-2.5">
            <p className="text-[10px] text-admin-text-muted">
              Solicitado
            </p>
            <p className="mt-1 text-sm font-bold text-admin-text">
              Bs{" "}
              {formatCurrency(
                application.loan.requestedAmount,
              )}
            </p>
          </div>

          <div className="rounded-xl bg-[#F0FBF7] px-3 py-2.5">
            <p className="text-[10px] text-admin-text-muted">
              Ingreso
            </p>
            <p className="mt-1 text-sm font-bold text-admin-text">
              Bs{" "}
              {formatCurrency(
                application.employment.monthlyNetIncome,
              )}
            </p>
          </div>

          <div
            className={[
              "rounded-xl px-3 py-2.5",
              capacityPositive
                ? "bg-[#F0FBF7]"
                : "bg-red-50",
            ].join(" ")}
          >
            <p className="text-[10px] text-admin-text-muted">
              Capacidad
            </p>
            <p
              className={[
                "mt-1 text-sm font-bold",
                capacityPositive
                  ? "text-emerald-700"
                  : "text-red-600",
              ].join(" ")}
            >
              Bs{" "}
              {formatCurrency(
                application.loan.residualCapacity,
              )}
            </p>
          </div>

          <div className="rounded-xl bg-[#FFF7EB] px-3 py-2.5">
            <p className="text-[10px] text-admin-text-muted">
              Scoring
            </p>
            <p className="mt-1 truncate text-sm font-bold text-admin-text">
              {item.scoringLabel}
            </p>
          </div>

          <div className="rounded-xl bg-admin-surface-soft px-3 py-2.5">
            <p className="text-[10px] text-admin-text-muted">
              Asignación
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-admin-text">
              <Clock3
                aria-hidden="true"
                size={13}
              />
              {item.assignedAt}
            </p>
          </div>
        </div>
      </button>

      {/* ACORDEÓN */}
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
              "border-t border-admin-border bg-admin-page/25 p-5 transition-transform duration-300 ease-out sm:p-6",
              open
                ? "translate-y-0"
                : "-translate-y-1.5",
            ].join(" ")}
          >
            {/* RESUMEN FINANCIERO */}
            <section>
              <div className="flex items-center gap-2">
                <CircleDollarSign
                  aria-hidden="true"
                  size={17}
                  className="text-[#1B5BB6]"
                />

                <h4 className="text-sm font-bold text-admin-text">
                  Resumen financiero
                </h4>
              </div>

              <p className="mt-1 text-xs text-admin-text-soft">
                Variables principales para evaluar capacidad y nivel de endeudamiento.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <FinancialMetric
                  label="Ingreso mensual"
                  value={`Bs ${formatCurrency(
                    application.employment.monthlyNetIncome,
                  )}`}
                  icon={BriefcaseBusiness}
                />

                <FinancialMetric
                  label="Monto solicitado"
                  value={`Bs ${formatCurrency(
                    application.loan.requestedAmount,
                  )}`}
                  icon={CircleDollarSign}
                />

                <FinancialMetric
                  label="Capacidad residual"
                  value={`Bs ${formatCurrency(
                    application.loan.residualCapacity,
                  )}`}
                  description={
                    capacityPositive
                      ? "Capacidad disponible positiva"
                      : "Requiere revisión"
                  }
                  icon={WalletCards}
                />

                <FinancialMetric
                  label="Deuda / ingreso"
                  value={`${debtToIncome}%`}
                  description="Relación declarada"
                  icon={Gauge}
                />
              </div>
            </section>

            {/* RIESGO */}
            <section className="mt-6 rounded-2xl border border-[#03AEFE]/20 bg-[#F2FAFF] p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DFF4FF] text-[#1B5BB6]">
                  <Gauge
                    aria-hidden="true"
                    size={17}
                    strokeWidth={1.8}
                  />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-admin-text">
                    Riesgo y scoring
                  </h4>

                  <p className="mt-0.5 text-[11px] text-admin-text-soft">
                    Indicadores clave para la decisión financiera.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                <div className="rounded-xl border border-admin-border bg-white p-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-admin-text-muted">
                    Resultado
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={[
                        "h-2.5 w-2.5 rounded-full",
                        item.scoringLabel
                          .toLowerCase()
                          .includes("favorable")
                          ? "bg-emerald-500"
                          : item.scoringLabel
                                .toLowerCase()
                                .includes("requiere")
                            ? "bg-amber-500"
                            : "bg-[#03AEFE]",
                      ].join(" ")}
                    />

                    <p className="text-sm font-bold text-admin-text">
                      {item.scoringLabel}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-admin-border bg-white p-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-admin-text-muted">
                    Capacidad financiera
                  </p>

                  <p
                    className={[
                      "mt-2 text-sm font-bold",
                      capacityPositive
                        ? "text-emerald-700"
                        : "text-red-600",
                    ].join(" ")}
                  >
                    {capacityPositive
                      ? "Capacidad positiva"
                      : "Requiere análisis"}
                  </p>
                </div>

                <div className="rounded-xl border border-admin-border bg-white p-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-admin-text-muted">
                    Alertas
                  </p>

                  <p
                    className={[
                      "mt-2 text-sm font-bold",
                      application.alerts.length > 0
                        ? "text-amber-700"
                        : "text-emerald-700",
                    ].join(" ")}
                  >
                    {application.alerts.length > 0
                      ? `${application.alerts.length} por revisar`
                      : "Sin alertas"}
                  </p>
                </div>
              </div>
            </section>

            {/* EXPEDIENTE */}
            <section className="mt-6 border-t border-admin-border pt-5">
              <div className="flex items-center gap-2">
                <FileCheck2
                  aria-hidden="true"
                  size={17}
                  className="text-[#1B5BB6]"
                />

                <h4 className="text-sm font-bold text-admin-text">
                  Expediente recibido
                </h4>
              </div>

              <p className="mt-1 text-xs text-admin-text-soft">
                Información validada previamente por Gestión de Clientes.
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-3 text-xs font-semibold text-admin-text">
                  <CheckCircle2
                    aria-hidden="true"
                    size={15}
                    className="text-emerald-600"
                  />
                  Datos validados
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-3 text-xs font-semibold text-admin-text">
                  {documentsReady ? (
                    <CheckCircle2
                      aria-hidden="true"
                      size={15}
                      className="text-emerald-600"
                    />
                  ) : (
                    <Clock3
                      aria-hidden="true"
                      size={15}
                      className="text-amber-600"
                    />
                  )}
                  Documentación
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-3 text-xs font-semibold text-admin-text">
                  <FileCheck2
                    aria-hidden="true"
                    size={15}
                    className="text-[#1B5BB6]"
                  />
                  Autorización BIC
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-3 text-xs font-semibold text-admin-text">
                  <CheckCircle2
                    aria-hidden="true"
                    size={15}
                    className="text-emerald-600"
                  />
                  Reporte crediticio
                </div>
              </div>
            </section>

            {item.assignedAdvisorName &&
            item.trace &&
            item.trace.length > 0 ? (
              <section className="mt-6 rounded-2xl bg-[#F7F9FC] p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#1B5BB6]">
                      Seguimiento del asesor
                    </p>

                    <h4 className="mt-1 text-sm font-bold text-admin-text">
                      {item.assignedAdvisorName}
                    </h4>
                  </div>

                  <span
                    className={[
                      "inline-flex w-fit rounded-full px-3 py-1.5 text-[10px] font-bold",
                      getEvaluationStatusClasses(
                        item.evaluationStatus,
                      ),
                    ].join(" ")}
                  >
                    {getEvaluationStatusLabel(
                      item.evaluationStatus,
                    )}
                  </span>
                </div>

                <div className="mt-5 space-y-0">
                  {item.trace.map((event, index) => {
                    const last =
                      index === item.trace!.length - 1;

                    return (
                      <div
                        key={event.id}
                        className="relative flex gap-4 pb-5 last:pb-0"
                      >
                        {!last ? (
                          <span className="absolute left-[5px] top-4 h-[calc(100%-8px)] w-px bg-admin-border" />
                        ) : null}

                        <span
                          className={[
                            "relative z-10 mt-1.5 h-3 w-3 shrink-0 rounded-full",
                            last
                              ? "bg-[#03AEFE]"
                              : "bg-admin-border",
                          ].join(" ")}
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs font-bold text-admin-text">
                              {event.title}
                            </p>

                            <span className="text-[10px] text-admin-text-muted">
                              {event.time}
                            </span>
                          </div>

                          {event.description ? (
                            <p className="mt-1 text-[11px] leading-5 text-admin-text-soft">
                              {event.description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {item.advisorState === "IN_REVIEW" &&
            item.assignedAdvisorName ? (
              <section className="mt-5 overflow-hidden rounded-2xl bg-white">
                <div className="flex items-center justify-between gap-3 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF7FF] text-[#1B5BB6]">
                      <MessageCircle
                        aria-hidden="true"
                        size={16}
                        strokeWidth={1.8}
                      />
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-admin-text">
                        Conversación
                      </h4>

                      <p className="mt-0.5 text-[11px] text-admin-text-soft">
                        Judith · {item.assignedAdvisorName}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Activo
                  </span>
                </div>

                <div className="bg-[#F7F9FC] px-4 py-5 sm:px-5">
                  {chatMessages.length > 0 ? (
                    <div className="space-y-4">
                      {chatMessages.map((message) => {
                        const isJudith =
                          message.sender === "JUDITH";

                        return (
                          <div
                            key={message.id}
                            className={[
                              "flex",
                              isJudith
                                ? "justify-end"
                                : "justify-start",
                            ].join(" ")}
                          >
                            <div
                              className={[
                                "max-w-[82%] sm:max-w-[70%]",
                                isJudith
                                  ? "text-right"
                                  : "text-left",
                              ].join(" ")}
                            >
                              <div className="mb-1 flex items-center gap-2">
                                {!isJudith ? (
                                  <>
                                    <span className="text-[10px] font-bold text-admin-text">
                                      {message.senderName}
                                    </span>

                                    <span className="text-[9px] text-admin-text-muted">
                                      {message.time}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span className="ml-auto text-[9px] text-admin-text-muted">
                                      {message.time}
                                    </span>

                                    <span className="text-[10px] font-bold text-[#1B5BB6]">
                                      Tú
                                    </span>
                                  </>
                                )}
                              </div>

                              <div
                                className={[
                                  "inline-block rounded-2xl px-4 py-3 text-left text-xs leading-5",
                                  isJudith
                                    ? "rounded-br-md bg-[#03AEFE] text-white"
                                    : "rounded-bl-md bg-white text-admin-text",
                                ].join(" ")}
                              >
                                {message.message}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <MessageCircle
                        aria-hidden="true"
                        size={20}
                        className="mx-auto text-admin-text-muted"
                      />

                      <p className="mt-2 text-xs font-semibold text-admin-text">
                        Aún no hay mensajes
                      </p>

                      <p className="mt-1 text-[10px] text-admin-text-soft">
                        Puedes escribirle al asesor sobre esta solicitud.
                      </p>
                    </div>
                  )}

                  <div className="mt-5 flex items-end gap-2 rounded-2xl bg-white p-2">
                    <textarea
                      value={chatInput}
                      onChange={(event) =>
                        setChatInput(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          !event.shiftKey
                        ) {
                          event.preventDefault();
                          sendChatMessage();
                        }
                      }}
                      rows={1}
                      placeholder={`Escribir a ${item.assignedAdvisorName}...`}
                      className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-3 py-2.5 text-xs leading-5 text-admin-text outline-none placeholder:text-admin-text-muted"
                    />

                    <button
                      type="button"
                      onClick={sendChatMessage}
                      disabled={!chatInput.trim()}
                      aria-label="Enviar mensaje"
                      className={[
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                        chatInput.trim()
                          ? "bg-[#03AEFE] text-white hover:bg-[#1B5BB6]"
                          : "cursor-not-allowed bg-admin-surface-soft text-admin-text-muted",
                      ].join(" ")}
                    >
                      <Send
                        aria-hidden="true"
                        size={15}
                      />
                    </button>
                  </div>

                  <p className="mt-2 px-1 text-[9px] text-admin-text-muted">
                    Enter para enviar · Shift + Enter para una nueva línea
                  </p>
                </div>
              </section>
            ) : null}

            {/* ORIGEN */}
            <section className="mt-6 flex flex-col gap-4 rounded-xl border border-admin-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-admin-surface-soft text-admin-text-soft">
                  <UserRound
                    aria-hidden="true"
                    size={16}
                  />
                </div>

                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-admin-text-muted">
                    Gestor de origen
                  </p>

                  <p className="mt-1 text-sm font-bold text-admin-text">
                    Jhoseline Apaza
                  </p>
                </div>
              </div>

              <p className="text-xs text-admin-text-soft">
                Expediente preparado y enviado para evaluación.
              </p>
            </section>

            {/* ACCIONES */}
            {item.advisorState === "PENDING" ? (
              <section className="mt-5 flex justify-end">
                <Link
                  href={`/solicitudes/${application.id}`}
                  className="group/action inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-black px-5 text-xs font-bold text-white transition-colors hover:bg-primary-dark"
                >
                  Revisar y asignar

                  <ArrowRight
                    aria-hidden="true"
                    size={15}
                    className="transition-transform duration-200 group-hover/action:translate-x-0.5"
                  />
                </Link>
              </section>
            ) : null}

            {item.advisorState === "COMPLETED" ? (
              <section className="mt-5">
                <div className="flex flex-col gap-3 rounded-xl bg-admin-surface-soft px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold text-admin-text">
                      Evaluación finalizada
                    </p>

                    <p className="mt-1 text-[10px] text-admin-text-soft">
                      Consulta el tracing para revisar cómo se resolvió el caso.
                    </p>
                  </div>

                  <span
                    className={[
                      "inline-flex w-fit rounded-full px-3 py-1.5 text-[10px] font-bold",
                      getEvaluationStatusClasses(
                        item.evaluationStatus,
                      ),
                    ].join(" ")}
                  >
                    {getEvaluationStatusLabel(
                      item.evaluationStatus,
                    )}
                  </span>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function LoanAdvisorDashboard() {
  const [filter, setFilter] =
    useState<AdvisorFilter>("PENDING");

  const [search, setSearch] = useState("");

  const [openApplicationId, setOpenApplicationId] =
    useState<string | null>(null);

  const [evaluationSubfilter, setEvaluationSubfilter] =
    useState<EvaluationSubfilter>("ALL");

  const baseApplication = INITIAL_APPLICATIONS[0];

  const initialCases = useMemo<AdvisorCase[]>(() => {
    if (!baseApplication) {
      return [];
    }

    const makeCase = (
      application: Application,
      advisorState: AdvisorFilter,
      assignedAt: string,
      scoringLabel: string,
      managerHandoff = false,
      assignedAdvisorName?: string,
      evaluationStatus?: AdvisorEvaluationStatus,
      trace: AdvisorTraceEvent[] = [],
    ): AdvisorCase => ({
      application,
      advisorState,
      assignedAt,
      scoringLabel,
      managerHandoff,
      assignedAdvisorName,
      evaluationStatus,
      trace,
    });

    return [
      makeCase(
        cloneApplication(baseApplication, {
          id: "advisor-001",
          code: "KIV-2026-101",
          firstName: "Luis",
          lastName: "Quispe",
          identityNumber: "7214589",
          city: "El Alto",
          requestedAmount: 15000,
          monthlyNetIncome: 6500,
          residualCapacity: 2100,
          status: "PENDING_SCORING",
        }),
        "PENDING",
        "hace 18 min",
        "Disponible",
      ),

      makeCase(
        cloneApplication(baseApplication, {
          id: "advisor-002",
          code: "KIV-2026-102",
          firstName: "Carla",
          lastName: "Flores",
          identityNumber: "6958741",
          city: "La Paz",
          requestedAmount: 22000,
          monthlyNetIncome: 8200,
          residualCapacity: 2650,
          status: "PENDING_SCORING",
        }),
        "PENDING",
        "hace 34 min",
        "Disponible",
      ),

      makeCase(
        cloneApplication(baseApplication, {
          id: "advisor-003",
          code: "KIV-2026-103",
          firstName: "Diego",
          lastName: "Mamani",
          identityNumber: "7345218",
          city: "El Alto",
          requestedAmount: 18000,
          monthlyNetIncome: 7100,
          residualCapacity: 1950,
          status: "PENDING_SCORING",
        }),
        "PENDING",
        "hace 1 h",
        "Disponible",
      ),

      makeCase(
        cloneApplication(baseApplication, {
          id: "advisor-004",
          code: "KIV-2026-104",
          firstName: "Paola",
          lastName: "Vargas",
          identityNumber: "7482365",
          city: "La Paz",
          requestedAmount: 28000,
          monthlyNetIncome: 9800,
          residualCapacity: 3100,
          status: "SCORING_PROCESSED",
        }),
        "IN_REVIEW",
        "hace 3 h",
        "Scoring procesado · Revisar",
        false,
        "Carlos Mendoza",
        "ANALYZING",
        [
          {
            id: "trace-004-1",
            time: "10:42",
            title: "Asignado por Judith Blanco",
            description: "Carlos Mendoza recibe la solicitud.",
          },
          {
            id: "trace-004-2",
            time: "10:48",
            title: "Expediente abierto",
            description: "Carlos inició la revisión financiera.",
          },
          {
            id: "trace-004-3",
            time: "11:06",
            title: "Análisis financiero en curso",
            description: "Revisión de capacidad, scoring y respaldos.",
          },
        ],
      ),

      makeCase(
        cloneApplication(baseApplication, {
          id: "advisor-005",
          code: "KIV-2026-105",
          firstName: "Mariela",
          lastName: "Condori",
          identityNumber: "6842157",
          city: "La Paz",
          requestedAmount: 12000,
          monthlyNetIncome: 5400,
          residualCapacity: 1650,
          status: "SCORING_PROCESSED",
        }),
        "IN_REVIEW",
        "ayer",
        "Scoring procesado · Favorable",
        false,
        "Luis Paredes",
        "RESUMED",
        [
          {
            id: "trace-005-1",
            time: "09:20",
            title: "Asignado por Judith Blanco",
          },
          {
            id: "trace-005-2",
            time: "09:47",
            title: "Observación registrada",
            description: "Se solicitó respaldo adicional de ingresos.",
          },
          {
            id: "trace-005-3",
            time: "10:18",
            title: "Documento corregido",
            description: "Se recibió el respaldo solicitado.",
          },
          {
            id: "trace-005-4",
            time: "10:30",
            title: "Evaluación retomada",
            description: "Luis continúa con el análisis.",
          },
        ],
      ),

      makeCase(
        cloneApplication(baseApplication, {
          id: "advisor-006",
          code: "KIV-2026-106",
          firstName: "Juan Carlos",
          lastName: "Pérez",
          identityNumber: "6178425",
          city: "La Paz",
          requestedAmount: 30000,
          monthlyNetIncome: 7800,
          residualCapacity: 900,
          status: "DOCUMENT_REVIEW",
        }),
        "IN_REVIEW",
        "ayer",
        "Requiere documentación",
        false,
        "María Rojas",
        "OBSERVED",
        [
          {
            id: "trace-006-1",
            time: "15:12",
            title: "Asignado por Judith Blanco",
          },
          {
            id: "trace-006-2",
            time: "15:40",
            title: "Observación registrada",
            description: "Falta respaldo de ingreso variable.",
          },
        ],
      ),

      makeCase(
        cloneApplication(baseApplication, {
          id: "advisor-007",
          code: "KIV-2026-107",
          firstName: "Ana",
          lastName: "Choque",
          identityNumber: "7598214",
          city: "El Alto",
          requestedAmount: 17000,
          monthlyNetIncome: 7600,
          residualCapacity: 2300,
          status: "PREAPPROVED",
        }),
        "COMPLETED",
        "hace 2 días",
        "Favorable",
        false,
        "Carlos Mendoza",
        "APPROVED",
        [
          {
            id: "trace-007-1",
            time: "09:10",
            title: "Asignado por Judith Blanco",
          },
          {
            id: "trace-007-2",
            time: "10:05",
            title: "Evaluación finalizada",
            description: "Resultado favorable.",
          },
          {
            id: "trace-007-3",
            time: "10:12",
            title: "Solicitud aprobada",
          },
        ],
      ),

      makeCase(
        cloneApplication(baseApplication, {
          id: "advisor-008",
          code: "KIV-2026-108",
          firstName: "Roberto",
          lastName: "Calle",
          identityNumber: "6124587",
          city: "La Paz",
          requestedAmount: 24000,
          monthlyNetIncome: 9000,
          residualCapacity: 2800,
          status: "REJECTED",
        }),
        "COMPLETED",
        "hace 2 días",
        "Desfavorable",
        false,
        "Luis Paredes",
        "REJECTED",
        [
          {
            id: "trace-008-1",
            time: "08:40",
            title: "Asignado por Judith Blanco",
          },
          {
            id: "trace-008-2",
            time: "09:30",
            title: "Evaluación finalizada",
          },
          {
            id: "trace-008-3",
            time: "09:34",
            title: "Solicitud rechazada",
            description: "Capacidad de pago insuficiente.",
          },
        ],
      ),
    ];
  }, [baseApplication]);

  const [cases] =
    useState<AdvisorCase[]>(initialCases);

  const counts = useMemo(() => {
    return {
      PENDING: cases.filter(
        (item) => item.advisorState === "PENDING",
      ).length,
      IN_REVIEW: cases.filter(
        (item) => item.advisorState === "IN_REVIEW",
      ).length,
      COMPLETED: cases.filter(
        (item) => item.advisorState === "COMPLETED",
      ).length,
    };
  }, [cases]);

  const evaluationCounts = useMemo(() => {
    const evaluationCases = cases.filter(
      (item) => item.advisorState === "IN_REVIEW",
    );

    return {
      ALL: evaluationCases.length,
      ANALYZING: evaluationCases.filter(
        (item) =>
          item.evaluationStatus === "ANALYZING" ||
          item.evaluationStatus === "ASSIGNED",
      ).length,
      OBSERVED: evaluationCases.filter(
        (item) =>
          item.evaluationStatus === "OBSERVED",
      ).length,
      RESUMED: evaluationCases.filter(
        (item) =>
          item.evaluationStatus === "RESUMED",
      ).length,
    };
  }, [cases]);

  const visibleCases = cases.filter((item) => {
    if (item.advisorState !== filter) {
      return false;
    }

    if (filter === "IN_REVIEW") {
      if (
        evaluationSubfilter === "ANALYZING" &&
        item.evaluationStatus !== "ANALYZING" &&
        item.evaluationStatus !== "ASSIGNED"
      ) {
        return false;
      }

      if (
        evaluationSubfilter === "OBSERVED" &&
        item.evaluationStatus !== "OBSERVED"
      ) {
        return false;
      }

      if (
        evaluationSubfilter === "RESUMED" &&
        item.evaluationStatus !== "RESUMED"
      ) {
        return false;
      }
    }

    const value = search.trim().toLowerCase();

    if (!value) {
      return true;
    }

    return (
      item.application.applicant.fullName
        .toLowerCase()
        .includes(value) ||
      item.application.code
        .toLowerCase()
        .includes(value) ||
      item.application.applicant.identityNumber.includes(value)
    );
  });

  const handleFilterChange = (
    nextFilter: AdvisorFilter,
  ) => {
    setFilter(nextFilter);
    setEvaluationSubfilter("ALL");
    setOpenApplicationId(null);
  };

  const toggleApplication = (
    applicationId: string,
  ) => {
    setOpenApplicationId((current) =>
      current === applicationId
        ? null
        : applicationId,
    );
  };

  const filters: {
    value: AdvisorFilter;
    label: string;
    description: string;
    count: number;
  }[] = [
    {
      value: "PENDING",
      label: "Por asignar",
      description: "Pendientes de asesor",
      count: counts.PENDING,
    },
    {
      value: "IN_REVIEW",
      label: "En evaluación",
      description: "Asignadas a un asesor",
      count: counts.IN_REVIEW,
    },
    {
      value: "COMPLETED",
      label: "Evaluadas",
      description: "Proceso finalizado",
      count: counts.COMPLETED,
    },
  ];

  return (
    <BackofficeLayout
      title="Tablero"
      description="Evalúa las solicitudes que ya completaron la validación inicial."
    >
      <div className="mx-auto max-w-[1500px] space-y-5">
        <section>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#1B5BB6]">
                Asesor de préstamos
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-admin-text">
                Buenos días, Judith
              </h1>

              <p className="mt-2 text-sm text-admin-text-soft">
                Tienes {counts.PENDING} solicitudes por evaluar y{" "}
                {counts.IN_REVIEW} en evaluación.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl bg-[#EAF7FF] px-4 py-2.5 text-xs font-bold text-[#1B5BB6]">
              <Clock3
                aria-hidden="true"
                size={15}
              />
              Evaluación objetivo: 24–48 h
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() =>
                handleFilterChange(item.value)
              }
              className={[
                "group rounded-2xl border p-4 text-left transition-all duration-200",
                filter === item.value
                  ? "border-[#03AEFE]/45 bg-[#EAF7FF] shadow-[0_6px_20px_rgba(3,174,254,0.08)]"
                  : "border-admin-border bg-white hover:border-[#03AEFE]/35 hover:bg-[#F6FBFF]",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-admin-text">
                    {item.label}
                  </p>

                  <p className="mt-1 text-[10px] text-admin-text-soft">
                    {item.description}
                  </p>
                </div>

                <span
                  className={[
                    "inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-bold transition-colors",
                    filter === item.value
                      ? "bg-[#03AEFE] text-white"
                      : "bg-admin-surface-soft text-admin-text-soft group-hover:bg-[#DFF4FF] group-hover:text-[#1B5BB6]",
                  ].join(" ")}
                >
                  {item.count}
                </span>
              </div>
            </button>
          ))}
        </section>

        <section className="rounded-2xl border border-admin-border bg-white">
          <div className="flex flex-col gap-4 border-b border-admin-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="text-base font-bold text-admin-text">
                {filter === "PENDING"
                  ? "Solicitudes por asignar"
                  : filter === "IN_REVIEW"
                    ? "Solicitudes asignadas en evaluación"
                    : "Evaluaciones finalizadas"}
              </h2>

              <p className="mt-1 text-xs text-admin-text-soft">
                {filter === "PENDING"
                  ? "Selecciona un caso y asigna el asesor responsable."
                  : filter === "IN_REVIEW"
                    ? "Consulta el estado actual y el historial de trabajo de cada asesor."
                    : "Consulta los casos aprobados y rechazados junto con su trazabilidad."}
              </p>
            </div>

            <div className="flex h-10 w-full items-center gap-2 rounded-xl border border-admin-border bg-white px-3 transition-colors focus-within:border-[#03AEFE] sm:w-[300px]">
              <Search
                aria-hidden="true"
                size={16}
                className="shrink-0 text-admin-text-muted"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Buscar cliente, CI o código..."
                className="min-w-0 flex-1 bg-transparent text-xs text-admin-text outline-none placeholder:text-admin-text-muted"
              />
            </div>
          </div>

          {filter === "IN_REVIEW" ? (
            <div className="border-b border-admin-border px-4 py-3 sm:px-5">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  {
                    value: "ALL" as EvaluationSubfilter,
                    label: "Todas",
                    count: evaluationCounts.ALL,
                  },
                  {
                    value: "ANALYZING" as EvaluationSubfilter,
                    label: "En análisis",
                    count: evaluationCounts.ANALYZING,
                  },
                  {
                    value: "OBSERVED" as EvaluationSubfilter,
                    label: "Observadas",
                    count: evaluationCounts.OBSERVED,
                  },
                  {
                    value: "RESUMED" as EvaluationSubfilter,
                    label: "Retomadas",
                    count: evaluationCounts.RESUMED,
                  },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setEvaluationSubfilter(item.value);
                      setOpenApplicationId(null);
                    }}
                    className={[
                      "inline-flex h-9 items-center gap-2 rounded-xl px-3.5 text-xs font-semibold transition-colors",
                      evaluationSubfilter === item.value
                        ? "bg-[#EAF7FF] text-[#1B5BB6]"
                        : "bg-admin-surface-soft text-admin-text-soft hover:bg-[#F2FAFF] hover:text-[#1B5BB6]",
                    ].join(" ")}
                  >
                    {item.label}

                    <span
                      className={[
                        "inline-flex min-w-5 items-center justify-center rounded-md px-1.5 py-0.5 text-[9px] font-bold",
                        evaluationSubfilter === item.value
                          ? "bg-[#03AEFE] text-white"
                          : "bg-white text-admin-text-muted",
                      ].join(" ")}
                    >
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-3 bg-admin-page/30 p-4 sm:p-5">
            {visibleCases.length > 0 ? (
              visibleCases.map((item) => (
                <AdvisorApplicationCard
                  key={item.application.id}
                  item={item}
                  open={
                    openApplicationId ===
                    item.application.id
                  }
                  onToggle={() =>
                    toggleApplication(
                      item.application.id,
                    )
                  }
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-admin-border bg-white px-6 py-12 text-center">
                <AlertTriangle
                  aria-hidden="true"
                  size={22}
                  className="mx-auto text-admin-text-muted"
                />

                <p className="mt-3 text-sm font-bold text-admin-text">
                  No hay solicitudes en esta bandeja
                </p>

                <p className="mt-1 text-xs text-admin-text-soft">
                  Cuando existan solicitudes con este estado aparecerán aquí.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </BackofficeLayout>
  );
}
