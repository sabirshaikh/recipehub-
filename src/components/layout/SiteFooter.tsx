export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted sm:flex-row sm:px-6">
        <p>© {new Date().getFullYear()} RecipeHub. Cook something good.</p>
        <p>Built with Next.js, Ant Design &amp; Tailwind CSS</p>
      </div>
    </footer>
  );
}
