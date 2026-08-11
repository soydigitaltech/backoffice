import BackofficeLayout from "@/components/layout/BackofficeLayout";

type UserDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UserDetailPage({
  params,
}: UserDetailPageProps) {
  const { id } = await params;

  return (
    <BackofficeLayout
      title="Detalle del usuario"
      description="Información general y estado de la cuenta interna."
    >
      <section className="rounded-2xl bg-admin-surface p-6">
        <h2 className="text-lg font-bold text-admin-text">
          Detalle del usuario
        </h2>

        <p className="mt-2 text-sm text-admin-text-soft">
          Usuario seleccionado: {id}
        </p>
      </section>
    </BackofficeLayout>
  );
}
