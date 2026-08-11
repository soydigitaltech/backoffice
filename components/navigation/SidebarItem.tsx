"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  usePathname,
  useSearchParams,
} from "next/navigation";

type SidebarItemProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  collapsed?: boolean;
  badge?: number;
  onNavigate?: () => void;
};

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

  const [hrefPath, hrefQuery = ""] =
    href.split("?");

  const targetParams =
    new URLSearchParams(hrefQuery);

  const targetEstado =
    targetParams.get("estado");

  const currentEstado =
    searchParams.get("estado");

  const isActive = targetEstado
    ? pathname === hrefPath &&
      currentEstado === targetEstado
    : pathname === hrefPath ||
      (hrefPath !== "/dashboard" &&
        pathname.startsWith(`${hrefPath}/`));

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={[
        "group flex min-h-11 items-center rounded-xl text-sm font-semibold transition-colors",
        collapsed
          ? "justify-center px-3"
          : "justify-between gap-3 px-3",
        isActive
          ? "bg-admin-sidebar-active text-admin-text"
          : "text-admin-sidebar-text hover:bg-admin-sidebar-active hover:text-admin-text",
      ].join(" ")}
    >
      <span
        className={[
          "flex min-w-0 items-center",
          collapsed
            ? "justify-center"
            : "gap-3",
        ].join(" ")}
      >
        <Icon
          aria-hidden="true"
          size={19}
          strokeWidth={1.8}
          className={[
            "shrink-0 transition-colors",
            isActive
              ? "text-accent-dark"
              : "text-admin-sidebar-muted group-hover:text-accent-dark",
          ].join(" ")}
        />

        {!collapsed ? (
          <span className="truncate">
            {label}
          </span>
        ) : null}
      </span>

      {!collapsed &&
      typeof badge === "number" ? (
        <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-ink px-2 py-1 text-[10px] font-bold text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
