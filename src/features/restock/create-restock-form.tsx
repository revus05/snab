"use client";

import { SendHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [status, setStatus] = React.useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    const response = await fetch("/api/restock", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId, quantity: Number(quantity) }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setStatus(data?.error ?? "Не удалось создать заявку");
      return;
    }

    setStatus("Заявка создана.");
    router.refresh();
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
      <Button type="submit">
        <SendHorizontal className="size-4" />
        Создать заявку на пополнение
      </Button>
      {status ? (
        <p className="text-sm text-muted-foreground">{status}</p>
      ) : null}
    </form>
  );
}
