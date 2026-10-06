import SetupPreview from "@/components/home/SetupPreview";

// Phase 1 placeholder. The real home page (featured / trending / search) is built in Phase 4.
export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
      <section className="mx-auto max-w-5xl text-center">
        <p className="mb-3 text-sm font-semibold tracking-widest text-brand uppercase">
          Cook with what you have
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Find your next favorite recipe
        </h1>
        <p className="mt-4 text-lg text-muted">
          Search by dish, cuisine or the ingredients already in your kitchen.
        </p>
        <SetupPreview />
      </section>
    </div>
  );
}
