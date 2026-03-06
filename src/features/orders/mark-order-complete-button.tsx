"use client";

import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/button";

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

    const response = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Не удалось обновить статус заказа.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    router.refresh();
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
