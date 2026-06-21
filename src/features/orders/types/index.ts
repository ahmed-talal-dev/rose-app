import { PaginationParams } from "@/shared/types";

export type OrderStatus =
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED";

export type PaymentMethod = "CASH_ON_DELIVERY" | "CREDIT_CARD";

export type PaymentStatus =
    | "PENDING"
    | "PROCESSING"
    | "SUCCEEDED"
    | "FAILED"
    | "REFUNDED"
    | "CANCELLED";

export interface OrderItemProduct {
  title: string;
  image: string;
  rating: number;
  reviewsCount: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: OrderItemProduct;
}

export type Order = {
    id: string;
    userId: string;
    addressId: string;
    couponId?: string;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: string;
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    trackingNumber?: string;
    notes?: string;
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
    deliveryStatus: string;
};

export type OrdersParams = PaginationParams;

export interface CreateOrderInput {
    addressId: string;
    paymentMethod: "CASH_ON_DELIVERY" | "CREDIT_CARD";
    couponCode?: string;
    notes?: string;
}