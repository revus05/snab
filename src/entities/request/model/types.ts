import type { RestockStatus } from "@prisma/client";

export type RestockRequestEntity = {
  id: string;
  productId: string;
  userId: string;
  quantity: number;
  status: RestockStatus;
  createdAt: Date;
};
