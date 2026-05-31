import { z } from "zod";
import { paginationSchema } from "@/shared/schemas/shared.schema";

export const productParamsSchema = paginationSchema.extend({
    categoryId: z.string().uuid().optional(),
    subCategoryId: z.string().uuid().optional(),
    occasionId: z.string().uuid().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    search: z.string().optional(),
    sortBy: z.enum(["price", "rating", "createdAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const createProductSchema = z.object({
    title: z
        .string()
        .min(3, "Title must be at least 3 characters")
        .max(200, "Title must be at most 200 characters"),
    description: z
        .string()
        .min(10, "Description must be at least 10 characters"),
    stock: z
        .number()
        .int("Stock must be a whole number")
        .min(0, "Stock cannot be negative"),
    price: z
        .number()
        .min(0.01, "Price must be greater than 0"),
    discountType: z.enum(["PERCENT", "FIXED"]).optional(),
    discountValue: z
        .number()
        .min(0, "Discount value cannot be negative")
        .optional(),
    cover: z.string().url("Cover must be a valid URL"),
    gallery: z.array(z.string().url()).optional(),
    categoryId: z.string().uuid("Invalid category ID"),
    subCategoryId: z.string().uuid().optional(),
    occasionIds: z.array(z.string().uuid()).optional(),
}).refine((data) => {
    if (data.discountType === "PERCENT" && data.discountValue !== undefined) {
        return data.discountValue <= 100;
    }
    return true;
}, {
    message: "Percentage discount cannot exceed 100%",
    path: ["discountValue"],
});

export const updateProductSchema = createProductSchema.partial();

export type ProductParamsSchema = z.infer<typeof productParamsSchema>;
export type CreateProductSchema = z.infer<typeof createProductSchema>;
export type UpdateProductSchema = z.infer<typeof updateProductSchema>;
