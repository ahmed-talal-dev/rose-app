import { z } from "zod";
import { paginationSchema } from "@/shared/schemas/shared.schema";

export const orderParamsSchema = paginationSchema.extend({
    status: z
        .enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"])
        .optional(),
});

export const createOrderSchema = z.object({
    addressId: z.string().uuid("Invalid address ID"),
    paymentMethod: z.enum(["CASH_ON_DELIVERY", "CREDIT_CARD"]),
    couponCode: z
        .string()
        .min(3, "Coupon code must be at least 3 characters")
        .optional(),
    notes: z
        .string()
        .max(500, "Notes cannot exceed 500 characters")
        .optional(),
});

export const updateOrderStatusSchema = z.object({
    status: z.enum([
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "REFUNDED",
    ]),
    trackingNumber: z.string().optional(),
});

export type OrderParamsSchema = z.infer<typeof orderParamsSchema>;
export type CreateOrderSchema = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusSchema = z.infer<typeof updateOrderStatusSchema>;
