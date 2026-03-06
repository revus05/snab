import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  forbiddenResponse,
  getApiSession,
  unauthorizedResponse,
} from "@/src/shared/lib/api-auth";
import { prisma } from "@/src/shared/lib/prisma";
import { sendRestockTelegramMessage } from "@/src/shared/lib/telegram";

export const runtime = "nodejs";

const createRestockSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export async function GET(request: Request) {
  const session = getApiSession(request);
  if (!session) {
    return unauthorizedResponse();
  }
  if (session.role !== UserRole.ADMIN) {
    return forbiddenResponse();
  }

  const requests = await prisma.restockRequest.findMany({
    orderBy: { createdAt: "desc" },
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

  return NextResponse.json({ requests });
}

export async function POST(request: Request) {
  const session = getApiSession(request);
  if (!session) {
    return unauthorizedResponse();
  }

  const body = await request.json().catch(() => null);
  const parsed = createRestockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные заявки на пополнение." },
      { status: 400 },
    );
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    select: { id: true, name: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Товар не найден." }, { status: 404 });
  }

  const requestRecord = await prisma.restockRequest.create({
    data: {
      productId: product.id,
      userId: session.userId,
      quantity: parsed.data.quantity,
    },
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

  await sendRestockTelegramMessage(
    `Новая заявка на пополнение: ${product.name}, количество ${parsed.data.quantity}`,
  );

  return NextResponse.json({ request: requestRecord }, { status: 201 });
}
