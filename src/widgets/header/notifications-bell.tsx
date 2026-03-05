"use client";

import { Bell } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type RestockRequestListItem = {
  id: string;
  quantity: number;
  status: string;
  createdAt: string;
  product: { name: string };
  user: { firstName: string; lastName: string };
};

export function NotificationsBell() {
  const [items, setItems] = React.useState<RestockRequestListItem[]>([]);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const load = async () => {
      const authResponse = await fetch("/api/auth");
      const authData = await authResponse.json();
      if (authData?.user?.role !== "ADMIN") {
        setIsAdmin(false);
        return;
      }

      setIsAdmin(true);
      const requestsResponse = await fetch("/api/restock");
      if (!requestsResponse.ok) {
        return;
      }
      const requestsData = await requestsResponse.json();
      setItems(requestsData.requests ?? []);
    };

    load().catch(() => undefined);
  }, []);

  if (!isAdmin) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Уведомления">
          <Bell className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Заявки на пополнение</span>
          <Badge variant="secondary">{items.length}</Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <DropdownMenuItem disabled>Новых заявок нет</DropdownMenuItem>
        ) : (
          items.slice(0, 10).map((item) => (
            <DropdownMenuItem
              key={item.id}
              className="flex-col items-start gap-0"
            >
              <div className="font-medium">{item.product.name}</div>
              <div className="text-xs text-muted-foreground">
                {item.user.firstName} {item.user.lastName}, кол-во:{" "}
                {item.quantity}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
