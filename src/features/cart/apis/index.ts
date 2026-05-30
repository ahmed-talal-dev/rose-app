import { fetchClient } from "@/shared/lib/apis/fetch";
import { Cart, AddToCartInput, UpdateCartInput } from "../types";

export const getCart = () =>
    fetchClient<Cart>("/api/cart");

export const addToCart = (body: AddToCartInput) =>
    fetchClient<Cart>("/api/cart", {
        method: "POST",
        body: JSON.stringify(body),
    });

export const updateCartItem = (id: string, body: UpdateCartInput) =>
    fetchClient<Cart>(`/api/cart/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
    });

export const removeCartItem = (id: string) =>
    fetchClient<null>(`/api/cart/${id}`, { method: "DELETE" });

export const clearCart = () =>
    fetchClient<null>("/api/cart", { method: "DELETE" });