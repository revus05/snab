import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { getApiSession, unauthorizedResponse } from "@/src/shared/lib/api-auth";
import { prisma } from "@/src/shared/lib/prisma";

export const runtime = "nodejs";

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
