"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { MOCK_AUTH_USERS } from "@/mocks/auth-users";
import type {
  AuthContextValue,
  AuthSession,
  AuthUser,
  LoginCredentials,
} from "@/types/auth";

const AUTH_STORAGE_KEY = "kivo-backoffice-auth-session";
const JHOSELINE_LOGIN_COUNT_KEY = "kivo-jhoseline-login-count";
const LOGIN_SUMMARY_KEY = "kivo-show-login-summary";

export const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
};

function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!storedSession) {
      return null;
    }

    const parsedSession: unknown = JSON.parse(storedSession);

    if (
      typeof parsedSession !== "object" ||
      parsedSession === null ||
      !("user" in parsedSession) ||
      !("authenticatedAt" in parsedSession)
    ) {
      throw new Error("La sesión almacenada no tiene un formato válido.");
    }

    return parsedSession as AuthSession;
  } catch (error) {
    console.error("No se pudo recuperar la sesión mock:", error);

    window.localStorage.removeItem(AUTH_STORAGE_KEY);

    return null;
  }
}

function persistSession(session: AuthSession) {
  window.localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify(session),
  );
}

export default function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const storedSession = readStoredSession();

      setUser(storedSession?.user ?? null);
      setIsLoading(false);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  const login = useCallback(
    ({ email, password }: LoginCredentials) => {
      const normalizedEmail = email.trim().toLocaleLowerCase("es");

      const matchedUser = MOCK_AUTH_USERS.find(
        (candidate) =>
          candidate.email.toLocaleLowerCase("es") === normalizedEmail &&
          candidate.password === password,
      );

      if (!matchedUser) {
        throw new Error("El correo o la contraseña no son correctos.");
      }

      const authenticatedUser: AuthUser = {
        id: matchedUser.id,
        firstName: matchedUser.firstName,
        lastName: matchedUser.lastName,
        fullName: matchedUser.fullName,
        email: matchedUser.email,
        role: matchedUser.role,
      };

      const session: AuthSession = {
        user: authenticatedUser,
        authenticatedAt: new Date().toISOString(),
      };

      persistSession(session);

      if (authenticatedUser.id === "usr-jhoseline") {
        const currentCount = Number(
          window.localStorage.getItem(
            JHOSELINE_LOGIN_COUNT_KEY,
          ) ?? "0",
        );

        const nextCount = currentCount + 1;

        window.localStorage.setItem(
          JHOSELINE_LOGIN_COUNT_KEY,
          String(nextCount),
        );

        if (nextCount >= 2) {
          window.sessionStorage.setItem(
            LOGIN_SUMMARY_KEY,
            "1",
          );
        }
      }

      setUser(authenticatedUser);

      return authenticatedUser;
    },
    [],
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
    }),
    [isLoading, login, logout, user],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
