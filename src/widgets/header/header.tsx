"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { isAuthPage } from "@/src/shared/lib/routes";
import { ThemeToggle } from "@/src/shared/ui/theme-toggle";
import { NotificationsBell } from "@/src/widgets/header/notifications-bell";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  if (isAuthPage(pathname)) {
    return null;
  }

  const onLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-sm font-semibold tracking-wide">
          SNAB WAREHOUSE
        </Link>
        <div className="flex items-center gap-2">
          <NotificationsBell />
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={onLogout}>
            Выйти
          </Button>
        </div>
      </div>
    </header>
  );
}
