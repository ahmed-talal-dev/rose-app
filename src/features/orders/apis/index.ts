import { fetchClient } from "@/shared/lib/apis/fetch.client";
import { Address } from "@/features/addresses/types";
import { PaginatedPayload } from "@/shared/types";
import { Order, OrdersParams, CreateOrderInput, OrderStatus } from "../types";

export const getOrders = (params?: OrdersParams) =>
    fetchClient<PaginatedPayload<Order>>("/api/orders", { params });

export const getOrder = (id: string) =>
    fetchClient<Order>(`/api/orders/${id}`);

export const createOrder = async (body: CreateOrderInput) => {
    const { addressId, paymentMethod, ...rest } = body;

    const addresses = await fetchClient<Address[]>("/api/addresses");
    const address = addresses.find((a) => a.id === addressId);
    if (!address) {
        throw new Error("Selected address not found");
    }

    const shippingAddress = {
        street: address.street,
        phone: address.phone,
        city: address.city,
        lat: String(address.latitude ?? "0"),
        long: String(address.longitude ?? "0"),
    };

    const isCard = paymentMethod === "CREDIT_CARD";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const endpoint = isCard
        ? `/api/orders/checkout?url=${encodeURIComponent(appUrl)}`
        : "/api/orders";

    return fetchClient<Order>(endpoint, {
        method: "POST",
        body: JSON.stringify({ shippingAddress, ...rest }),
    });
};

export const updateOrderStatus = (id: string, status: OrderStatus, trackingNumber?: string) =>
    fetchClient<Order>(`/api/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, trackingNumber }),
    });

export const cancelOrder = (id: string) =>
    fetchClient<null>(`/api/orders/${id}`, { method: "DELETE" });