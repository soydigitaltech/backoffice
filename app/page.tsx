export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-6">
      <section className="w-full max-w-xl rounded-3xl border border-border bg-surface p-10 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Kivo
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink">
          Backoffice
        </h1>

        <p className="mt-4 text-base leading-7 text-body">
          La base visual de Kivo está configurada correctamente con Manrope,
          Tailwind CSS y la paleta oficial de la marca.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <span className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">
            Primary
          </span>

          <span className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink">
            Accent
          </span>

          <span className="rounded-full bg-success-bg px-4 py-2 text-sm font-semibold text-success">
            Success
          </span>
        </div>
      </section>
    </main>
  );
}