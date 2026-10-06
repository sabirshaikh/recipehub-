/** Shared by the server page and the client tabs (must not live in a "use client" file). */
export const DASHBOARD_TABS = ["recipes", "saved", "settings"] as const;
export type DashboardTab = (typeof DASHBOARD_TABS)[number];

export function isDashboardTab(value: unknown): value is DashboardTab {
  return typeof value === "string" && (DASHBOARD_TABS as readonly string[]).includes(value);
}
