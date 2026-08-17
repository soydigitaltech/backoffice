"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  CircleDollarSign,
  FileCheck2,
  Gauge,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import BackofficeLayout from "@/components/layout/BackofficeLayout";
import type { Application } from "@/types/application";

type LoanAdvisorEvaluationViewProps = {
  application: Application;
};

type AdvisorDecision =
  | "OBSERVED"
  | "REJECTED"
  | "ASSIGNED"
  | null;

type LoanAdvisor = {
  id: string;
  name: string;
  activeAssignments: number;
  maxAssignments: number;
};

const LOAN_ADVISORS: LoanAdvisor[] = [
  {
    id: "advisor-maria",
    name: "María Rojas",
    activeAssignments: 6,
    maxAssignments: 10,
  },
  {
    id: "advisor-carlos",
    name: "Carlos Mendoza",
    activeAssignments: 8,
    maxAssignments: 10,
  },
  {
    id: "advisor-luis",
    name: "Luis Paredes",
    activeAssignments: 9,
    maxAssignments: 10,
  },
  {
    id: "advisor-andrea",
    name: "Andrea Vargas",
    activeAssignments: 10,
    maxAssignments: 10,
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-BO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function LoanAdvisorEvaluationView({
  application,
}: LoanAdvisorEvaluationViewProps) {
  const [decision, setDecision] =
    useState<AdvisorDecision>(null);

  const [selectedAdvisorId, setSelectedAdvisorId] =
    useState<string | null>(null);

  const [assignedAdvisor, setAssignedAdvisor] =
    useState<LoanAdvisor | null>(null);

  const [handoffNote, setHandoffNote] =
    useState("");

  const [savedHandoffNote, setSavedHandoffNote] =
    useState("");

  const [advisorLoads, setAdvisorLoads] = useState(
    () =>
      Object.fromEntries(
        LOAN_ADVISORS.map((advisor) => [
          advisor.id,
          advisor.activeAssignments,
        ]),
      ) as Record<string, number>,
  );

  const assignSelectedAdvisor = () => {
    if (!selectedAdvisorId) {
      return;
    }

    const advisor = LOAN_ADVISORS.find(
      (item) => item.id === selectedAdvisorId,
    );

    if (!advisor) {
      return;
    }

    const currentLoad =
      advisorLoads[advisor.id] ??
      advisor.activeAssignments;

    if (currentLoad >= advisor.maxAssignments) {
      return;
    }

    const updatedAdvisor = {
      ...advisor,
      activeAssignments: currentLoad + 1,
    };

    setAdvisorLoads((current) => ({
      ...current,
      [advisor.id]: currentLoad + 1,
    }));

    setAssignedAdvisor(updatedAdvisor);
    setSavedHandoffNote(handoffNote.trim());
    setDecision("ASSIGNED");
  };



  return (
    <BackofficeLayout
      title="Evaluación del préstamo"
      description="Analiza el expediente financiero antes de emitir una recomendación."
    >
      <div className="mx-auto max-w-[1500px] space-y-5">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-admin-text-soft transition-colors hover:text-[#1B5BB6]"
        >
          <ArrowLeft
            aria-hidden="true"
            size={15}
          />
          Volver al tablero
        </Link>

        {/* CLIENTE */}
        <section className="rounded-2xl border border-admin-border bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold text-[#1B5BB6]">
                {application.code}
              </p>

              <h1 className="mt-1 text-xl font-bold text-admin-text">
                {application.applicant.fullName}
              </h1>

              <p className="mt-1 text-xs text-admin-text-soft">
                CI {application.applicant.identityNumber} ·{" "}
                {application.applicant.city}
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#EAF7FF] px-4 py-2.5 text-xs font-bold text-[#1B5BB6]">
              <ShieldCheck
                aria-hidden="true"
                size={15}
              />
              Expediente recibido para evaluación
            </div>
          </div>
        </section>

        {/* 1. SIN COLOR */}
        <section className="rounded-2xl border border-admin-border bg-white p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <CircleDollarSign
              aria-hidden="true"
              size={18}
              className="text-[#1B5BB6]"
            />

            <div>
              <h2 className="text-base font-bold text-admin-text">
                Resumen financiero
              </h2>

              <p className="mt-0.5 text-xs text-admin-text-soft">
                Variables principales declaradas y calculadas.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-admin-border p-4">
              <BriefcaseBusiness
                aria-hidden="true"
                size={16}
                className="text-[#1B5BB6]"
              />

              <p className="mt-3 text-[10px] uppercase tracking-[0.06em] text-admin-text-muted">
                Ingreso mensual
              </p>

              <p className="mt-1 text-lg font-bold text-admin-text">
                Bs{" "}
                {formatCurrency(
                  application.employment.monthlyNetIncome,
                )}
              </p>
            </div>

            <div className="rounded-xl border border-admin-border p-4">
              <CircleDollarSign
                aria-hidden="true"
                size={16}
                className="text-[#1B5BB6]"
              />

              <p className="mt-3 text-[10px] uppercase tracking-[0.06em] text-admin-text-muted">
                Monto solicitado
              </p>

              <p className="mt-1 text-lg font-bold text-admin-text">
                Bs{" "}
                {formatCurrency(
                  application.loan.requestedAmount,
                )}
              </p>
            </div>

            <div className="rounded-xl border border-admin-border p-4">
              <WalletCards
                aria-hidden="true"
                size={16}
                className="text-[#1B5BB6]"
              />

              <p className="mt-3 text-[10px] uppercase tracking-[0.06em] text-admin-text-muted">
                Capacidad residual
              </p>

              <p className="mt-1 text-lg font-bold text-emerald-700">
                Bs{" "}
                {formatCurrency(
                  application.loan.residualCapacity,
                )}
              </p>
            </div>

            <div className="rounded-xl border border-admin-border p-4">
              <Gauge
                aria-hidden="true"
                size={16}
                className="text-[#1B5BB6]"
              />

              <p className="mt-3 text-[10px] uppercase tracking-[0.06em] text-admin-text-muted">
                Deuda / ingreso
              </p>

              <p className="mt-1 text-lg font-bold text-admin-text">
                {application.loan.debtToIncomeRatio}%
              </p>
            </div>
          </div>
        </section>

        {/* 2. CON COLOR */}
        <section className="rounded-2xl border border-[#03AEFE]/20 bg-[#F2FAFF] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DFF4FF] text-[#1B5BB6]">
              <Gauge
                aria-hidden="true"
                size={18}
              />
            </div>

            <div>
              <h2 className="text-base font-bold text-admin-text">
                Riesgo y scoring
              </h2>

              <p className="mt-0.5 text-xs text-admin-text-soft">
                Indicadores clave para la decisión financiera.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            <div className="rounded-xl border border-[#03AEFE]/15 bg-white p-4">
              <p className="text-[10px] uppercase tracking-[0.06em] text-admin-text-muted">
                Estado del scoring
              </p>

              <p className="mt-2 text-sm font-bold text-admin-text">
                {application.scoring.status}
              </p>
            </div>

            <div className="rounded-xl border border-[#03AEFE]/15 bg-white p-4">
              <p className="text-[10px] uppercase tracking-[0.06em] text-admin-text-muted">
                Resultado
              </p>

              <p className="mt-2 text-sm font-bold text-admin-text">
                {application.scoring.result}
              </p>
            </div>

            <div className="rounded-xl border border-[#03AEFE]/15 bg-white p-4">
              <p className="text-[10px] uppercase tracking-[0.06em] text-admin-text-muted">
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

        {/* 3. SIN COLOR */}
        <section className="rounded-2xl border border-admin-border bg-white p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <FileCheck2
              aria-hidden="true"
              size={18}
              className="text-[#1B5BB6]"
            />

            <div>
              <h2 className="text-base font-bold text-admin-text">
                Expediente validado
              </h2>

              <p className="mt-0.5 text-xs text-admin-text-soft">
                Información preparada previamente por Gestión de Clientes.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {[
              "Datos del cliente",
              "Información laboral",
              "Documentación inicial",
              "Autorización BIC",
            ].map((label) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-xl bg-admin-surface-soft px-4 py-3 text-xs font-semibold text-admin-text"
              >
                <CheckCircle2
                  aria-hidden="true"
                  size={15}
                  className="text-emerald-600"
                />

                {label}
              </div>
            ))}
          </div>
        </section>

        {/* ASIGNACIÓN DE ASESOR */}
        <section className="overflow-hidden rounded-2xl bg-[#EAF7FF]">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#1B5BB6]">
                  Siguiente paso
                </p>

                <h2 className="mt-1 text-base font-bold text-admin-text">
                  Asignación de asesor
                </h2>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-admin-text-soft">
                  Selecciona quién continuará la gestión de esta
                  solicitud. La solicitud necesita un asesor
                  responsable para continuar.
                </p>
              </div>

              {decision === "ASSIGNED" &&
              assignedAdvisor ? (
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700">
                  <Check
                    aria-hidden="true"
                    size={13}
                    strokeWidth={2.5}
                  />
                  Asignación completada
                </span>
              ) : null}
            </div>

            {decision !== "ASSIGNED" ? (
              <>
                <div className="mt-6 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                  {LOAN_ADVISORS.map((advisor) => {
                    const currentLoad =
                      advisorLoads[advisor.id] ??
                      advisor.activeAssignments;

                    const full =
                      currentLoad >=
                      advisor.maxAssignments;

                    const lastSlot =
                      currentLoad ===
                      advisor.maxAssignments - 1;

                    const highLoad =
                      currentLoad >= 8 &&
                      !lastSlot &&
                      !full;

                    const selected =
                      selectedAdvisorId ===
                      advisor.id;

                    return (
                      <button
                        key={advisor.id}
                        type="button"
                        disabled={full}
                        onClick={() =>
                          setSelectedAdvisorId(
                            advisor.id,
                          )
                        }
                        className={[
                          "relative flex min-h-[94px] items-center gap-3 rounded-xl p-4 text-left transition-colors duration-200",
                          full
                            ? "cursor-not-allowed bg-white/45 opacity-55"
                            : selected
                              ? "bg-white"
                              : "bg-white/65 hover:bg-white",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all",
                            selected
                              ? "border-[#03AEFE] bg-[#03AEFE]"
                              : "border-admin-border bg-white",
                          ].join(" ")}
                        >
                          {selected ? (
                            <Check
                              aria-hidden="true"
                              size={12}
                              strokeWidth={3}
                              className="text-white"
                            />
                          ) : null}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-admin-text">
                            {advisor.name}
                          </p>

                          <p className="mt-1 text-[10px] text-admin-text-muted">
                            {currentLoad}/
                            {advisor.maxAssignments} solicitudes
                          </p>

                          <p
                            className={[
                              "mt-1 text-[9px] font-bold uppercase tracking-[0.04em]",
                              full
                                ? "text-red-500"
                                : lastSlot
                                  ? "text-amber-600"
                                  : highLoad
                                    ? "text-amber-600"
                                    : "text-emerald-600",
                            ].join(" ")}
                          >
                            {full
                              ? "Sin cupos"
                              : lastSlot
                                ? "Último cupo"
                                : highLoad
                                  ? "Alta carga"
                                  : "Disponible"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {!selectedAdvisorId ? (
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-admin-surface-soft px-4 py-3">
                    <ShieldCheck
                      aria-hidden="true"
                      size={15}
                      className="shrink-0 text-admin-text-muted"
                    />

                    <p className="text-[11px] font-medium text-admin-text-soft">
                      Selecciona un asesor para continuar con la
                      asignación.
                    </p>
                  </div>
                ) : null}

                <div
                  className={[
                    "grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out",
                    selectedAdvisorId
                      ? "mt-5 grid-rows-[1fr] opacity-100"
                      : "mt-0 grid-rows-[0fr] opacity-0",
                  ].join(" ")}
                >
                  <div className="overflow-hidden">
                    <div className="pt-5">
                      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <label
                              htmlFor="advisor-handoff-note"
                              className="text-xs font-bold text-admin-text"
                            >
                              Observación para el asesor
                            </label>

                            <span className="text-[10px] font-semibold text-admin-text-muted">
                              Opcional
                            </span>
                          </div>

                          <p className="mt-1 text-[11px] leading-5 text-admin-text-soft">
                            Agrega información relevante para que
                            pueda continuar la gestión con contexto.
                          </p>

                          <textarea
                            id="advisor-handoff-note"
                            value={handoffNote}
                            onChange={(event) =>
                              setHandoffNote(
                                event.target.value,
                              )
                            }
                            rows={4}
                            maxLength={500}
                            placeholder="Ej. Cliente con buena capacidad de pago. Revisar respaldo de ingresos antes de continuar."
                            className="mt-3 w-full resize-none rounded-xl border border-admin-border bg-white px-4 py-3 text-sm leading-5 text-admin-text outline-none transition-colors placeholder:text-admin-text-muted focus:border-[#03AEFE]"
                          />

                          <p className="mt-1.5 text-right text-[10px] text-admin-text-muted">
                            {handoffNote.length}/500
                          </p>
                        </div>

                        {selectedAdvisorId ? (() => {
                          const selectedAdvisor =
                            LOAN_ADVISORS.find(
                              (advisor) =>
                                advisor.id ===
                                selectedAdvisorId,
                            );

                          if (!selectedAdvisor) {
                            return null;
                          }

                          const currentLoad =
                            advisorLoads[
                              selectedAdvisor.id
                            ] ??
                            selectedAdvisor.activeAssignments;

                          const nextLoad =
                            currentLoad + 1;

                          const reachesCapacity =
                            nextLoad >=
                            selectedAdvisor.maxAssignments;

                          return (
                            <div className="rounded-xl bg-white/70 p-4">
                              <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#1B5BB6]">
                                Resumen de asignación
                              </p>

                              <p className="mt-2 text-sm font-bold text-admin-text">
                                {selectedAdvisor.name}
                              </p>

                              <div className="mt-3 flex items-center justify-between text-xs">
                                <span className="text-admin-text-soft">
                                  Carga actual
                                </span>

                                <span className="font-bold text-admin-text">
                                  {currentLoad}/
                                  {selectedAdvisor.maxAssignments}
                                </span>
                              </div>

                              <div className="mt-2 flex items-center justify-between text-xs">
                                <span className="text-admin-text-soft">
                                  Después de asignar
                                </span>

                                <span
                                  className={[
                                    "font-bold",
                                    reachesCapacity
                                      ? "text-amber-700"
                                      : "text-emerald-700",
                                  ].join(" ")}
                                >
                                  {nextLoad}/
                                  {selectedAdvisor.maxAssignments}
                                </span>
                              </div>

                              {reachesCapacity ? (
                                <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2">
                                  <p className="text-[10px] font-bold text-amber-700">
                                    Alcanzará su capacidad máxima.
                                  </p>
                                </div>
                              ) : null}
                            </div>
                          );
                        })() : null}
                      </div>

                      <div className="mt-5 flex justify-end">
                        <button
                          type="button"
                          onClick={assignSelectedAdvisor}
                          className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-black px-5 text-xs font-bold text-white transition-colors hover:bg-primary-dark"
                        >
                          <ShieldCheck
                            aria-hidden="true"
                            size={16}
                          />

                          Asignar y enviar

                          <ArrowRight
                            aria-hidden="true"
                            size={15}
                            className="transition-transform duration-200 group-hover:translate-x-0.5"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {decision === "ASSIGNED" &&
          assignedAdvisor ? (
            <div className="border-t border-emerald-100 bg-[#F0FBF7] px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Check
                      aria-hidden="true"
                      size={18}
                      strokeWidth={2.5}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-emerald-800">
                      Solicitud asignada y enviada
                    </p>

                    <p className="mt-1 text-xs text-emerald-700">
                      {assignedAdvisor.name} continuará la
                      gestión de esta solicitud.
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-admin-text">
                        {assignedAdvisor.activeAssignments}/
                        {assignedAdvisor.maxAssignments} solicitudes activas
                      </span>

                      {assignedAdvisor.activeAssignments >=
                      assignedAdvisor.maxAssignments ? (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                          Capacidad completa
                        </span>
                      ) : null}
                    </div>

                    {savedHandoffNote ? (
                      <div className="mt-4 max-w-2xl rounded-xl border border-emerald-100 bg-white px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-admin-text-muted">
                          Observación de traspaso
                        </p>

                        <p className="mt-1.5 text-xs leading-5 text-admin-text">
                          {savedHandoffNote}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-bold text-emerald-700 shadow-sm">
                  <CheckCircle2
                    aria-hidden="true"
                    size={15}
                  />

                  Gestión transferida
                </div>
              </div>

              {assignedAdvisor.activeAssignments >=
              assignedAdvisor.maxAssignments ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-xs font-bold text-amber-800">
                    Capacidad completa
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-amber-700">
                    {assignedAdvisor.name} alcanzó el límite de{" "}
                    {assignedAdvisor.maxAssignments} solicitudes
                    activas. No podrá recibir nuevas asignaciones
                    hasta liberar capacidad.
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

      </div>
    </BackofficeLayout>
  );
}
