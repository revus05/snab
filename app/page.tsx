import { UserRole } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSessionFromCookies } from "@/src/shared/lib/auth";
import { prisma } from "@/src/shared/lib/prisma";

export default async function HomePage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where:
      session.role === UserRole.ADMIN ? undefined : { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true },
      },
      items: {
        include: { product: true },
      },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Заказы</h1>
      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">Заказов пока нет.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <CardTitle>Заказ #{order.id.slice(0, 8)}</CardTitle>
                <CardDescription>
                  {new Date(order.createdAt).toLocaleString("ru-RU")} ·{" "}
                  {order.user.firstName} {order.user.lastName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {order.items.map((item) => (
                    <li key={item.id} className="text-sm">
                      <Link
                        href={`/orders/${order.id}/products/${item.productId}`}
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {item.product.name}
                      </Link>{" "}
                      · Кол-во: {item.quantity}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
