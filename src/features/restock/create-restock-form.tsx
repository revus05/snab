"use client";

import { SendHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  readApiErrorMessage,
  resolveClientErrorMessage,
} from "@/src/shared/lib/client-errors";

type CreateRestockFormProps = {
  productId: string;
  defaultQuantity?: number;
};

export function CreateRestockForm({
  productId,
  defaultQuantity = 1,
}: CreateRestockFormProps) {
  const router = useRouter();
  const [quantity, setQuantity] = React.useState(String(defaultQuantity));
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/restock", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId, quantity: Number(quantity) }),
      });

      if (!response.ok) {
        throw new Error(
          await readApiErrorMessage(response, "Не удалось создать заявку"),
        );
      }

      toast.success("Заявка создана.");
      router.refresh();
    } catch (error) {
      toast.error(
        resolveClientErrorMessage(error, "Не удалось создать заявку"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="restockQuantity">Количество</Label>
        <Input
          id="restockQuantity"
          type="number"
          min={1}
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        <SendHorizontal className="size-4" />
        {isSubmitting ? "Отправляем..." : "Создать заявку на пополнение"}
      </Button>
    </form>
  );
}
