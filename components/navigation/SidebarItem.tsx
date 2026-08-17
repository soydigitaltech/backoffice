"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  usePathname,
  useSearchParams,
} from "next/navigation";
import { useSyncExternalStore } from "react";

type SidebarItemProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  collapsed?: boolean;
  badge?: number;
  onNavigate?: () => void;
};

const ACTIVE_SIDEBAR_KEY = "kivo-active-sidebar-item";
const ACTIVE_SIDEBAR_EVENT = "kivo-active-sidebar-change";

function subscribeToActiveSidebar(
  callback: () => void,
) {
  window.addEventListener(
    ACTIVE_SIDEBAR_EVENT,
    callback,
  );

  window.addEventListener(
    "storage",
    callback,
  );

  return () => {
    window.removeEventListener(
      ACTIVE_SIDEBAR_EVENT,
      callback,
    );

    window.removeEventListener(
      "storage",
      callback,
    );
  };
}

function getActiveSidebarSnapshot() {
  return (
    window.sessionStorage.getItem(
      ACTIVE_SIDEBAR_KEY,
    ) ?? "/dashboard"
  );
}

function getServerActiveSidebarSnapshot() {
  return "/dashboard";
}

function setActiveSidebar(href: string) {
  window.sessionStorage.setItem(
    ACTIVE_SIDEBAR_KEY,
    href,
  );

  window.dispatchEvent(
    new Event(ACTIVE_SIDEBAR_EVENT),
  );
}

export default function SidebarItem({
  href,
  label,
  icon: Icon,
  collapsed = false,
  badge,
  onNavigate,
}: SidebarItemProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const storedActiveItem = useSyncExternalStore(
    subscribeToActiveSidebar,
    getActiveSidebarSnapshot,
    getServerActiveSidebarSnapshot,
  );

  const [hrefPath, hrefQuery = ""] =
    href.split("?");

  const targetParams =
    new URLSearchParams(hrefQuery);

  const targetEstado =
    targetParams.get("estado");

  const currentEstado =
    searchParams.get("estado");

  const isApplicationDetail =
    /^\/solicitudes\/[^/]+$/.test(pathname);

  const normalActive = targetEstado
    ? pathname === hrefPath &&
      currentEstado === targetEstado
    : pathname === hrefPath ||
      (hrefPath !== "/dashboard" &&
        pathname.startsWith(`${hrefPath}/`));

  const isActive = isApplicationDetail
    ? storedActiveItem === href
    : normalActive;

  const handleNavigate = () => {
    setActiveSidebar(href);

    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <Link
      href={href}
      onClick={handleNavigate}
      aria-current={isActive ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={[
        "group relative flex min-h-11 items-center overflow-hidden rounded-xl text-sm font-semibold transition-all duration-200 ease-out",
        collapsed
          ? "justify-center px-3"
          : "justify-between gap-3 px-3",
        isActive
          ? "bg-admin-sidebar-active text-admin-text"
          : "text-admin-sidebar-text hover:bg-admin-sidebar-active hover:text-admin-text",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-admin-accent transition-all duration-200 ease-out",
          isActive
            ? "translate-x-0 opacity-100"
            : "-translate-x-full opacity-0",
        ].join(" ")}
      />

      <span
        className={[
          "flex min-w-0 items-center transition-transform duration-200 ease-out",
          collapsed
            ? "justify-center"
            : "gap-3",
          isActive
            ? "translate-x-0.5"
            : "group-hover:translate-x-0.5",
        ].join(" ")}
      >
        <span
          className={[
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ease-out",
            isActive
              ? "bg-admin-accent-soft text-accent-dark"
              : "text-admin-sidebar-muted group-hover:bg-admin-accent-soft group-hover:text-accent-dark",
          ].join(" ")}
        >
          <Icon
            aria-hidden="true"
            size={18}
            strokeWidth={1.9}
          />
        </span>

        {!collapsed ? (
          <span
            className={[
              "truncate transition-all duration-200",
              isActive
                ? "font-bold text-admin-text"
                : "",
            ].join(" ")}
          >
            {label}
          </span>
        ) : null}
      </span>

      {!collapsed &&
      typeof badge === "number" ? (
        <span
          className={[
            "inline-flex min-w-6 items-center justify-center rounded-full px-2 py-1 text-[10px] font-bold transition-all duration-200",
            isActive
              ? "bg-admin-accent text-admin"
              : "bg-ink text-white",
          ].join(" ")}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
