import { fetchClient } from "@/shared/lib/apis/fetch.client";
import { CartData, AddToCartInput, UpdateCartInput } from "../types";

/** GET /api/cart — Retrieve user's cart */
export const getCart = async (): Promise<CartData> => {
    return fetchClient<CartData>("/api/cart");
};

/** POST /api/cart — Add a product to the cart */
export const addToCart = async (body: AddToCartInput): Promise<CartData> => {
    return fetchClient<CartData>("/api/cart", {
        method: "POST",
        body: JSON.stringify(body),
    });
};

/** PATCH /api/cart/:id — Update cart item quantity */
export const updateCartItem = async ({
    id,
    body,
}: {
    id: string;
    body: UpdateCartInput;
}): Promise<CartData> => {
    return fetchClient<CartData>(`/api/cart/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
    });
};

/** DELETE /api/cart/:id — Remove a single product from the cart */
export const removeCartItem = async (id: string): Promise<void> => {
    await fetchClient(`/api/cart/${id}`, { method: "DELETE" });
};

/** DELETE /api/cart — Clear all products from the cart */
export const clearCart = async (): Promise<void> => {
    await fetchClient("/api/cart", { method: "DELETE" });
};