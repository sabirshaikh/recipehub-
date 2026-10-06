"use client";

import { useState } from "react";
import { Button } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import { signIn } from "next-auth/react";

export default function GoogleSignInButton({ callbackUrl }: { callbackUrl: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      block
      size="large"
      icon={<GoogleOutlined />}
      loading={loading}
      onClick={() => {
        setLoading(true);
        void signIn("google", { redirectTo: callbackUrl });
      }}
    >
      Continue with Google
    </Button>
  );
}
