import { z } from "zod";

export const addToCartSchema = z.object({
    productId: z.string().uuid("Invalid product ID"),
    quantity: z
        .number()
        .int("Quantity must be a whole number")
        .min(1, "Quantity must be at least 1")
        .optional()
        .default(1),
});

export const updateCartItemSchema = z.object({
    quantity: z
        .number()
        .int("Quantity must be a whole number")
        .min(1, "Quantity must be at least 1"),
});

export type AddToCartSchema = z.infer<typeof addToCartSchema>;
export type UpdateCartItemSchema = z.infer<typeof updateCartItemSchema>;
