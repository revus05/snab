"use client";

import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  readApiErrorMessage,
  resolveClientErrorMessage,
} from "@/src/shared/lib/client-errors";

type MarkOrderCompleteButtonProps = {
  orderId: string;
  disabled?: boolean;
};

export function MarkOrderCompleteButton({
  orderId,
  disabled = false,
}: MarkOrderCompleteButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onClick = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error(
          await readApiErrorMessage(
            response,
            "Не удалось обновить статус заказа.",
          ),
        );
      }

      toast.success("Заказ отмечен как выполненный.");
      router.refresh();
    } catch (error) {
      const message = resolveClientErrorMessage(
        error,
        "Не удалось обновить статус заказа.",
      );
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={onClick}
        disabled={disabled || isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Check className="size-4" />
        )}
        {isSubmitting ? "Сохраняем..." : "Отметить как выполненный"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
