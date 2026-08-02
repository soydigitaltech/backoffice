import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kivo Backoffice",
    template: "%s | Kivo Backoffice",
  },
  description:
    "Plataforma administrativa para la gestión de solicitudes, clientes y préstamos de Kivo.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${manrope.variable} h-full`}>
      <body className="min-h-full bg-page font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}