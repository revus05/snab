import { NextResponse } from "next/server";
import { z } from "zod";
import { getApiSession, unauthorizedResponse } from "@/src/shared/lib/api-auth";
import { prisma } from "@/src/shared/lib/prisma";

export const runtime = "nodejs";

const updateProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  avatarUrl: z.string().url().nullable().optional(),
});

export async function GET(request: Request) {
  const session = getApiSession(request);
  if (!session) {
    return unauthorizedResponse();
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      avatarUrl: true,
    },
  });

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const session = getApiSession(request);
  if (!session) {
    return unauthorizedResponse();
  }

  const body = await request.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid profile payload" },
      { status: 400 },
    );
  }

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      avatarUrl: parsed.data.avatarUrl ?? null,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      avatarUrl: true,
    },
  });

  return NextResponse.json({ user });
}
