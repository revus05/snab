import { UserRole } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CreateOrderModal } from "@/src/features/orders/create-order-modal";
import { getSessionFromCookies } from "@/src/shared/lib/auth";
import { prisma } from "@/src/shared/lib/prisma";

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const { status } = await searchParams;
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login");
  }

  const activeTab = status === "completed" ? "completed" : "pending";
  const orderStatus = activeTab === "completed" ? "COMPLETED" : "PENDING";

  const [orders, users, products] = await Promise.all([
    prisma.order.findMany({
      where: {
        ...(session.role === UserRole.ADMIN ? {} : { userId: session.userId }),
        status: orderStatus,
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
        items: {
          include: { product: true },
        },
      },
    }),
    session.role === UserRole.ADMIN
      ? prisma.user.findMany({
          orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        })
      : Promise.resolve([]),
    session.role === UserRole.ADMIN
      ? prisma.product.findMany({
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            stock: true,
          },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Заказы</h1>
        {session.role === UserRole.ADMIN ? (
          <CreateOrderModal users={users} products={products} />
        ) : null}
      </div>

      <div className="inline-flex rounded-lg border bg-muted/30 p-1">
        <Link
          href="/?status=pending"
          className={cn(
            "rounded-md px-3 py-1.5 text-sm transition-colors",
            activeTab === "pending"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          В очереди
        </Link>
        <Link
          href="/?status=completed"
          className={cn(
            "rounded-md px-3 py-1.5 text-sm transition-colors",
            activeTab === "completed"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Выполнены
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {activeTab === "pending"
            ? "Заказов в очереди пока нет."
            : "Выполненных заказов пока нет."}
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {orders.map((order) => (
            <Card key={order.id} className="transition-shadow hover:shadow-md">
              <Link href={`/orders/${order.id}`} className="block">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle>Заказ #{order.id.slice(0, 8)}</CardTitle>
                    <Badge
                      variant={
                        order.status === "COMPLETED" ? "outline" : "secondary"
                      }
                    >
                      {order.status === "COMPLETED" ? "Выполнен" : "В очереди"}
                    </Badge>
                  </div>
                  <CardDescription>
                    {new Date(order.createdAt).toLocaleString("ru-RU")} ·{" "}
                    {order.user.firstName} {order.user.lastName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border bg-muted/20 p-2"
                      >
                        <p className="text-sm font-medium">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Нужно: {item.quantity}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Остаток: {item.product.stock}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
