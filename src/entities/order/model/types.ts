export type OrderItemEntity = {
  id: string;
  productId: string;
  quantity: number;
};

export type OrderEntity = {
  id: string;
  userId: string;
  createdAt: Date;
  items: OrderItemEntity[];
};
