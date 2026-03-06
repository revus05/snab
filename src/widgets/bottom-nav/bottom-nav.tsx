"use client";

import { Box, ClipboardList, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isAuthPage } from "@/src/shared/lib/routes";
import { ProfileNavIcon } from "@/src/shared/ui/profile-nav-icon";

const links = [
  { href: "/", label: "Заказы", icon: ClipboardList },
  { href: "/products", label: "Продукты", icon: Box },
  { href: "/profile", label: "Профиль", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  if (isAuthPage(pathname)) {
    return null;
  }

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-20 border-t bg-background/95 p-2 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-3 gap-2">
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
                "flex flex-col items-center gap-1 rounded-md py-2 text-xs",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground",
              )}
            >
              {link.href === "/profile" ? (
                <ProfileNavIcon className="size-4" />
              ) : (
                <Icon className="size-4" />
              )}
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
