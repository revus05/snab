import { UserRole } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateProductModal } from "@/src/features/products/create-product-modal";
import { getSessionFromCookies } from "@/src/shared/lib/auth";
import { prisma } from "@/src/shared/lib/prisma";

export default async function ProductsPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login");
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  const isAdmin = session.role === UserRole.ADMIN;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Продукты</h1>
        <p className="text-sm text-muted-foreground">
          Складские позиции и остатки.
        </p>
      </div>

      {isAdmin ? <CreateProductModal /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="transition-shadow hover:shadow-md">
            <Link href={`/products/${product.id}`} className="block">
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>Остаток: {product.stock}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {product.description}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {product.images.slice(0, 4).map((image) => (
                    <div
                      key={image}
                      className="overflow-hidden rounded-md border"
                    >
                      <Image
                        src={image}
                        alt={product.name}
                        width={220}
                        height={150}
                        className="h-24 w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
