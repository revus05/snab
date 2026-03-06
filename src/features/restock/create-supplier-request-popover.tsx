"use client";

import { Loader2, PackageCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type CreateSupplierRequestPopoverProps = {
  productId: string;
  restockRequestId?: string;
  defaultQuantity?: number;
  disabled?: boolean;
};

export function CreateSupplierRequestPopover({
  productId,
  restockRequestId,
  defaultQuantity = 1,
  disabled = false,
}: CreateSupplierRequestPopoverProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [quantity, setQuantity] = React.useState(String(defaultQuantity));
  const [status, setStatus] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    const response = await fetch("/api/supplier-requests", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        productId,
        restockRequestId,
        quantity: Number(quantity),
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setStatus(data?.error ?? "Не удалось обработать запрос.");
      setIsSubmitting(false);
      return;
    }

    setStatus("Запрос поставщику отправлен. Остаток обновлен.");
    setIsSubmitting(false);
    setOpen(false);
    window.dispatchEvent(new Event("restock-updated"));
    router.refresh();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" disabled={disabled}>
          <PackageCheck className="size-4" />
          Создать запрос поставщику
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="space-y-3">
        <div>
          <p className="text-sm font-medium">Пополнение склада</p>
          <p className="text-xs text-muted-foreground">
            Укажите, сколько товара заказываем у поставщика.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="supplierQuantity">Количество</Label>
            <Input
              id="supplierQuantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
            {isSubmitting ? "Отправляем..." : "Отправить"}
          </Button>
        </form>
        {status ? (
          <p className="text-xs text-muted-foreground">{status}</p>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
