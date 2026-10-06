import type { Metadata } from "next";
import RegisterForm from "@/components/forms/RegisterForm";
import { isGoogleEnabled } from "@/lib/auth";
import { safeCallbackUrl } from "@/lib/utils";

export const metadata: Metadata = { title: "Sign up", robots: { index: false } };

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const { callbackUrl } = await searchParams;
  const redirectTo = safeCallbackUrl(Array.isArray(callbackUrl) ? callbackUrl[0] : callbackUrl);

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-1 mb-6 text-muted">Join RecipeHub to share recipes and save favorites.</p>
      <RegisterForm callbackUrl={redirectTo} googleEnabled={isGoogleEnabled} />
    </>
  );
}
