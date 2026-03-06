import { UserRole } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkOrderCompleteButton } from "@/src/features/orders/mark-order-complete-button";
import { getSessionFromCookies } from "@/src/shared/lib/auth";
import { prisma } from "@/src/shared/lib/prisma";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderDetailsPage({ params }: PageProps) {
  const { orderId } = await params;
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    return <p>Заказ не найден.</p>;
  }

  const canRead =
    session.role === UserRole.ADMIN || order.user.id === session.userId;
  if (!canRead) {
    redirect("/");
  }

  const isCompleted = order.status === "COMPLETED";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">
          Заказ #{order.id.slice(0, 8)}
        </h1>
        <Badge variant={isCompleted ? "outline" : "secondary"}>
          {isCompleted ? "Выполнен" : "В очереди"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Информация о заказе</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <span className="font-medium">ID заказа:</span> {order.id}
          </p>
          <p className="text-sm">
            <span className="font-medium">Создатель:</span>{" "}
            {order.user.firstName} {order.user.lastName} ({order.user.email})
          </p>
          <p className="text-sm">
            <span className="font-medium">Создан:</span>{" "}
            {new Date(order.createdAt).toLocaleString("ru-RU")}
          </p>
          <p className="text-sm">
            <span className="font-medium">Обновлен:</span>{" "}
            {new Date(order.updatedAt).toLocaleString("ru-RU")}
          </p>
          <p className="text-sm">
            <span className="font-medium">Статус:</span>{" "}
            {isCompleted ? "Выполнен" : "В очереди"}
          </p>
          {order.completedAt ? (
            <p className="text-sm">
              <span className="font-medium">Дата выполнения:</span>{" "}
              {new Date(order.completedAt).toLocaleString("ru-RU")}
            </p>
          ) : null}

          {session.role === UserRole.ADMIN && !isCompleted ? (
            <MarkOrderCompleteButton orderId={order.id} />
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Товары для заказа</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Позиции отсутствуют.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {order.items.map((item) => (
                <Link
                  key={item.id}
                  href={`/orders/${order.id}/products/${item.productId}`}
                  className="block rounded-lg border p-3 transition-colors hover:bg-muted/30"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{item.product.name}</p>
                      <Badge variant="secondary">Кол-во: {item.quantity}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.product.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Остаток на складе: {item.product.stock}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {item.product.images.slice(0, 3).map((image) => (
                        <div
                          key={image}
                          className="overflow-hidden rounded-md border"
                        >
                          <Image
                            src={image}
                            alt={item.product.name}
                            width={160}
                            height={120}
                            className="h-16 w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
