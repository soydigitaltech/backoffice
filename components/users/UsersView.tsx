"use client";

import Link from "next/link";
import {
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  UserRound,
  UserX,
} from "lucide-react";

import BackofficeLayout from "@/components/layout/BackofficeLayout";
import UserActions from "@/components/users/UserActions";
import { useUsers } from "@/hooks/useUsers";
import {
  USER_ROLE_LABELS,
  USER_STATUS_LABELS,
  type User,
  type UserRole,
  type UserStatus,
} from "@/types/user";

const statusClasses: Record<UserStatus, string> = {
  ACTIVE: "bg-success-bg text-success",
  PENDING: "bg-warning-bg text-warning",
  BLOCKED: "bg-error-bg text-error",
  INACTIVE: "bg-admin-surface-soft text-admin-text-soft",
};

function getInitials(user: User) {
  const firstInitial = user.firstName.trim().charAt(0);
  const lastInitial = user.lastName.trim().charAt(0);

  return `${firstInitial}${lastInitial}`.toUpperCase();
}

function formatLastAccess(value: string | null) {
  if (!value) {
    return "Sin acceso";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function UsersView() {
  const {
    filteredUsers,
    filters,
    isReady,
    totalUsersCount,
    activeUsersCount,
    blockedUsersCount,
    setSearch,
    setRoleFilter,
    setStatusFilter,
    clearFilters,
    activateUser,
    blockUser,
    unblockUser,
    deactivateUser,
  } = useUsers();

  const hasActiveFilters =
    filters.search !== "" ||
    filters.role !== "" ||
    filters.status !== "";

  return (
    <BackofficeLayout
      title="Usuarios"
      description="Administra los accesos, roles y estados de los usuarios internos."
    >
      <section className="rounded-2xl bg-admin-surface">
        <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-admin-text">
              Usuarios internos
            </h2>

            <p className="mt-1 text-sm text-admin-text-soft">
              Crea usuarios y controla su acceso al backoffice de Kivo.
            </p>
          </div>

          <Link
            href="/administracion/usuarios/nuevo"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-bold text-ink transition-colors hover:bg-accent-dark"
          >
            <Plus aria-hidden="true" size={18} strokeWidth={2} />
            Crear usuario
          </Link>
        </div>

        <div className="flex flex-col gap-3 border-y border-admin-border px-5 py-4 sm:px-6 lg:flex-row lg:items-center">
          <div className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-xl border border-admin-border bg-white px-4 transition-colors focus-within:border-primary">
            <Search
              aria-hidden="true"
              size={18}
              strokeWidth={1.8}
              className="shrink-0 text-admin-text-muted"
            />

            <input
              type="search"
              value={filters.search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, correo o celular"
              aria-label="Buscar usuarios"
              className="min-w-0 flex-1 bg-transparent text-sm text-admin-text outline-none placeholder:text-admin-text-muted"
            />
          </div>

          <select
            aria-label="Filtrar por rol"
            value={filters.role}
            onChange={(event) =>
              setRoleFilter(event.target.value as UserRole | "")
            }
            className="h-11 rounded-xl border border-admin-border bg-white px-4 text-sm text-admin-text outline-none transition-colors hover:border-admin-border-strong focus:border-primary"
          >
            <option value="">Todos los roles</option>
            <option value="SUPER_ADMIN">Super Administrador</option>
            <option value="ASSIGNED_ADVISOR">Asesor Asignado</option>
          </select>

          <select
            aria-label="Filtrar por estado"
            value={filters.status}
            onChange={(event) =>
              setStatusFilter(event.target.value as UserStatus | "")
            }
            className="h-11 rounded-xl border border-admin-border bg-white px-4 text-sm text-admin-text outline-none transition-colors hover:border-admin-border-strong focus:border-primary"
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVE">Activo</option>
            <option value="PENDING">Pendiente</option>
            <option value="BLOCKED">Bloqueado</option>
            <option value="INACTIVE">Inactivo</option>
          </select>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="h-11 rounded-xl border border-admin-border bg-white px-4 text-sm font-semibold text-admin-text transition-colors hover:bg-admin-surface-soft"
            >
              Limpiar filtros
            </button>
          ) : null}
        </div>

        <div className="grid gap-3 border-b border-admin-border px-5 py-4 sm:grid-cols-3 sm:px-6">
          <article className="flex items-center gap-3 rounded-xl bg-admin-surface-soft p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-blue text-primary-dark">
              <UserRound aria-hidden="true" size={19} strokeWidth={1.8} />
            </div>

            <div>
              <p className="text-xs font-medium text-admin-text-soft">
                Total usuarios
              </p>

              <p className="mt-1 text-xl font-bold text-admin-text">
                {totalUsersCount}
              </p>
            </div>
          </article>

          <article className="flex items-center gap-3 rounded-xl bg-success-bg p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-success">
              <UserCheck aria-hidden="true" size={19} strokeWidth={1.8} />
            </div>

            <div>
              <p className="text-xs font-medium text-admin-text-soft">
                Usuarios activos
              </p>

              <p className="mt-1 text-xl font-bold text-admin-text">
                {activeUsersCount}
              </p>
            </div>
          </article>

          <article className="flex items-center gap-3 rounded-xl bg-error-bg p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-error">
              <UserX aria-hidden="true" size={19} strokeWidth={1.8} />
            </div>

            <div>
              <p className="text-xs font-medium text-admin-text-soft">
                Usuarios bloqueados
              </p>

              <p className="mt-1 text-xl font-bold text-admin-text">
                {blockedUsersCount}
              </p>
            </div>
          </article>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse">
            <thead>
              <tr className="border-b border-admin-border text-left">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.08em] text-admin-text-muted">
                  Usuario
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.08em] text-admin-text-muted">
                  Rol
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.08em] text-admin-text-muted">
                  Estado
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.08em] text-admin-text-muted">
                  Último acceso
                </th>

                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-[0.08em] text-admin-text-muted">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {!isReady ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-admin-text-soft"
                  >
                    Cargando usuarios...
                  </td>
                </tr>
              ) : null}

              {isReady && filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-sm font-semibold text-admin-text">
                      No se encontraron usuarios
                    </p>

                    <p className="mt-1 text-sm text-admin-text-soft">
                      Modifica la búsqueda o limpia los filtros seleccionados.
                    </p>
                  </td>
                </tr>
              ) : null}

              {isReady
                ? filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-admin-border transition-colors last:border-b-0 hover:bg-admin-surface-soft"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-ink">
                            {getInitials(user)}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-admin-text">
                              {user.fullName}
                            </p>

                            <p className="mt-1 truncate text-xs text-admin-text-soft">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-admin-text">
                          <ShieldCheck
                            aria-hidden="true"
                            size={17}
                            strokeWidth={1.8}
                            className="shrink-0 text-primary-dark"
                          />

                          {USER_ROLE_LABELS[user.role]}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-3 py-1 text-xs font-bold",
                            statusClasses[user.status],
                          ].join(" ")}
                        >
                          {USER_STATUS_LABELS[user.status]}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-admin-text-soft">
                        {formatLastAccess(user.lastAccess)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <UserActions
                            user={user}
                            onActivate={activateUser}
                            onBlock={blockUser}
                            onUnblock={unblockUser}
                            onDeactivate={deactivateUser}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-admin-border px-5 py-4 text-sm text-admin-text-soft sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            Mostrando {filteredUsers.length} de {totalUsersCount} usuarios
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              className="h-9 rounded-xl border border-admin-border px-3 text-xs font-semibold text-admin-text-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>

            <button
              type="button"
              aria-current="page"
              className="h-9 rounded-xl bg-ink px-3 text-xs font-bold text-white"
            >
              1
            </button>

            <button
              type="button"
              disabled
              className="h-9 rounded-xl border border-admin-border px-3 text-xs font-semibold text-admin-text-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>
    </BackofficeLayout>
  );
}