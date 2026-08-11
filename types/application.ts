export type ApplicationStatus =
  | "PENDING_DOCUMENTATION"
  | "DOCUMENT_REVIEW"
  | "PENDING_SEGIP"
  | "PENDING_SCORING"
  | "SCORING_PROCESSED"
  | "PREAPPROVED"
  | "REJECTED"
  | "COMPLEMENTARY_DOCUMENTATION"
  | "FORMALIZATION";

export type ApplicationDocumentStatus =
  | "MISSING"
  | "UPLOADED"
  | "OBSERVED"
  | "VALIDATED"
  | "REJECTED";

export type SegipStatus =
  | "PENDING"
  | "MATCH"
  | "INCONSISTENT"
  | "UNAVAILABLE";

export type ScoringStatus =
  | "NOT_STARTED"
  | "PENDING_UPLOAD"
  | "PROCESSING"
  | "PROCESSED"
  | "MANUAL_REVIEW"
  | "FAILED";

export type OnboardingStepCode =
  | "PERSONAL_DATA"
  | "EMPLOYMENT"
  | "FINANCIAL_INFORMATION"
  | "LOAN_SIMULATION"
  | "DOCUMENTS"
  | "BIC_AUTHORIZATION"
  | "SEGIP"
  | "SCORING"
  | "COMPLEMENTARY_DOCUMENTATION"
  | "FORMALIZATION";

export type OnboardingStepStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "BLOCKED";

export type OnboardingResponsibility =
  | "CLIENT"
  | "ADVISOR"
  | "SYSTEM"
  | "NONE";

export type OnboardingFlowState =
  | "ACTIVE"
  | "IDLE"
  | "BLOCKED"
  | "WAITING_CLIENT"
  | "WAITING_ADVISOR"
  | "WAITING_SYSTEM"
  | "COMPLETED";

export type OnboardingStepProgress = {
  code: OnboardingStepCode;
  label: string;
  order: number;
  status: OnboardingStepStatus;
  progress: number;
  completedFields: string[];
  pendingFields: string[];
  lastCompletedField: string | null;
  blockedReason: string | null;
  errorMessage: string | null;
  responsible: OnboardingResponsibility;
  startedAt: string | null;
  completedAt: string | null;
  lastActivityAt: string | null;
};

export type ApplicationOnboarding = {
  currentStep: OnboardingStepCode;
  currentStepLabel: string;
  state: OnboardingFlowState;
  progress: number;
  startedAt: string;
  lastActivityAt: string;
  idleSince: string | null;
  blockedReason: string | null;
  lastCompletedField: string | null;
  nextPendingField: string | null;
  responsible: OnboardingResponsibility;
  steps: OnboardingStepProgress[];
};

export type ApplicationDocumentType =
  | "BIC_AUTHORIZATION"
  | "ID_FRONT"
  | "ID_BACK"
  | "SELFIE";

export type ApplicationDocument = {
  id: string;
  type: ApplicationDocumentType;
  name: string;
  status: ApplicationDocumentStatus;
  uploadedAt: string | null;
  uploadedBy: string | null;
  version: number;
  observation: string | null;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
};

export type DeclaredDebt = {
  id: string;
  entity: string;
  amount: number;
};

export type ApplicationApplicant = {
  firstName: string;
  lastName: string;
  fullName: string;
  identityNumber: string;
  birthDate: string;
  age: number;
  email: string;
  phone: string;
  city: string;
  maritalStatus: string;
  housingType: string;
};

export type ApplicationEmployment = {
  activityType: "SALARIED" | "INDEPENDENT";
  companyOrActivity: string;
  positionOrOccupation: string;
  jobSeniorityMonths: number;
  monthlyNetIncome: number;
  dependents: number;
};

export type ApplicationLoanSimulation = {
  requestedAmount: number;
  termMonths: number;
  paymentDay: number;
  annualInterestRate: number;
  estimatedInstallment: number;
  totalDebt: number;
  debtToIncomeRatio: number;
  residualCapacity: number;
  paymentCapacityResult: "VIABLE" | "REVIEW" | "NOT_VIABLE";
  alternativeProposed: boolean;
  alternativeAmount: number | null;
  alternativeTermMonths: number | null;
  alternativeInstallment: number | null;
  alternativeDecision:
    | "NOT_APPLICABLE"
    | "ACCEPTED"
    | "MODIFIED"
    | "REJECTED";
};

