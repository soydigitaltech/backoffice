"use client";

import { useState } from "react";

import {
  Bell,
  Menu,
  Search,
} from "lucide-react";

import UserAvatar from "@/components/ui/UserAvatar";
import NotificationSummaryModal from "@/components/notifications/NotificationSummaryModal";
import { useAuth } from "@/hooks/useAuth";
import { USER_ROLE_LABELS } from "@/types/user";

type HeaderProps = {
  title: string;
  description?: string;
  onOpenMenu?: () => void;
};

export default function Header({
  title,
  description,
  onOpenMenu,
}: HeaderProps) {
  const { user, isLoading } = useAuth();
  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const pendingNotifications =
    user?.id === "usr-jhoseline" ? 5 : 0;

  return (
    <header className="flex min-h-20 items-center justify-between gap-4 bg-admin-surface px-5 py-4 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Abrir menú"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-admin-surface-soft text-admin-text lg:hidden"
        >
          <Menu
            aria-hidden="true"
            size={20}
            strokeWidth={1.8}
          />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-[-0.03em] text-admin-text">
            {title}
          </h1>

          {description ? (
            <p className="mt-1 truncate text-sm text-admin-text-soft">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="hidden w-[280px] items-center gap-3 rounded-xl border border-admin-border bg-admin-surface px-4 md:flex">
          <Search
            aria-hidden="true"
            size={18}
            strokeWidth={1.8}
            className="text-admin-text-muted"
          />

          <input
            type="search"
            placeholder="Buscar en Kivo"
            aria-label="Buscar en Kivo"
            className="h-11 min-w-0 flex-1 bg-transparent text-sm text-admin-text outline-none placeholder:text-admin-text-muted"
          />
        </div>

        <button
          type="button"
          aria-label="Notificaciones"
          onClick={() => setNotificationsOpen(true)}
          className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-admin-surface-soft text-admin-text transition-colors hover:bg-admin-accent-soft"
        >
          <Bell
            aria-hidden="true"
            size={19}
            strokeWidth={1.8}
          />

          {pendingNotifications > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
              {pendingNotifications}
            </span>
          ) : null}
        </button>

        {!isLoading && user ? (
          <div className="hidden items-center gap-3 rounded-xl bg-admin-surface-soft px-3 py-2 sm:flex">
            <UserAvatar name={user.fullName} size="sm" />

            <div className="hidden min-w-0 xl:block">
              <p className="truncate text-sm font-bold text-admin-text">
                {user.fullName}
              </p>

              <p className="truncate text-xs text-admin-text-soft">
                {USER_ROLE_LABELS[user.role]}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <NotificationSummaryModal
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        firstName={user?.firstName ?? "Jhoseline"}
      />
    </header>
  );
}
