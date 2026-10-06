import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

// Phase 2 placeholder — recipe moderation and user management land in Phase 6.
export default function AdminPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Admin panel</h1>
      <p className="mt-2 text-muted">Moderation tools are coming in Phase 6.</p>
    </div>
  );
}
