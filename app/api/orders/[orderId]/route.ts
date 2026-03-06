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

export async function PATCH(request: Request, context: RouteContext) {
  const session = getApiSession(request);
  if (!session) {
    return unauthorizedResponse();
  }
  if (session.role !== UserRole.ADMIN) {
    return forbiddenResponse();
  }

  const { orderId } = await context.params;
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true },
  });

  if (!existingOrder) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const isCompleted = existingOrder.status === OrderStatus.COMPLETED;
  const order = isCompleted
    ? await prisma.order.findUnique({
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
      })
    : await prisma.order.update({
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

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}
