"use client";

import { useEffect, type ReactNode } from "react";
import { App as AntdApp, ConfigProvider } from "antd";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider, useTheme } from "next-themes";
import { getQueryClient } from "@/lib/query-client";
import { getAntdTheme } from "@/lib/theme";
import { registerNotificationInstance } from "@/lib/notify";

/** Registers the context-aware notification API for non-React callers (Axios). */
function AntdAppBridge() {
  const { notification } = AntdApp.useApp();
  useEffect(() => {
    registerNotificationInstance(notification);
    return () => registerNotificationInstance(null);
  }, [notification]);
  return null;
}

/** antd theme follows next-themes, which also toggles Tailwind's `.dark` class. */
function AntdThemeProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const mode = resolvedTheme === "dark" ? "dark" : "light";

  return (
    <ConfigProvider theme={getAntdTheme(mode)}>
      <AntdApp component={false}>
        <AntdAppBridge />
        {children}
      </AntdApp>
    </ConfigProvider>
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AntdThemeProvider>{children}</AntdThemeProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        )}
      </QueryClientProvider>
    </SessionProvider>
  );
}
