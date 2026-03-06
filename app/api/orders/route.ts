import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  forbiddenResponse,
  getApiSession,
  unauthorizedResponse,
} from "@/src/shared/lib/api-auth";
import { prisma } from "@/src/shared/lib/prisma";

export const runtime = "nodejs";

const createOrderSchema = z.object({
  userId: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

export async function GET(request: Request) {
  const session = getApiSession(request);
  if (!session) {
    return unauthorizedResponse();
  }

  const orders = await prisma.order.findMany({
    where:
      session.role === UserRole.ADMIN ? undefined : { userId: session.userId },
    orderBy: { createdAt: "desc" },
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

  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const session = getApiSession(request);
  if (!session) {
    return unauthorizedResponse();
  }

  if (session.role !== UserRole.ADMIN) {
    return forbiddenResponse();
  }

  const body = await request.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid order payload" },
      { status: 400 },
    );
  }

  const order = await prisma.order.create({
    data: {
      userId: parsed.data.userId,
      items: {
        create: parsed.data.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
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

  return NextResponse.json({ order }, { status: 201 });
}
