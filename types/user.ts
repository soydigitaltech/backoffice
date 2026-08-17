export type UserRole =
  | "SUPER_ADMIN"
  | "GESTOR_PRESTAMOS"
  | "ASESOR_PRESTAMOS"
  | "JEFE_CARTERA";

export type UserStatus =
  | "ACTIVE"
  | "PENDING"
  | "BLOCKED"
  | "INACTIVE";

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  lastAccess: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Administrador",
  GESTOR_PRESTAMOS: "Gestor de préstamos",
  ASESOR_PRESTAMOS: "Asesor de préstamos",
  JEFE_CARTERA: "Jefe de cartera",
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: "Activo",
  PENDING: "Pendiente",
  BLOCKED: "Bloqueado",
  INACTIVE: "Inactivo",
};
