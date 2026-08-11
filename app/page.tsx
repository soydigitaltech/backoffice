"use client";

import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const router = useRouter();

  const {
    login,
    isAuthenticated,
    isLoading,
    user,
  } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) {
      return;
    }

    if (user.role === "SUPER_ADMIN") {
      router.replace("/administracion/usuarios");
      return;
    }

    router.replace("/dashboard");
  }, [isAuthenticated, isLoading, router, user]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setErrorMessage("Ingresa tu correo electrónico.");
      return;
    }

    if (!password) {
      setErrorMessage("Ingresa tu contraseña.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const authenticatedUser = login({
        email,
        password,
      });

      if (authenticatedUser.role === "SUPER_ADMIN") {
        router.push("/administracion/usuarios");
      } else {
        router.push("/dashboard");
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar sesión.",
      );

      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-page">
        <p className="text-sm font-semibold text-muted">
          Cargando...
        </p>
      </main>
    );
  }

  if (isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-page">
        <p className="text-sm font-semibold text-muted">
          Redirigiendo...
        </p>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-page px-5 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-sky/20 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 -right-40 h-[480px] w-[480px] rounded-full bg-primary/10 blur-3xl"
      />

      <section className="relative z-10 w-full max-w-[420px]">
        <div className="mb-7 flex flex-col items-center text-center">
          <Image
            src="/kivo.svg"
            alt="Kivo"
            width={150}
            height={52}
            priority
            className="h-auto w-[140px]"
          />

          <h1 className="mt-6 text-3xl font-bold tracking-[-0.04em] text-ink">
            Back Office Kivo
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted">
            Ingresa con tus credenciales para continuar.
          </p>
        </div>

        <div className="rounded-[24px] bg-surface p-6 sm:p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-ink-soft"
              >
                Correo electrónico
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);

                  if (errorMessage) {
                    setErrorMessage("");
                  }
                }}
                autoComplete="email"
                placeholder="nombre@kivo.bo"
                required
                className="h-13 w-full rounded-2xl border border-border bg-white px-4 text-[15px] text-ink outline-none transition-colors placeholder:text-placeholder hover:border-border-strong focus:border-primary focus:bg-white"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-ink-soft"
                >
                  Contraseña
                </label>

                <button
                  type="button"
                  className="text-xs font-semibold text-primary-dark transition-colors hover:text-primary"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);

                    if (errorMessage) {
                      setErrorMessage("");
                    }
                  }}
                  autoComplete="current-password"
                  placeholder="Ingresa tu contraseña"
                  required
                  className="h-13 w-full rounded-2xl border border-border bg-white px-4 pr-13 text-[15px] text-ink outline-none transition-colors placeholder:text-placeholder hover:border-border-strong focus:border-primary focus:bg-white"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={
                    showPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                  aria-pressed={showPassword}
                  className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-muted transition-colors hover:text-ink"
                >
                  {showPassword ? (
                    <EyeOff
                      aria-hidden="true"
                      size={19}
                      strokeWidth={1.8}
                    />
                  ) : (
                    <Eye
                      aria-hidden="true"
                      size={19}
                      strokeWidth={1.8}
                    />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="flex cursor-pointer items-center gap-3 text-sm text-body">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(event.target.checked)
                  }
                  className="h-4 w-4 cursor-pointer accent-primary"
                />

                <span>Recuérdame</span>
              </label>
            </div>

            {errorMessage ? (
              <div
                role="alert"
                className="rounded-xl bg-error-bg px-4 py-3 text-sm font-semibold text-error"
              >
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-13 w-full items-center justify-center rounded-2xl bg-primary text-sm font-bold text-white transition-colors hover:bg-primary-dark active:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <div className="mt-6 rounded-xl bg-admin-surface-soft px-4 py-3">
            <p className="text-xs font-bold text-admin-text">
              Usuarios de prueba
            </p>

            <p className="mt-2 text-xs leading-5 text-admin-text-soft">
              Hugo: hugo@soydigital.tech
              <br />
              Judith: jhoseline.apaza@gencorpbo.com
            </p>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-placeholder">
            Acceso exclusivo para personal autorizado de Kivo.
          </p>
        </div>

        <p className="mt-5 text-center text-xs text-muted">
          Kivo · Gestión de préstamos
        </p>
      </section>
    </main>
  );
}
