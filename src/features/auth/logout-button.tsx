"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  readApiErrorMessage,
  resolveClientErrorMessage,
} from "@/src/shared/lib/client-errors";

export function LogoutButton() {
  const router = useRouter();

  const onLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error(await readApiErrorMessage(response, "Ошибка выхода"));
      }

      toast.success("Вы вышли из аккаунта.");
      router.push("/login");
      router.refresh();
    } catch (error) {
      toast.error(resolveClientErrorMessage(error, "Ошибка выхода"));
    }
  };

  return (
    <Button variant="destructive" onClick={onLogout}>
      <LogOut className="size-4" />
      Выйти
    </Button>
  );
}
