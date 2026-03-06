import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  forbiddenResponse,
  getApiSession,
  unauthorizedResponse,
} from "@/src/shared/lib/api-auth";
import { uploadDataUriToCloudinary } from "@/src/shared/lib/cloudinary";
import { prisma } from "@/src/shared/lib/prisma";

export const runtime = "nodejs";

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  stock: z.number().int().nonnegative(),
  images: z.array(z.string().url()).default([]),
});

const productUpdateSchema = productSchema.extend({
  id: z.string().min(1),
});

async function requireAdmin(request: Request) {
  const session = getApiSession(request);
  if (!session) {
    return { error: unauthorizedResponse() as NextResponse, session: null };
  }
  if (session.role !== UserRole.ADMIN) {
    return { error: forbiddenResponse() as NextResponse, session };
  }
  return { error: null, session };
}

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  const contentType = request.headers.get("content-type") || "";
  let payload: z.infer<typeof productSchema> | null = null;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const name = `${formData.get("name") ?? ""}`.trim();
    const description = `${formData.get("description") ?? ""}`.trim();
    const stock = Number(formData.get("stock") ?? 0);
    const files = formData
      .getAll("images")
      .filter((item): item is File => item instanceof File);

    const uploadedUrls = await Promise.all(
      files.map(async (file) => {
        const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
        const dataUri = `data:${file.type};base64,${base64}`;
        return uploadDataUriToCloudinary(dataUri, "warehouse/products");
      }),
    );

    payload = {
      name,
      description,
      stock,
      images: uploadedUrls.filter((url): url is string => Boolean(url)),
    };
  } else {
    payload = (await request.json().catch(() => null)) as z.infer<
      typeof productSchema
    > | null;
  }

  const parsed = productSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные продукта." },
      { status: 400 },
    );
  }

  const product = await prisma.product.create({
    data: parsed.data,
  });

  return NextResponse.json({ product }, { status: 201 });
}

export async function PUT(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  const body = await request.json().catch(() => null);
  const parsed = productUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные продукта." },
      { status: 400 },
    );
  }

  const { id, ...data } = parsed.data;
  const product = await prisma.product.update({
    where: { id },
    data,
  });

  return NextResponse.json({ product });
}
