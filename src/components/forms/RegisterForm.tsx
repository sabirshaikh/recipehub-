"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Button, Divider, Form, Input } from "antd";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { signIn } from "next-auth/react";
import GoogleSignInButton from "@/components/forms/GoogleSignInButton";
import { useRegister } from "@/hooks/useAuth";
import { isApiError } from "@/lib/api-error";
import { applyFieldErrors, zodRule } from "@/lib/form";
import { registerSchema, type RegisterFormValues } from "@/schemas/auth";

interface RegisterFormProps {
  callbackUrl: string;
  googleEnabled: boolean;
}

export default function RegisterForm({ callbackUrl, googleEnabled }: RegisterFormProps) {
  const router = useRouter();
  const [form] = Form.useForm<RegisterFormValues>();
  const register = useRegister();
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const busy = register.isPending || signingIn;

  async function onFinish(values: RegisterFormValues) {
    setError(null);
    // registerSchema strips confirmPassword (Zod drops unknown keys)
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) return; // field rules already show the messages

    try {
      await register.mutateAsync(parsed.data);
    } catch (err) {
      if (isApiError(err)) {
        // 409 / 422 → show next to the fields; anything else → banner
        if (!applyFieldErrors(form, err.fieldErrors)) setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
      return;
    }

    // Account created — sign straight in
    setSigningIn(true);
    const res = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    if (res?.error) {
      setSigningIn(false);
      router.push("/login");
      return;
    }
    router.replace(callbackUrl);
    router.refresh();
  }

  return (
    <>
      {error && <Alert type="error" title={error} showIcon className="mb-6" role="alert" />}

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
        disabled={busy}
        validateTrigger="onBlur"
      >
        <Form.Item label="Full name" name="name" rules={[zodRule(registerSchema, "name")]}>
          <Input
            size="large"
            autoComplete="name"
            prefix={<UserOutlined />}
            placeholder="Asha Rao"
          />
        </Form.Item>
        <Form.Item
          label="Username"
          name="username"
          rules={[zodRule(registerSchema, "username")]}
          extra="Letters, numbers and underscores. This is your public profile URL."
        >
          <Input size="large" autoComplete="username" prefix="@" placeholder="asha_cooks" />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={[zodRule(registerSchema, "email")]}>
          <Input
            size="large"
            type="email"
            autoComplete="email"
            prefix={<MailOutlined />}
            placeholder="you@example.com"
          />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[zodRule(registerSchema, "password")]}
          extra="At least 8 characters with a letter and a number."
        >
          <Input.Password size="large" autoComplete="new-password" prefix={<LockOutlined />} />
        </Form.Item>
        <Form.Item
          label="Confirm password"
          name="confirmPassword"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Please confirm your password" },
            ({ getFieldValue }) => ({
              validator: async (_, value: string | undefined) => {
                if (value && value !== getFieldValue("password")) {
                  throw new Error("Passwords do not match");
                }
              },
            }),
          ]}
        >
          <Input.Password size="large" autoComplete="new-password" prefix={<LockOutlined />} />
        </Form.Item>
        <Button type="primary" htmlType="submit" size="large" block loading={busy}>
          Create account
        </Button>
      </Form>

      {googleEnabled && (
        <>
          <Divider plain>or</Divider>
          <GoogleSignInButton callbackUrl={callbackUrl} />
        </>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-semibold text-brand hover:underline"
        >
          Log in
        </Link>
      </p>
    </>
  );
}