export type ApplicationSegip = {
  status: SegipStatus;
  checkedAt: string | null;
  queryCode: string | null;
  identityNumberMatches: boolean | null;
  fullNameMatches: boolean | null;
  differences: string[];
};

export type ApplicationScoring = {
  status: ScoringStatus;
  authorizedForBureau: boolean;
  identityValidated: boolean;
  pdfFileName: string | null;
  pdfVersion: number | null;
  uploadedAt: string | null;
  processedAt: string | null;
  score: number | null;
  result: "PENDING" | "APPROVE" | "REVIEW" | "REJECT";
  reasons: string[];
};

export type Application = {
  id: string;
  code: string;
  status: ApplicationStatus;

  onboarding: ApplicationOnboarding;

  applicant: ApplicationApplicant;
  employment: ApplicationEmployment;
  declaredDebts: DeclaredDebt[];
  loan: ApplicationLoanSimulation;

  hasKnownNegativeReport: boolean;
  hasBankStatementsAvailable: boolean;
  loanPurpose: string;

  documents: ApplicationDocument[];
  segip: ApplicationSegip;
  scoring: ApplicationScoring;

  assignedAdvisorId: string;
  assignedAdvisorName: string;

  progress: number;
  nextAction: string;
  alerts: string[];

  createdAt: string;
  updatedAt: string;
};

export const APPLICATION_STATUS_LABELS: Record<
  ApplicationStatus,
  string
> = {
  PENDING_DOCUMENTATION: "Pendiente de documentación",
  DOCUMENT_REVIEW: "En revisión documental",
  PENDING_SEGIP: "Pendiente de SEGIP",
  PENDING_SCORING: "Pendiente de scoring",
  SCORING_PROCESSED: "Scoring procesado",
  PREAPPROVED: "Preaprobado",
  REJECTED: "Rechazado",
  COMPLEMENTARY_DOCUMENTATION: "Documentación complementaria",
  FORMALIZATION: "En formalización",
};

export const DOCUMENT_STATUS_LABELS: Record<
  ApplicationDocumentStatus,
  string
> = {
  MISSING: "Faltante",
  UPLOADED: "Cargado",
  OBSERVED: "Observado",
  VALIDATED: "Validado",
  REJECTED: "Rechazado",
};

export const SEGIP_STATUS_LABELS: Record<SegipStatus, string> = {
  PENDING: "Pendiente",
  MATCH: "Coincidencia",
  INCONSISTENT: "Inconsistente",
  UNAVAILABLE: "Servicio no disponible",
};

export const SCORING_STATUS_LABELS: Record<ScoringStatus, string> = {
  NOT_STARTED: "No iniciado",
  PENDING_UPLOAD: "Pendiente de carga",
  PROCESSING: "Procesando",
  PROCESSED: "Procesado",
  MANUAL_REVIEW: "Revisión manual",
  FAILED: "Fallido",
};

export const ONBOARDING_STEP_LABELS: Record<
  OnboardingStepCode,
  string
> = {
  PERSONAL_DATA: "Datos personales",
  EMPLOYMENT: "Actividad laboral",
  FINANCIAL_INFORMATION: "Información financiera",
  LOAN_SIMULATION: "Simulación",
  DOCUMENTS: "Documentos",
  BIC_AUTHORIZATION: "Autorización BIC",
  SEGIP: "SEGIP",
  SCORING: "Scoring",
  COMPLEMENTARY_DOCUMENTATION: "Documentación complementaria",
  FORMALIZATION: "Formalización",
};

export const ONBOARDING_STEP_STATUS_LABELS: Record<
  OnboardingStepStatus,
  string
> = {
  NOT_STARTED: "No iniciado",
  IN_PROGRESS: "En progreso",
  COMPLETED: "Completado",
  BLOCKED: "Bloqueado",
};

export const ONBOARDING_FLOW_STATE_LABELS: Record<
  OnboardingFlowState,
  string
> = {
  ACTIVE: "Avanzando",
  IDLE: "Sin actividad",
  BLOCKED: "Bloqueado",
  WAITING_CLIENT: "Esperando al cliente",
  WAITING_ADVISOR: "Esperando al asesor",
  WAITING_SYSTEM: "Esperando al sistema",
  COMPLETED: "Completado",
};

export const ONBOARDING_RESPONSIBILITY_LABELS: Record<
  OnboardingResponsibility,
  string
> = {
  CLIENT: "Cliente",
  ADVISOR: "Asesor",
  SYSTEM: "Sistema",
  NONE: "Sin acción pendiente",
};
