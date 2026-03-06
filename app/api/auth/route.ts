import { NextResponse } from "next/server";
import { z } from "zod";
import { getApiSession } from "@/src/shared/lib/api-auth";
import {
  AUTH_COOKIE_NAME,
  comparePassword,
  signSessionToken,
} from "@/src/shared/lib/auth";
import { prisma } from "@/src/shared/lib/prisma";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export async function GET(request: Request) {
  const session = getApiSession(request);
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
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

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Проверьте корректность данных для входа." },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Неверный email или пароль." },
        { status: 401 },
      );
    }

    const isValidPassword = await comparePassword(
      parsed.data.password,
      user.password,
    );
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Неверный email или пароль." },
        { status: 401 },
      );
    }

    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json(
      { error: "Не удалось выполнить вход. Попробуйте позже." },
      { status: 500 },
    );
  }
}
