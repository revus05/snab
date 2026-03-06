import { OrderStatus, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  forbiddenResponse,
  getApiSession,
  unauthorizedResponse,
} from "@/src/shared/lib/api-auth";
import { prisma } from "@/src/shared/lib/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = getApiSession(request);
  if (!session) {
    return unauthorizedResponse();
  }
  if (session.role !== UserRole.ADMIN) {
    return forbiddenResponse();
  }

  const { orderId } = await context.params;
  try {
    const order = await prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findUnique({
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

      if (!existingOrder) {
        throw new ApiError(404, "Заказ не найден.");
      }

      if (existingOrder.status === OrderStatus.COMPLETED) {
        return existingOrder;
      }

      const shortageItem = existingOrder.items.find(
        (item) => item.product.stock < item.quantity,
      );

      if (shortageItem) {
        throw new ApiError(
          400,
          `Недостаточно остатка для товара "${shortageItem.product.name}": нужно ${shortageItem.quantity}, доступно ${shortageItem.product.stock}.`,
        );
      }

      for (const item of existingOrder.items) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updated.count === 0) {
          throw new ApiError(
            400,
            `Недостаточно остатка для товара "${item.product.name}".`,
          );
        }
      }

      return tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.COMPLETED,
          completedAt: new Date(),
        },
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
    });

    return NextResponse.json({ order });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("Order completion failed:", error);
    return NextResponse.json(
      { error: "Не удалось выполнить заказ. Попробуйте позже." },
      { status: 500 },
    );
  }
}
