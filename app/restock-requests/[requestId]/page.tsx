import { UserRole } from "@prisma/client";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateSupplierRequestPopover } from "@/src/features/restock/create-supplier-request-popover";
import { getSessionFromCookies } from "@/src/shared/lib/auth";
import { prisma } from "@/src/shared/lib/prisma";

type PageProps = {
  params: Promise<{ requestId: string }>;
};

export default async function RestockRequestPage({ params }: PageProps) {
  const { requestId } = await params;
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login");
  }

  const request = await prisma.restockRequest.findUnique({
    where: { id: requestId },
    include: {
      product: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  if (!request) {
    return <p>Заявка на пополнение не найдена.</p>;
  }

  const canRead =
    session.role === UserRole.ADMIN || request.user.id === session.userId;
  if (!canRead) {
    redirect("/");
  }

  const canCreateSupplierRequest =
    session.role === UserRole.ADMIN && request.status === "PENDING";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Заявка на пополнение</h1>

      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle>{request.product.name}</CardTitle>
            <Badge
              variant={request.status === "PENDING" ? "secondary" : "outline"}
            >
              {request.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {request.product.description}
          </p>
          <p className="text-sm">
            <span className="font-medium">Запрошено:</span> {request.quantity}
          </p>
          <p className="text-sm">
            <span className="font-medium">Текущий остаток:</span>{" "}
            {request.product.stock}
          </p>
          <p className="text-sm">
            <span className="font-medium">Создал заявку:</span>{" "}
            {request.user.firstName} {request.user.lastName} (
            {request.user.email})
          </p>
          <p className="text-sm">
            <span className="font-medium">Дата создания:</span>{" "}
            {new Date(request.createdAt).toLocaleString("ru-RU")}
          </p>
          <p className="text-sm">
            <span className="font-medium">Дата обновления:</span>{" "}
            {new Date(request.updatedAt).toLocaleString("ru-RU")}
          </p>
          <p className="text-sm">
            <span className="font-medium">ID заявки:</span> {request.id}
          </p>
          <p className="text-sm">
            <span className="font-medium">ID товара:</span> {request.product.id}
          </p>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {request.product.images.map((image) => (
              <div key={image} className="overflow-hidden rounded-md border">
                <Image
                  src={image}
                  alt={request.product.name}
                  width={300}
                  height={220}
                  className="h-28 w-full object-cover"
                />
              </div>
            ))}
          </div>

          {canCreateSupplierRequest ? (
            <CreateSupplierRequestPopover
              productId={request.productId}
              restockRequestId={request.id}
              defaultQuantity={Math.max(request.quantity, 1)}
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
