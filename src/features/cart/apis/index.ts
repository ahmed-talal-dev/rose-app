import { fetchClient } from "@/shared/lib/apis/fetch.client";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CartProduct {
    id: string;
    title: string;
    price: number;
    discountType: "PERCENT" | "FIXED" | null;
    discountValue: number | null;
    cover: string;
    stock: number;
    rating: number;
    ratings: number;
}

export interface CartItem {
    id: string;
    quantity: number;
    product: CartProduct;
}

export interface CartData {
    id: string;
    cartItems: CartItem[];
}

// ─── API Functions ───────────────────────────────────────────────────────────

/** GET /api/cart — جلب السلة */
export const getCart = async (): Promise<CartData> => {
    return fetchClient<CartData>("/api/cart");
};

/** POST /api/cart — إضافة منتج للسلة */
export const addToCart = async (body: {
    productId: string;
    quantity?: number;
}): Promise<CartData> => {
    return fetchClient<CartData>("/api/cart", {
        method: "POST",
        body: JSON.stringify(body),
    });
};

/** PATCH /api/cart/:id — تعديل كمية منتج */
export const updateCartItem = async ({
    id,
    body,
}: {
    id: string;
    body: { quantity: number };
}): Promise<CartData> => {
    return fetchClient<CartData>(`/api/cart/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
    });
};

/** DELETE /api/cart/:id — إزالة منتج واحد */
export const removeCartItem = async (id: string): Promise<void> => {
    await fetchClient(`/api/cart/${id}`, { method: "DELETE" });
};

/** DELETE /api/cart — تفريغ السلة كاملة */
export const clearCart = async (): Promise<void> => {
    await fetchClient("/api/cart", { method: "DELETE" });
};