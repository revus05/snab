import { UserRole } from "@prisma/client";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateSupplierRequestPopover } from "@/src/features/restock/create-supplier-request-popover";
import { getSessionFromCookies } from "@/src/shared/lib/auth";
import { prisma } from "@/src/shared/lib/prisma";

type PageProps = {
  params: Promise<{ productId: string }>;
};

export default async function ProductDetailsPage({ params }: PageProps) {
  const { productId } = await params;
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      restockRequests: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          quantity: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  if (!product) {
    return <p>Товар не найден.</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{product.name}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Информация о товаре</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{product.description}</p>
          <p className="text-sm">
            <span className="font-medium">Остаток:</span> {product.stock}
          </p>
          <p className="text-sm">
            <span className="font-medium">ID товара:</span> {product.id}
          </p>
          <p className="text-sm">
            <span className="font-medium">Создан:</span>{" "}
            {new Date(product.createdAt).toLocaleString("ru-RU")}
          </p>
          <p className="text-sm">
            <span className="font-medium">Обновлен:</span>{" "}
            {new Date(product.updatedAt).toLocaleString("ru-RU")}
          </p>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {product.images.map((image) => (
              <div key={image} className="overflow-hidden rounded-md border">
                <Image
                  src={image}
                  alt={product.name}
                  width={600}
                  height={420}
                  className="h-40 w-full object-cover"
                />
              </div>
            ))}
          </div>

          {session.role === UserRole.ADMIN ? (
            <CreateSupplierRequestPopover
              productId={product.id}
              defaultQuantity={1}
            />
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>История заявок на пополнение</CardTitle>
        </CardHeader>
        <CardContent>
          {product.restockRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">Заявок пока нет.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {product.restockRequests.map((request) => (
                <li key={request.id}>
                  {new Date(request.createdAt).toLocaleString("ru-RU")} ·{" "}
                  {request.user.firstName} {request.user.lastName} · Кол-во:{" "}
                  {request.quantity} · Статус: {request.status}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
