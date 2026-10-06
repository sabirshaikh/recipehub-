"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Empty, Tabs } from "antd";
import { BookOutlined, HeartOutlined, SettingOutlined } from "@ant-design/icons";

import type { DashboardTab } from "@/components/dashboard/tabs";

interface DashboardTabsProps {
  activeTab: DashboardTab;
  recipesCount: number;
  recipesPanel: ReactNode;
}

/** Tab state lives in `?tab=` so links like /dashboard?tab=recipes are shareable. */
export default function DashboardTabs({
  activeTab,
  recipesCount,
  recipesPanel,
}: DashboardTabsProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Tabs
      activeKey={activeTab}
      onChange={(key) => router.replace(`${pathname}?tab=${key}`, { scroll: false })}
      items={[
        {
          key: "recipes",
          icon: <BookOutlined />,
          label: `My recipes (${recipesCount})`,
          children: recipesPanel,
        },
        {
          key: "saved",
          icon: <HeartOutlined />,
          label: "Saved",
          children: <Empty className="py-10" description="Saving recipes arrives in Phase 5." />,
        },
        {
          key: "settings",
          icon: <SettingOutlined />,
          label: "Profile settings",
          children: <Empty className="py-10" description="Profile settings arrive in Phase 5." />,
        },
      ]}
    />
  );
}
