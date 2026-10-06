import type { Metadata } from "next";
import LoginForm from "@/components/forms/LoginForm";
import { isGoogleEnabled } from "@/lib/auth";
import { safeCallbackUrl } from "@/lib/utils";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const callbackUrl = safeCallbackUrl(first(params.callbackUrl));
  // Auth.js redirects here with ?error=…&code=… on failures
  const initialError = first(params.code) ?? first(params.error);

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-1 mb-6 text-muted">Log in to save, rate and share recipes.</p>
      <LoginForm
        callbackUrl={callbackUrl}
        googleEnabled={isGoogleEnabled}
        initialError={initialError}
      />
    </>
  );
}
