export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-brand-50 to-background px-4 py-12 dark:from-brand-900/20">
      <div className="w-full max-w-md rounded-brand-lg border border-border bg-surface p-6 shadow-sm sm:p-8">
        {children}
      </div>
    </div>
  );
}
