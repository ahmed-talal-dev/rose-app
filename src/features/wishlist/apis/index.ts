import { fetchClient } from "@/shared/lib/apis/fetch";
import { Product } from "@/features/products/types";
import { PaginatedPayload } from "@/shared/types";

export const getWishlist = () =>
    fetchClient<PaginatedPayload<Product>>("/api/wishlist");

export const addToWishlist = (productId: string) =>
    fetchClient<null>("/api/wishlist", {
        method: "POST",
        body: JSON.stringify({ productId }),
    });

export const removeFromWishlist = (productId: string) =>
    fetchClient<null>(`/api/wishlist/${productId}`, { method: "DELETE" });