"use client";

import { useState } from "react";
import { Bell, Menu, Search } from "lucide-react";

import NotificationSummaryModal from "@/components/notifications/NotificationSummaryModal";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const pendingNotifications =
    user?.id === "usr-jhoseline" ? 5 : 0;

  return (
    <header className="relative min-h-20 bg-admin-surface px-5 py-4 lg:px-8">
      <div className="grid min-h-12 grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* IZQUIERDA */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Abrir menú"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-admin-surface-soft text-admin-text transition-colors hover:bg-[#EEF1F4] lg:hidden"
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

        {/* CENTRO */}
        <div className="hidden md:block">
          <label className="flex h-11 w-[360px] items-center gap-3 rounded-xl border border-[#DDE3E8] bg-white px-4 transition-colors focus-within:border-primary">
            <Search
              aria-hidden="true"
              size={17}
              strokeWidth={1.8}
              className="shrink-0 text-[#8D97A5]"
            />

            <input
              type="search"
              placeholder="Buscar en Kivo"
              aria-label="Buscar en Kivo"
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-admin-text !outline-none focus:!outline-none focus-visible:!outline-none placeholder:text-[#98A1AF]"
            />
          </label>
        </div>

        {/* DERECHA */}
        <div className="flex justify-end">
          <button
            type="button"
            aria-label="Tablero de notificaciones"
            title="Tablero de notificaciones"
            onClick={() => setNotificationsOpen(true)}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white transition-colors hover:bg-[#1B5BB6]"
          >
            <Bell
              aria-hidden="true"
              size={19}
              strokeWidth={1.8}
            />

            {pendingNotifications > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white">
                {pendingNotifications}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      <NotificationSummaryModal
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        firstName={user?.firstName ?? "Jhoseline"}
      />
    </header>
  );
}
