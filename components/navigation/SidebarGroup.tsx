"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { useState } from "react";

type SidebarGroupItem = {
  label: string;
  href: string;
  badge?: number;
};

type SidebarGroupProps = {
  label: string;
  icon: LucideIcon;
  items: SidebarGroupItem[];
  collapsed?: boolean;
  defaultOpen?: boolean;
  onNavigate?: () => void;
};

export default function SidebarGroup({
  label,
  icon: Icon,
  items,
  collapsed = false,
  defaultOpen = false,
  onNavigate,
}: SidebarGroupProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(defaultOpen);

  const hasActiveItem = items.some(
    (item) =>
      pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  const isOpen = hasActiveItem || expanded;

  if (collapsed) {
    return (
      <button
        type="button"
        title={label}
        aria-label={label}
        className={[
          "flex min-h-11 w-full items-center justify-center rounded-xl",
          "text-muted transition-colors",
          hasActiveItem
            ? "bg-admin-accent-soft text-accent-dark"
            : "hover:bg-admin-sidebar-hover hover:text-ink",
        ].join(" ")}
      >
        <Icon aria-hidden="true" size={19} strokeWidth={1.8} />
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={isOpen}
        className={[
          "group flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5",
          "text-sm font-semibold transition-colors",
          hasActiveItem
            ? "text-ink"
            : "text-body hover:bg-admin-sidebar-hover hover:text-ink",
        ].join(" ")}
      >
        <Icon
          aria-hidden="true"
          size={19}
          strokeWidth={hasActiveItem ? 2 : 1.8}
          className={[
            "shrink-0 transition-colors",
            hasActiveItem
              ? "text-accent"
              : "text-muted group-hover:text-primary",
          ].join(" ")}
        />

        <span className="min-w-0 flex-1 truncate text-left">{label}</span>

        <ChevronDown
          aria-hidden="true"
          size={17}
          strokeWidth={1.8}
          className={[
            "shrink-0 text-muted transition-transform duration-200",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      <div
        className={[
          "grid transition-[grid-template-rows,opacity] duration-200",
          isOpen
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="overflow-hidden">
          <div className="ml-[22px] mt-1 space-y-1 border-l border-admin-sidebar-divider pl-4">
            {items.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "flex min-h-10 items-center gap-3 rounded-xl px-3",
                    "text-[13px] font-semibold transition-colors",
                    active
                      ? "bg-admin-accent-soft text-ink"
                      : "text-body hover:bg-admin-sidebar-hover hover:text-ink",
                  ].join(" ")}
                >
                  <span
                    aria-hidden="true"
                    className={[
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      active ? "bg-accent" : "bg-border-strong",
                    ].join(" ")}
                  />

                  <span className="min-w-0 flex-1 truncate">
                    {item.label}
                  </span>

                  {typeof item.badge === "number" && item.badge > 0 ? (
                    <span className="flex min-w-6 items-center justify-center rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}