import { INITIAL_APPLICATIONS } from "@/mocks/applications";
import type { Application } from "@/types/application";

type AdvisorApplicationInput = {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  identityNumber: string;
  city: string;
  requestedAmount: number;
  monthlyNetIncome: number;
  residualCapacity: number;
  status: Application["status"];
};

function createAdvisorApplication(
  input: AdvisorApplicationInput,
): Application {
  const base = INITIAL_APPLICATIONS[0];

  if (!base) {
    throw new Error(
      "No existe una solicitud base para generar los casos del asesor.",
    );
  }

  return {
    ...base,
    id: input.id,
    code: input.code,
    status: input.status,

    applicant: {
      ...base.applicant,
      firstName: input.firstName,
      lastName: input.lastName,
      fullName: `${input.firstName} ${input.lastName}`,
      identityNumber: input.identityNumber,
      city: input.city,
    },

    employment: {
      ...base.employment,
      monthlyNetIncome: input.monthlyNetIncome,
    },

    loan: {
      ...base.loan,
      requestedAmount: input.requestedAmount,
      residualCapacity: input.residualCapacity,
    },

    assignedAdvisorId: "usr-judith",
    assignedAdvisorName: "Judith Blanco",
  };
}

export const ADVISOR_APPLICATIONS: Application[] = [
  createAdvisorApplication({
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

  createAdvisorApplication({
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

  createAdvisorApplication({
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

  createAdvisorApplication({
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

  createAdvisorApplication({
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

  createAdvisorApplication({
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

  createAdvisorApplication({
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

  createAdvisorApplication({
    id: "advisor-008",
    code: "KIV-2026-108",
    firstName: "Roberto",
    lastName: "Calle",
    identityNumber: "6124587",
    city: "La Paz",
    requestedAmount: 24000,
    monthlyNetIncome: 9000,
    residualCapacity: 2800,
    status: "PREAPPROVED",
  }),
];
