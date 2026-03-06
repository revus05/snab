"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/src/shared/ui/theme-provider";

export function ThemeToggle() {
  const { isMounted, resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Переключить тему"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isMounted && isDark ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  );
}
