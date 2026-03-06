import { RestockStatus, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  forbiddenResponse,
  getApiSession,
  unauthorizedResponse,
} from "@/src/shared/lib/api-auth";
import { prisma } from "@/src/shared/lib/prisma";
import { sendTelegramMessage } from "@/src/shared/lib/telegram";

export const runtime = "nodejs";

const createSupplierRequestSchema = z.object({
  productId: z.string().min(1),
  restockRequestId: z.string().min(1).optional(),
  quantity: z.number().int().positive(),
});

type ApiError = {
  status: number;
  message: string;
};

function formatDate(value: Date | string) {
  return new Date(value).toLocaleString("ru-RU");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatUserName(user: {
  firstName: string;
  lastName: string;
  email: string;
}) {
  return `${user.firstName} ${user.lastName} (${user.email})`;
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
  const parsed = createSupplierRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные запроса поставщику." },
      { status: 400 },
    );
  }

  const actor = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  });

  if (!actor) {
    return unauthorizedResponse();
  }

  const payload = parsed.data;

  const result = await prisma
    .$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: payload.productId },
        select: {
          id: true,
          name: true,
          description: true,
          stock: true,
        },
      });

      if (!product) {
        const error: ApiError = { status: 404, message: "Товар не найден." };
        throw error;
      }

      let restockRequest: {
        id: string;
        productId: string;
        quantity: number;
        createdAt: Date;
        status: RestockStatus;
        user: {
          firstName: string;
          lastName: string;
          email: string;
        };
      } | null = null;

      if (payload.restockRequestId) {
        restockRequest = await tx.restockRequest.findUnique({
          where: { id: payload.restockRequestId },
          select: {
            id: true,
            quantity: true,
            createdAt: true,
            status: true,
            productId: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });

        if (!restockRequest) {
          const error: ApiError = {
            status: 404,
            message: "Заявка на пополнение не найдена.",
          };
          throw error;
        }

        if (restockRequest.productId !== payload.productId) {
          const error: ApiError = {
            status: 400,
            message: "Заявка на пополнение не принадлежит этому товару.",
          };
          throw error;
        }
      }

      const updatedProduct = await tx.product.update({
        where: { id: product.id },
        data: {
          stock: {
            increment: payload.quantity,
          },
        },
        select: {
          id: true,
          name: true,
          description: true,
          stock: true,
        },
      });

      if (payload.restockRequestId) {
        await tx.restockRequest.update({
          where: { id: payload.restockRequestId },
          data: { status: RestockStatus.APPROVED },
        });
      }

      return {
        productBeforeStock: product.stock,
        product: updatedProduct,
        restockRequest,
        processedAt: new Date(),
      };
    })
    .catch((error: ApiError | unknown) => {
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        "message" in error
      ) {
        return error as ApiError;
      }
      throw error;
    });

  if ("status" in result) {
    return NextResponse.json(
      { error: result.message },
      { status: result.status },
    );
  }

  const actorLabel = formatUserName(actor);
  const restockRequestLabel = result.restockRequest
    ? [
        `<b>Заявка:</b> ${escapeHtml(result.restockRequest.id)}`,
        `<b>Создатель заявки:</b> ${escapeHtml(formatUserName(result.restockRequest.user))}`,
        `<b>Дата заявки:</b> ${escapeHtml(formatDate(result.restockRequest.createdAt))}`,
        `<b>Запрошено в заявке:</b> ${result.restockRequest.quantity}`,
      ].join("\n")
    : "<b>Заявка:</b> Пополнение со страницы товара";

  await sendTelegramMessage(
    [
      "📦 <b>Склад пополнен</b> ✅",
      `<b>Товар:</b> ${escapeHtml(result.product.name)}`,
      `<b>Количество пополнения:</b> ${parsed.data.quantity}`,
      `<b>Остаток до:</b> ${result.productBeforeStock}`,
      `<b>Остаток после:</b> ${result.product.stock}`,
      `<b>Кто пополнил:</b> ${escapeHtml(actorLabel)}`,
      `<b>Когда:</b> ${escapeHtml(formatDate(result.processedAt))}`,
      restockRequestLabel,
    ].join("\n"),
    { parseMode: "HTML" },
  );

  return NextResponse.json({
    product: result.product,
    previousStock: result.productBeforeStock,
    processedAt: result.processedAt,
  });
}
