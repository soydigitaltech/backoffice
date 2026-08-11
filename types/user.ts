export type UserRole = "SUPER_ADMIN" | "ASSIGNED_ADVISOR";

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
  SUPER_ADMIN: "Super Administrador",
  ASSIGNED_ADVISOR: "Asesor Asignado",
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: "Activo",
  PENDING: "Pendiente",
  BLOCKED: "Bloqueado",
  INACTIVE: "Inactivo",
};