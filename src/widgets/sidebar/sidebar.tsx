"use client";

import { Box, ClipboardList, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isAuthPage } from "@/src/shared/lib/routes";

const links = [
  { href: "/", label: "Заказы", icon: ClipboardList },
  { href: "/products", label: "Продукты", icon: Box },
  { href: "/profile", label: "Профиль", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  if (isAuthPage(pathname)) {
    return null;
  }

  return (
    <aside className="hidden border-r md:block">
      <nav className="space-y-2 p-3">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href ||
            (link.href !== "/" && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
