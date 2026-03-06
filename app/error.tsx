"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    toast.error("Произошла ошибка приложения. Попробуйте снова.");
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-3 p-4 text-center">
      <AlertTriangle className="size-8 text-destructive" />
      <h2 className="text-xl font-semibold">Что-то пошло не так</h2>
      <p className="text-sm text-muted-foreground">
        Не удалось загрузить страницу. Попробуйте повторить действие.
      </p>
      <Button onClick={reset}>Повторить</Button>
    </div>
  );
}
