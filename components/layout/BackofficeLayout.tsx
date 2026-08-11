"use client";

import { Suspense, useState } from "react";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

type BackofficeLayoutProps = {
  children: React.ReactNode;
  title: string;
  description?: string;
};

export default function BackofficeLayout({
  children,
  title,
  description,
}: BackofficeLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-admin-page">
      <div className="flex min-h-screen">
        <Suspense fallback={null}>
          <Sidebar />
        </Suspense>

        <div className="min-w-0 flex-1">
          <Header
            title={title}
            description={description}
            onOpenMenu={() => setMobileMenuOpen(true)}
          />

          <main className="px-5 pb-8 pt-2 lg:px-8">{children}</main>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/35"
          />

          <div className="relative z-10 h-full w-[280px]">
            <Suspense fallback={null}>
              <Sidebar
                mobile
                onNavigate={() => setMobileMenuOpen(false)}
              />
            </Suspense>
          </div>
        </div>
      ) : null}
    </div>
  );
}