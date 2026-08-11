import BackofficeLayout from "@/components/layout/BackofficeLayout";

export default function RolesPage() {
  return (
    <BackofficeLayout
      title="Roles y permisos"
      description="Administra los roles y accesos de los usuarios internos."
    >
      <section className="rounded-2xl bg-admin-surface p-6">
        <h2 className="text-lg font-bold text-admin-text">
          Roles y permisos
        </h2>

        <p className="mt-2 text-sm text-admin-text-soft">
          Este módulo será desarrollado después del flujo de usuarios.
        </p>
      </section>
    </BackofficeLayout>
  );
}
