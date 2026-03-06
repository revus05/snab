export type OrderItemEntity = {
  id: string;
  productId: string;
  quantity: number;
};

export type OrderEntity = {
  id: string;
  userId: string;
  status: "PENDING" | "COMPLETED";
  completedAt: Date | null;
  createdAt: Date;
  items: OrderItemEntity[];
};
