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

  const contentType = request.headers.get("content-type") || "";
  let payload: z.infer<typeof updateProfileSchema> | null = null;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const firstName = `${formData.get("firstName") ?? ""}`.trim();
    const lastName = `${formData.get("lastName") ?? ""}`.trim();
    const currentAvatarUrl = `${formData.get("currentAvatarUrl") ?? ""}`.trim();
    const avatar = formData.get("avatar");

    let avatarUrl: string | null = currentAvatarUrl || null;
    if (avatar instanceof File && avatar.size > 0) {
      const base64 = Buffer.from(await avatar.arrayBuffer()).toString("base64");
      const dataUri = `data:${avatar.type};base64,${base64}`;
      avatarUrl = await uploadDataUriToCloudinary(dataUri, "warehouse/avatars");
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
