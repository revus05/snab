"use client";

import { Loader2, PackagePlus, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type OrderModalUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type OrderModalProduct = {
  id: string;
  name: string;
  stock: number;
};

type CreateOrderModalProps = {
  users: OrderModalUser[];
  products: OrderModalProduct[];
};

type OrderItemState = {
  id: string;
  productId: string;
  quantity: string;
};

function createItem(products: OrderModalProduct[]): OrderItemState {
  return {
    id: crypto.randomUUID(),
    productId: products[0]?.id ?? "",
    quantity: "1",
  };
}

export function CreateOrderModal({ users, products }: CreateOrderModalProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [userId, setUserId] = React.useState(users[0]?.id ?? "");
  const [items, setItems] = React.useState<OrderItemState[]>([
    createItem(products),
  ]);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const addItem = () => {
    setItems((prev) => [...prev, createItem(products)]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const updateItem = (index: number, patch: Partial<OrderItemState>) => {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const normalizedItems = items
      .map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
      }))
      .filter(
        (item) =>
          item.productId && Number.isFinite(item.quantity) && item.quantity > 0,
      );

    if (!userId || normalizedItems.length === 0) {
      setError("Заполните пользователя и хотя бы один товар.");
      setIsSubmitting(false);
      return;
    }

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId,
        items: normalizedItems,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Не удалось создать заказ");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setOpen(false);
    setItems([createItem(products)]);
    router.refresh();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button disabled={users.length === 0 || products.length === 0}>
          <PackagePlus className="size-4" />
          Создать заказ
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Новый заказ</AlertDialogTitle>
        </AlertDialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="userId">Пользователь</Label>
            <select
              id="userId"
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              required
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Позиции заказа</Label>
            {items.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_140px_auto] items-end gap-2"
              >
                <div className="space-y-1">
                  <Label
                    htmlFor={`product-${index}`}
                    className="text-xs text-muted-foreground"
                  >
                    Товар
                  </Label>
                  <select
                    id={`product-${index}`}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                    value={item.productId}
                    onChange={(event) =>
                      updateItem(index, { productId: event.target.value })
                    }
                    required
                  >
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} (остаток: {product.stock})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor={`qty-${index}`}
                    className="text-xs text-muted-foreground"
                  >
                    Кол-во
                  </Label>
                  <Input
                    id={`qty-${index}`}
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(index, { quantity: event.target.value })
                    }
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addItem}>
              <Plus className="size-4" />
              Добавить позицию
            </Button>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {isSubmitting ? "Сохраняем..." : "Создать"}
            </Button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
