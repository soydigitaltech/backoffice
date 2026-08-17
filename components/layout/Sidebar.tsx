"use client";

import Image from "next/image";
import {
  ChevronLeft,
  BadgeCheck,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import SidebarGroup from "@/components/navigation/SidebarGroup";
import SidebarItem from "@/components/navigation/SidebarItem";
import UserAvatar from "@/components/ui/UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import { USER_ROLE_LABELS } from "@/types/user";

const administrationItems = [
  {
    label: "Usuarios",
    href: "/administracion/usuarios",
  },
];

type SidebarProps = {
  mobile?: boolean;
  onNavigate?: () => void;
};

export default function Sidebar({
  mobile = false,
  onNavigate,
}: SidebarProps) {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  const isCollapsed = mobile ? false : collapsed;
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const handleLogout = () => {
    logout();
    router.replace("/");
    router.refresh();

    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <aside
      className={[
        "h-full shrink-0 border-r border-admin-sidebar-divider bg-admin-sidebar",
        mobile
          ? "flex w-[286px] flex-col"
          : "sticky top-0 hidden h-screen flex-col transition-[width] duration-200 lg:flex",
        !mobile && isCollapsed ? "w-[88px]" : "",
        !mobile && !isCollapsed ? "w-[272px]" : "",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-20 shrink-0 items-center",
          isCollapsed ? "justify-center px-3" : "justify-between px-5",
        ].join(" ")}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black">
            <Image
              src="/kivo.svg"
              alt="Kivo"
              width={44}
              height={44}
              priority
              className="h-full w-full object-contain"
            />
          </div>

          {!isCollapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">
                Kivo
              </p>

              <p className="mt-0.5 truncate text-xs text-body">
                Gestión de préstamos
              </p>
            </div>
          ) : null}
        </div>

        {!mobile && !isCollapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Contraer menú"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-soft hover:text-primary"
          >
            <ChevronLeft
              aria-hidden="true"
              size={18}
              strokeWidth={1.8}
            />
          </button>
        ) : null}
      </div>

      {!mobile && isCollapsed ? (
        <div className="px-4 pb-3">
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-label="Expandir menú"
            className="flex h-10 w-full items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-soft hover:text-primary"
          >
            <ChevronRight
              aria-hidden="true"
              size={18}
              strokeWidth={1.8}
            />
          </button>
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto px-3 pb-5">
        <nav className="space-y-1">
          <SidebarItem
            href="/dashboard"
            label="Tablero"
            icon={LayoutDashboard}
            collapsed={isCollapsed}
            onNavigate={onNavigate}
          />

          <SidebarItem
            href="/solicitudes?estado=revision"
            label="En revisión"
            icon={ClipboardList}
            collapsed={isCollapsed}
            onNavigate={onNavigate}
          />

          <SidebarItem
            href="/solicitudes?estado=aprobados"
            label="Aprobados"
            icon={BadgeCheck}
            collapsed={isCollapsed}
            onNavigate={onNavigate}
          />

          <SidebarItem
            href="/solicitudes?estado=asignados"
            label="Asignados"
            icon={UserCheck}
            collapsed={isCollapsed}
            onNavigate={onNavigate}
          />

          {isSuperAdmin ? (
            <>
              <div
                className={[
                  "my-5 h-px bg-admin-sidebar-divider",
                  isCollapsed ? "mx-2" : "mx-1",
                ].join(" ")}
              />

              <SidebarGroup
                label="Administración"
                icon={ShieldCheck}
                items={administrationItems}
                collapsed={isCollapsed}
                defaultOpen
                onNavigate={onNavigate}
              />
            </>
          ) : null}
        </nav>
      </div>

      <div className="shrink-0 border-t border-admin-sidebar-divider p-3">
        <div
          className={[
            "rounded-2xl bg-surface-soft",
            isCollapsed ? "p-2" : "p-3",
          ].join(" ")}
        >
          {!mounted || isLoading || !user ? (
            <div className="flex h-12 items-center justify-center">
              <p className="text-xs text-muted">
                Cargando...
              </p>
            </div>
          ) : (
            <div
              className={[
                "flex items-center",
                isCollapsed ? "justify-center" : "gap-3",
              ].join(" ")}
            >
              <UserAvatar name={user.fullName} size="sm" />

              {!isCollapsed ? (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">
                      {user.fullName}
                    </p>

                    <p className="mt-0.5 truncate text-xs font-medium text-body">
                      {USER_ROLE_LABELS[user.role]}
                    </p>

                    <p className="mt-0.5 truncate text-[11px] text-muted">
                      {user.email}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    aria-label="Cerrar sesión"
                    title="Cerrar sesión"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-admin-accent-soft hover:text-accent-dark"
                  >
                    <LogOut
                      aria-hidden="true"
                      size={17}
                      strokeWidth={1.8}
                    />
                  </button>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
