"use client";

import { useSyncExternalStore } from "react";
import { Button, Tooltip } from "antd";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { useTheme } from "next-themes";

const subscribe = () => () => {};

/** Toggles antd (darkAlgorithm) and Tailwind (`.dark`) together via next-themes. */
export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // Theme is unknown during SSR — render a stable placeholder until mounted
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const isDark = mounted && resolvedTheme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <Tooltip title={label}>
      <Button
        type="text"
        shape="circle"
        aria-label={label}
        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        onClick={() => setTheme(isDark ? "light" : "dark")}
      />
    </Tooltip>
  );
}
