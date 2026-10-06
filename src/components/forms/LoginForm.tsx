"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Button, Divider, Form, Input } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { signIn } from "next-auth/react";
import GoogleSignInButton from "@/components/forms/GoogleSignInButton";
import { zodRule } from "@/lib/form";
import { loginSchema, type LoginInput } from "@/schemas/auth";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Incorrect email or password.",
  rate_limited: "Too many login attempts. Please wait a few minutes and try again.",
  AccessDenied: "Sign-in was denied. Google accounts need a verified email.",
  Configuration: "Sign-in is temporarily unavailable. Please try again later.",
  OAuthSignin: "Couldn't start Google sign-in. Please try again.",
  OAuthCallbackError: "Google sign-in was cancelled or failed.",
};

function messageFor(code: string | undefined) {
  if (!code) return null;
  return ERROR_MESSAGES[code] ?? "Something went wrong while signing in. Please try again.";
}

interface LoginFormProps {
  callbackUrl: string;
  googleEnabled: boolean;
  /** `?error=` / `?code=` set by Auth.js redirects (e.g. failed OAuth). */
  initialError?: string;
}

export default function LoginForm({ callbackUrl, googleEnabled, initialError }: LoginFormProps) {
  const router = useRouter();
  const [form] = Form.useForm<LoginInput>();
  const [error, setError] = useState<string | null>(messageFor(initialError));
  const [submitting, setSubmitting] = useState(false);

  async function onFinish(values: LoginInput) {
    setError(null);
    setSubmitting(true);
    try {
      const res = await signIn("credentials", { ...values, redirect: false });
      if (!res || res.error) {
        setError(messageFor(res?.code ?? res?.error ?? "unknown"));
        return;
      }
      router.replace(callbackUrl);
      router.refresh();
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {error && <Alert type="error" title={error} showIcon className="mb-6" role="alert" />}

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
        disabled={submitting}
        validateTrigger="onBlur"
      >
        <Form.Item label="Email" name="email" rules={[zodRule(loginSchema, "email")]}>
          <Input
            size="large"
            type="email"
            autoComplete="email"
            prefix={<MailOutlined />}
            placeholder="you@example.com"
          />
        </Form.Item>
        <Form.Item label="Password" name="password" rules={[zodRule(loginSchema, "password")]}>
          <Input.Password
            size="large"
            autoComplete="current-password"
            prefix={<LockOutlined />}
            placeholder="Your password"
          />
        </Form.Item>

        <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
          Log in
        </Button>
      </Form>

      {googleEnabled && (
        <>
          <Divider plain>or</Divider>
          <GoogleSignInButton callbackUrl={callbackUrl} />
        </>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        New to RecipeHub?{" "}
        <Link
          href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-semibold text-brand hover:underline"
        >
          Create an account
        </Link>
      </p>
    </>
  );
}
