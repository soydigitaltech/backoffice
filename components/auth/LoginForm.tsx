"use client";

import Image from "next/image";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

export default function LoginForm() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const user = login({
        email,
        password,
      });

      if (user.role === "SUPER_ADMIN") {
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
      <div className="flex min-h-screen items-center justify-center bg-page">
        <p className="text-sm font-semibold text-admin-text-soft">
          Cargando...
        </p>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="rounded-xl bg-accent px-5 py-3 text-sm font-bold text-ink"
        >
          Ir al backoffice
        </button>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-5 py-10">
      <section className="w-full max-w-[430px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/kivo.svg"
            alt="Kivo"
            width={150}
            height={52}
            priority
            className="h-auto w-[145px]"
          />

          <h1 className="mt-7 text-3xl font-bold tracking-[-0.04em] text-ink">
            Back Office Kivo
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted">
            Ingresa con tu cuenta para continuar.
          </p>
        </div>

        <div className="rounded-3xl border border-admin-border bg-white p-6 sm:p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-admin-text"
              >
                Correo electrónico
              </label>

              <div className="flex h-12 items-center gap-3 rounded-xl border border-admin-border bg-white px-4 transition-colors focus-within:border-primary">
                <Mail
                  aria-hidden="true"
                  size={18}
                  strokeWidth={1.8}
                  className="shrink-0 text-admin-text-muted"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);

                    if (errorMessage) {
                      setErrorMessage("");
                    }
                  }}
                  placeholder="nombre@kivo.bo"
                  autoComplete="email"
                  className="min-w-0 flex-1 bg-transparent text-sm text-admin-text outline-none placeholder:text-admin-text-muted"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-admin-text"
              >
                Contraseña
              </label>

              <div className="flex h-12 items-center gap-3 rounded-xl border border-admin-border bg-white px-4 transition-colors focus-within:border-primary">
                <LockKeyhole
                  aria-hidden="true"
                  size={18}
                  strokeWidth={1.8}
                  className="shrink-0 text-admin-text-muted"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);

                    if (errorMessage) {
                      setErrorMessage("");
                    }
                  }}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  className="min-w-0 flex-1 bg-transparent text-sm text-admin-text outline-none placeholder:text-admin-text-muted"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={
                    showPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-admin-text-muted transition-colors hover:bg-admin-surface-soft hover:text-admin-text"
                >
                  {showPassword ? (
                    <EyeOff
                      aria-hidden="true"
                      size={18}
                      strokeWidth={1.8}
                    />
                  ) : (
                    <Eye
                      aria-hidden="true"
                      size={18}
                      strokeWidth={1.8}
                    />
                  )}
                </button>
              </div>
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
              className="flex h-12 w-full items-center justify-center rounded-xl bg-accent text-sm font-bold text-ink transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <div className="mt-6 rounded-xl bg-admin-surface-soft p-4">
            <p className="text-xs font-bold text-admin-text">
              Usuarios de prueba
            </p>

            <p className="mt-2 text-xs leading-5 text-admin-text-soft">
              Hugo: hugo@soydigital.tech
              <br />
              Judith: jhoseline.apaza@gencorpbo.com
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
