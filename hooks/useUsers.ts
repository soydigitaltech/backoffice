"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { INITIAL_USERS } from "@/mocks/users";
import type {
  User,
  UserFormValues,
  UserRole,
  UserStatus,
} from "@/types/user";

const STORAGE_KEY = "kivo-backoffice-users";

type UserFilters = {
  search: string;
  role: UserRole | "";
  status: UserStatus | "";
};

const DEFAULT_FILTERS: UserFilters = {
  search: "",
  role: "",
  status: "",
};

function createUserId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `usr-${crypto.randomUUID()}`;
  }

  return `usr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function persistUsers(users: User[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function readStoredUsers(): User[] {
  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      persistUsers(INITIAL_USERS);
      return INITIAL_USERS;
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      throw new Error("Los usuarios almacenados no son válidos.");
    }

    return parsedValue as User[];
  } catch (error) {
    console.error("No se pudieron cargar los usuarios mock:", error);

    persistUsers(INITIAL_USERS);

    return INITIAL_USERS;
  }
}

function normalizeText(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [filters, setFilters] = useState<UserFilters>(DEFAULT_FILTERS);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setUsers(readStoredUsers());
      setIsReady(true);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  const updateUsers = useCallback(
    (updater: (currentUsers: User[]) => User[]) => {
      setUsers((currentUsers) => {
        const nextUsers = updater(currentUsers);

        persistUsers(nextUsers);

        return nextUsers;
      });
    },
    [],
  );

  const filteredUsers = useMemo(() => {
    const normalizedSearch = normalizeText(filters.search);

    return users.filter((user) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        normalizeText(user.fullName).includes(normalizedSearch) ||
        normalizeText(user.email).includes(normalizedSearch) ||
        normalizeText(user.phone).includes(normalizedSearch);

      const matchesRole =
        filters.role === "" || user.role === filters.role;

      const matchesStatus =
        filters.status === "" || user.status === filters.status;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [filters, users]);

  const getUserById = useCallback(
    (id: string) => {
      return users.find((user) => user.id === id);
    },
    [users],
  );

  const emailExists = useCallback(
    (email: string, ignoredUserId?: string) => {
      const normalizedEmail = email.trim().toLocaleLowerCase("es");

      return users.some(
        (user) =>
          user.id !== ignoredUserId &&
          user.email.trim().toLocaleLowerCase("es") === normalizedEmail,
      );
    },
    [users],
  );

  const createUser = useCallback(
    (values: UserFormValues) => {
      if (emailExists(values.email)) {
        throw new Error(
          "Ya existe un usuario registrado con este correo electrónico.",
        );
      }

      const now = new Date().toISOString();
      const firstName = values.firstName.trim();
      const lastName = values.lastName.trim();

      const newUser: User = {
        id: createUserId(),
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email: values.email.trim().toLocaleLowerCase("es"),
        phone: values.phone.trim(),
        role: values.role,
        status: values.status,
        lastAccess: null,
        createdAt: now,
        updatedAt: now,
      };

      updateUsers((currentUsers) => [newUser, ...currentUsers]);

      return newUser;
    },
    [emailExists, updateUsers],
  );

  const updateUser = useCallback(
    (id: string, values: UserFormValues) => {
      if (emailExists(values.email, id)) {
        throw new Error(
          "Ya existe otro usuario registrado con este correo electrónico.",
        );
      }

      const existingUser = users.find((user) => user.id === id);

      if (!existingUser) {
        throw new Error("No se encontró el usuario.");
      }

      const firstName = values.firstName.trim();
      const lastName = values.lastName.trim();

      const updatedUser: User = {
        ...existingUser,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email: values.email.trim().toLocaleLowerCase("es"),
        phone: values.phone.trim(),
        role: values.role,
        status: values.status,
        updatedAt: new Date().toISOString(),
      };

      updateUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === id ? updatedUser : user,
        ),
      );

      return updatedUser;
    },
    [emailExists, updateUsers, users],
  );

  const changeUserStatus = useCallback(
    (id: string, status: UserStatus) => {
      updateUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === id
            ? {
                ...user,
                status,
                updatedAt: new Date().toISOString(),
              }
            : user,
        ),
      );
    },
    [updateUsers],
  );

  const resetUsers = useCallback(() => {
    persistUsers(INITIAL_USERS);
    setUsers(INITIAL_USERS);
    setFilters(DEFAULT_FILTERS);
  }, []);

  const activeUsersCount = useMemo(
    () => users.filter((user) => user.status === "ACTIVE").length,
    [users],
  );

  const blockedUsersCount = useMemo(
    () => users.filter((user) => user.status === "BLOCKED").length,
    [users],
  );

  const pendingUsersCount = useMemo(
    () => users.filter((user) => user.status === "PENDING").length,
    [users],
  );

  return {
    users,
    filteredUsers,
    filters,
    isReady,

    totalUsersCount: users.length,
    activeUsersCount,
    blockedUsersCount,
    pendingUsersCount,

    setSearch: (search: string) => {
      setFilters((currentFilters) => ({
        ...currentFilters,
        search,
      }));
    },

    setRoleFilter: (role: UserRole | "") => {
      setFilters((currentFilters) => ({
        ...currentFilters,
        role,
      }));
    },

    setStatusFilter: (status: UserStatus | "") => {
      setFilters((currentFilters) => ({
        ...currentFilters,
        status,
      }));
    },

    clearFilters: () => {
      setFilters(DEFAULT_FILTERS);
    },

    getUserById,
    emailExists,
    createUser,
    updateUser,
    changeUserStatus,

    activateUser: (id: string) => {
      changeUserStatus(id, "ACTIVE");
    },

    blockUser: (id: string) => {
      changeUserStatus(id, "BLOCKED");
    },

    unblockUser: (id: string) => {
      changeUserStatus(id, "ACTIVE");
    },

    deactivateUser: (id: string) => {
      changeUserStatus(id, "INACTIVE");
    },

    resetUsers,
  };
}