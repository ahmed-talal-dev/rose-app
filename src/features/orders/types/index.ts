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

export type OrderItem = {
    id: string;
    productId: string;
    quantity: number;
    price: number;
};

export type Order = {
    id: string;
    userId: string;
    addressId: string;
    couponId?: string;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    trackingNumber?: string;
    notes?: string;
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
};

export type OrdersParams = PaginationParams;

export type CreateOrderInput = {
    addressId: string;
    paymentMethod: PaymentMethod;
    couponCode?: string;
    notes?: string;
};