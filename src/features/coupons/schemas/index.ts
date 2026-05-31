import { z } from "zod";
import { paginationSchema } from "@/shared/schemas/shared.schema";

export const couponParamsSchema = paginationSchema;

export const applyCouponSchema = z.object({
    code: z
        .string()
        .min(3, "Coupon code must be at least 3 characters")
        .max(50, "Coupon code must be at most 50 characters")
        .toUpperCase(),
});

export const createCouponSchema = z.object({
    code: z
        .string()
        .min(3, "Code must be at least 3 characters")
        .max(50, "Code must be at most 50 characters")
        .toUpperCase(),
    type: z.enum(["PERCENT", "FIXED"]),
    value: z.number().min(0.01, "Value must be greater than 0"),
    minPurchase: z.number().min(0).optional(),
    maxDiscount: z.number().min(0).optional(),
    usageLimit: z.number().int().min(1).optional(),
    validFrom: z.string().datetime("Invalid date format"),
    validUntil: z.string().datetime("Invalid date format"),
    isActive: z.boolean().optional().default(true),
}).refine((data) => {
    if (data.type === "PERCENT") return data.value <= 100;
    return true;
}, {
    message: "Percentage discount cannot exceed 100%",
    path: ["value"],
}).refine((data) => {
    return new Date(data.validUntil) > new Date(data.validFrom);
}, {
    message: "End date must be after start date",
    path: ["validUntil"],
});

export const updateCouponSchema = createCouponSchema.partial();

export type CouponParamsSchema = z.infer<typeof couponParamsSchema>;
export type ApplyCouponSchema = z.infer<typeof applyCouponSchema>;
export type CreateCouponSchema = z.infer<typeof createCouponSchema>;
export type UpdateCouponSchema = z.infer<typeof updateCouponSchema>;
