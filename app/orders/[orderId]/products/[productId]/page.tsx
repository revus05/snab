import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateRestockForm } from "@/src/features/restock/create-restock-form";
import { getSessionFromCookies } from "@/src/shared/lib/auth";
import { prisma } from "@/src/shared/lib/prisma";

type PageProps = {
  params: Promise<{ orderId: string; productId: string }>;
};

export default async function OrderProductPage({ params }: PageProps) {
  const { orderId, productId } = await params;
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

  const item = order.items.find(
    (orderItem) => orderItem.productId === productId,
  );
  if (!item) {
    return <p>Продукт в заказе не найден.</p>;
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Продукт в заказе</h1>
      <Card>
        <CardHeader>
          <CardTitle>{item.product.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {item.product.description}
          </p>
          <p className="text-sm">Требуемое количество: {item.quantity}</p>
          <p className="text-sm">Текущий остаток: {item.product.stock}</p>
          <CreateRestockForm
            productId={item.product.id}
            defaultQuantity={Math.max(item.quantity, 1)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
