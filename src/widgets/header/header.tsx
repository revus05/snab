"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isAuthPage } from "@/src/shared/lib/routes";
import { ThemeToggle } from "@/src/shared/ui/theme-toggle";
import { NotificationsBell } from "@/src/widgets/header/notifications-bell";
import logo from "../../../public/logo.png";

export function Header() {
  const pathname = usePathname();

  if (isAuthPage(pathname)) {
    return null;
  }

  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-sm font-semibold tracking-wide flex items-center gap-2"
        >
          <Image src={logo} alt="logo" className="size-8" />
          <span>БЕЛПОЛИСНАБ</span>
        </Link>
        <div className="flex items-center gap-2">
          <NotificationsBell />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
