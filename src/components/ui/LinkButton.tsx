"use client";

import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "antd";

type LinkButtonProps = Omit<ButtonProps, "href"> & { href: string };

/**
 * antd Button rendered as a real `<a href>` (right-click / open-in-new-tab work)
 * that still navigates client-side. Avoids nesting <button> inside <Link>.
 */
export default function LinkButton({ href, onClick, ...props }: LinkButtonProps) {
  const router = useRouter();

  function handleClick(e: MouseEvent<HTMLElement>) {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    router.push(href);
  }

  return <Button {...props} href={href} onClick={handleClick} />;
}
