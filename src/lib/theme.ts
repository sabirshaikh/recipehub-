import { theme as antdTheme, type ThemeConfig } from "antd";

/**
 * Design tokens shared by Ant Design (ConfigProvider) and Tailwind.
 * Tailwind mirrors these in `src/app/globals.css` (`@theme` block) — keep both in sync.
 */
export const brand = {
  primary: "#e8590c",
  primaryHover: "#f76707",
  primaryActive: "#d9480f",
  success: "#2f9e44",
  warning: "#f59f00",
  error: "#e03131",
  radius: 10,
  radiusLg: 16,
  fontFamily:
    "var(--font-sans), ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
} as const;

export type ThemeMode = "light" | "dark";

export function getAntdTheme(mode: ThemeMode): ThemeConfig {
  return {
    algorithm: mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    // Key must differ per theme, otherwise light/dark CSS variable blocks collide
    cssVar: { key: `rh-${mode}` },
    token: {
      colorPrimary: brand.primary,
      colorSuccess: brand.success,
      colorWarning: brand.warning,
      colorError: brand.error,
      colorLink: brand.primary,
      borderRadius: brand.radius,
      borderRadiusLG: brand.radiusLg,
      fontFamily: brand.fontFamily,
      ...(mode === "dark" ? { colorBgBase: "#141110", colorBgLayout: "#141110" } : {}),
    },
    components: {
      Button: { fontWeight: 600 },
      Rate: { starColor: "#fab005" },
    },
  };
}
