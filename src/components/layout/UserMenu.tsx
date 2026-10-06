"use client";

import { useRouter } from "next/navigation";
import { Avatar, Button, Dropdown, Skeleton, type MenuProps } from "antd";
import {
  BookOutlined,
  CrownOutlined,
  DashboardOutlined,
  HeartOutlined,
  LogoutOutlined,
  MenuOutlined,
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useSession } from "next-auth/react";
import LinkButton from "@/components/ui/LinkButton";
import { useLogout } from "@/hooks/useAuth";

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function UserMenu() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const logout = useLogout();

  if (status === "loading") {
    return <Skeleton.Avatar active size={36} />;
  }

  if (!session?.user) {
    const guestItems: MenuProps["items"] = [
      { key: "/recipes", icon: <SearchOutlined />, label: "Browse recipes" },
      { type: "divider" },
      { key: "/login", label: "Log in" },
      { key: "/register", label: "Sign up" },
    ];
    return (
      <>
        <div className="hidden items-center gap-2 sm:flex">
          <LinkButton href="/login" type="text">
            Log in
          </LinkButton>
          <LinkButton href="/register" type="primary">
            Sign up
          </LinkButton>
        </div>
        <Dropdown
          trigger={["click"]}
          menu={{ items: guestItems, onClick: ({ key }) => router.push(key) }}
        >
          <Button
            type="text"
            shape="circle"
            className="sm:!hidden"
            icon={<MenuOutlined />}
            aria-label="Open menu"
          />
        </Dropdown>
      </>
    );
  }

  const { user } = session;
  const items: MenuProps["items"] = [
    {
      key: "header",
      disabled: true,
      label: (
        <div className="py-1">
          <div className="font-semibold text-foreground">{user.name}</div>
          <div className="text-xs text-muted">@{user.username}</div>
        </div>
      ),
    },
    { type: "divider" },
    { key: "/recipes", icon: <SearchOutlined />, label: "Browse recipes", className: "md:!hidden" },
    { key: "/recipes/new", icon: <PlusOutlined />, label: "Submit a recipe" },
    { key: "/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "/dashboard?tab=recipes", icon: <BookOutlined />, label: "My recipes" },
    { key: "/saved", icon: <HeartOutlined />, label: "Saved recipes" },
    { key: `/users/${user.username}`, icon: <UserOutlined />, label: "Public profile" },
    ...(user.role === "admin"
      ? [{ key: "/admin", icon: <CrownOutlined />, label: "Admin panel" }]
      : []),
    { type: "divider" },
    { key: "logout", icon: <LogoutOutlined />, label: "Log out", danger: true },
  ];

  const onClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "logout") void logout();
    else router.push(key);
  };

  return (
    <Dropdown trigger={["click"]} placement="bottomRight" menu={{ items, onClick }}>
      <button
        type="button"
        aria-label="Open user menu"
        className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <Avatar
          size={36}
          src={user.image || undefined}
          alt={user.name ?? "User avatar"}
          className="cursor-pointer !bg-brand-600 font-semibold"
        >
          {initials(user.name)}
        </Avatar>
      </button>
    </Dropdown>
  );
}
