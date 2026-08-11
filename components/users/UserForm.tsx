"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import Select from "@/components/ui/Select";
import { useUsers } from "@/hooks/useUsers";
import type { UserFormValues } from "@/types/user";

type UserFormProps = {
  mode?: "create" | "edit";
  userId?: string;
  initialValues?: UserFormValues;
};

const EMPTY_VALUES: UserFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "ASSIGNED_ADVISOR",
  status: "PENDING",
};

const roleOptions = [
  {
    value: "SUPER_ADMIN",
    label: "Super Administrador",
    description: "Acceso completo al backoffice y gestión de usuarios.",
  },
  {
    value: "ASSIGNED_ADVISOR",
    label: "Asesor Asignado",
    description: "Gestiona las solicitudes que le sean asignadas.",
  },
];

const statusOptions = [
  {
    value: "PENDING",
    label: "Pendiente",
    description: "La cuenta fue creada, pero aún no está habilitada.",
  },
  {
    value: "ACTIVE",
    label: "Activo",
    description: "El usuario puede ingresar normalmente.",
  },
  {
    value: "BLOCKED",
    label: "Bloqueado",
    description: "El acceso está suspendido temporalmente.",
  },
  {
    value: "INACTIVE",
    label: "Inactivo",
    description: "La cuenta quedó deshabilitada.",
  },
];

export default function UserForm({
  mode = "create",
  userId,
  initialValues = EMPTY_VALUES,
}: UserFormProps) {
  const router = useRouter();
  const { createUser, updateUser } = useUsers();

  const [values, setValues] = useState<UserFormValues>(initialValues);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = mode === "edit";

  const updateField = <Field extends keyof UserFormValues>(
    field: Field,
    value: UserFormValues[Field],
  ) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const validateForm = () => {
    if (!values.firstName.trim()) {
      return "Ingresa el nombre del usuario.";
    }

    if (!values.lastName.trim()) {
      return "Ingresa el apellido del usuario.";
    }

    if (!values.email.trim()) {
      return "Ingresa el correo electrónico.";
    }

    if (!values.email.includes("@")) {
      return "Ingresa un correo electrónico válido.";
    }

    if (!values.phone.trim()) {
      return "Ingresa el número de celular.";
    }

    return "";
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationMessage = validateForm();

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      if (isEditing) {
        if (!userId) {
          throw new Error("No se encontró el identificador del usuario.");
        }

        updateUser(userId, values);
      } else {
        createUser(values);
      }

      router.push("/administracion/usuarios");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el usuario.",
      );

      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-2xl bg-admin-surface">
        <div className="border-b border-admin-border px-5 py-5 sm:px-6">
          <h2 className="text-lg font-bold text-admin-text">
            Información personal
          </h2>

          <p className="mt-1 text-sm text-admin-text-soft">
            Registra los datos básicos del usuario interno.
          </p>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <label
              htmlFor="firstName"
              className="mb-2 block text-sm font-semibold text-admin-text"
            >
              Nombre
            </label>

            <input
              id="firstName"
              name="firstName"
              type="text"
              value={values.firstName}
              onChange={(event) =>
                updateField("firstName", event.target.value)
              }
              placeholder="Ej. Daniela"
              autoComplete="given-name"
              required
              className="h-12 w-full rounded-xl border border-admin-border bg-white px-4 text-sm text-admin-text outline-none transition-colors placeholder:text-admin-text-muted hover:border-admin-border-strong focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="mb-2 block text-sm font-semibold text-admin-text"
            >
              Apellido
            </label>

            <input
              id="lastName"
              name="lastName"
              type="text"
              value={values.lastName}
              onChange={(event) =>
                updateField("lastName", event.target.value)
              }
              placeholder="Ej. Vargas"
              autoComplete="family-name"
              required
              className="h-12 w-full rounded-xl border border-admin-border bg-white px-4 text-sm text-admin-text outline-none transition-colors placeholder:text-admin-text-muted hover:border-admin-border-strong focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-admin-text"
            >
              Correo electrónico
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={values.email}
              onChange={(event) =>
                updateField("email", event.target.value)
              }
              placeholder="nombre@kivo.bo"
              autoComplete="email"
              required
              className="h-12 w-full rounded-xl border border-admin-border bg-white px-4 text-sm text-admin-text outline-none transition-colors placeholder:text-admin-text-muted hover:border-admin-border-strong focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-semibold text-admin-text"
            >
              Celular
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              value={values.phone}
              onChange={(event) =>
                updateField("phone", event.target.value)
              }
              placeholder="+591 70000000"
              autoComplete="tel"
              required
              className="h-12 w-full rounded-xl border border-admin-border bg-white px-4 text-sm text-admin-text outline-none transition-colors placeholder:text-admin-text-muted hover:border-admin-border-strong focus:border-primary"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-admin-surface">
        <div className="border-b border-admin-border px-5 py-5 sm:px-6">
          <h2 className="text-lg font-bold text-admin-text">
            Acceso al sistema
          </h2>

          <p className="mt-1 text-sm text-admin-text-soft">
            Define el rol y el estado inicial de la cuenta.
          </p>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <Select
            label="Rol"
            value={values.role}
            options={roleOptions}
            onChange={(value) =>
              updateField(
                "role",
                value as UserFormValues["role"],
              )
            }
          />

          <Select
            label="Estado inicial"
            value={values.status}
            options={statusOptions}
            onChange={(value) =>
              updateField(
                "status",
                value as UserFormValues["status"],
              )
            }
          />
        </div>
      </section>

      {errorMessage ? (
        <div
          role="alert"
          className="rounded-xl bg-error-bg px-4 py-3 text-sm font-semibold text-error"
        >
          {errorMessage}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/administracion/usuarios"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-admin-border bg-white px-5 text-sm font-bold text-admin-text transition-colors hover:bg-admin-surface-soft"
        >
          Cancelar
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-accent px-5 text-sm font-bold text-ink transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Guardando..."
            : isEditing
              ? "Guardar cambios"
              : "Crear usuario"}
        </button>
      </div>
    </form>
  );
}
