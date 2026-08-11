import type { UserRole } from "@/types/user";

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: UserRole;
};

export type MockAuthUser = AuthUser & {
  password: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthSession = {
  user: AuthUser;
  authenticatedAt: string;
};

export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => AuthUser;
  logout: () => void;
};
