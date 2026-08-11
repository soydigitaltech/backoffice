import BackofficeLayout from "@/components/layout/BackofficeLayout";
import UserForm from "@/components/users/UserForm";

export default function NewUserPage() {
  return (
    <BackofficeLayout
      title="Crear usuario"
      description="Registra un nuevo usuario interno del backoffice."
    >
      <div className="mx-auto w-full max-w-5xl">
        <UserForm />
      </div>
    </BackofficeLayout>
  );
}