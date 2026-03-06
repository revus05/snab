import { NextResponse } from "next/server";
import { z } from "zod";
import { getApiSession, unauthorizedResponse } from "@/src/shared/lib/api-auth";
import { uploadDataUriToCloudinary } from "@/src/shared/lib/cloudinary";
import { prisma } from "@/src/shared/lib/prisma";

export const runtime = "nodejs";

const updateProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  avatarUrl: z.string().url().nullable().optional(),
});

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

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

  try {
    const contentType = request.headers.get("content-type") || "";
    let payload: z.infer<typeof updateProfileSchema> | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const firstName = `${formData.get("firstName") ?? ""}`.trim();
      const lastName = `${formData.get("lastName") ?? ""}`.trim();
      const currentAvatarUrl =
        `${formData.get("currentAvatarUrl") ?? ""}`.trim();
      const avatar = formData.get("avatar");

      let avatarUrl: string | null = currentAvatarUrl || null;

      if (avatar instanceof File && avatar.size > 0) {
        if (!avatar.type.startsWith("image/")) {
          return NextResponse.json(
            { error: "Аватар должен быть изображением." },
            { status: 400 },
          );
        }

        if (avatar.size > MAX_AVATAR_SIZE_BYTES) {
          return NextResponse.json(
            { error: "Размер аватара не должен превышать 5 МБ." },
            { status: 400 },
          );
        }

        const mimeType = avatar.type || "image/jpeg";
        const base64 = Buffer.from(await avatar.arrayBuffer()).toString(
          "base64",
        );
        const dataUri = `data:${mimeType};base64,${base64}`;
        const uploadedAvatarUrl = await uploadDataUriToCloudinary(
          dataUri,
          "warehouse/avatars",
        );

        if (!uploadedAvatarUrl) {
          return NextResponse.json(
            {
              error:
                "Не удалось загрузить аватар в Cloudinary. Проверьте настройки Cloudinary.",
            },
            { status: 500 },
          );
        }

        avatarUrl = uploadedAvatarUrl;
      }

      payload = { firstName, lastName, avatarUrl };
    } else {
      payload = (await request.json().catch(() => null)) as z.infer<
        typeof updateProfileSchema
      > | null;
    }

    const parsed = updateProfileSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Некорректные данные профиля." },
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
  } catch (error) {
    console.error("Profile update failed:", error);
    return NextResponse.json(
      { error: "Не удалось обновить профиль. Попробуйте позже." },
      { status: 500 },
    );
  }
}
