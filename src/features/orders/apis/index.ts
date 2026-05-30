import { fetchClient } from "@/shared/lib/apis/fetch";
import { PaginatedPayload } from "@/shared/types";
import { Order, OrdersParams, CreateOrderInput, OrderStatus } from "../types";

export const getOrders = (params?: OrdersParams) =>
    fetchClient<PaginatedPayload<Order>>("/api/orders", { params });

export const getOrder = (id: string) =>
    fetchClient<Order>(`/api/orders/${id}`);

export const createOrder = (body: CreateOrderInput) =>
    fetchClient<Order>("/api/orders", {
        method: "POST",
        body: JSON.stringify(body),
    });

export const updateOrderStatus = (id: string, status: OrderStatus, trackingNumber?: string) =>
    fetchClient<Order>(`/api/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, trackingNumber }),
    });

export const cancelOrder = (id: string) =>
    fetchClient<null>(`/api/orders/${id}`, { method: "DELETE" });