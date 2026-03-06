import { NextResponse } from "next/server";
import { z } from "zod";
import { getApiSession, unauthorizedResponse } from "@/src/shared/lib/api-auth";
import { prisma } from "@/src/shared/lib/prisma";
import { THEME_COOKIE_NAME } from "@/src/shared/lib/theme";

export const runtime = "nodejs";

const updateThemeSchema = z.object({
  theme: z.enum(["light", "dark"]),
});

export async function PATCH(request: Request) {
  const session = getApiSession(request);
  if (!session) {
    return unauthorizedResponse();
  }

  const body = await request.json().catch(() => null);
  const parsed = updateThemeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректное значение темы." },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        theme: parsed.data.theme === "dark" ? "DARK" : "LIGHT",
      },
      select: { theme: true },
    });

    const response = NextResponse.json({
      theme: user.theme === "DARK" ? "dark" : "light",
    });

    response.cookies.set(THEME_COOKIE_NAME, parsed.data.theme, {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch (error) {
    console.error("Theme update failed:", error);
    return NextResponse.json(
      { error: "Не удалось сохранить тему. Попробуйте позже." },
      { status: 500 },
    );
  }
}
