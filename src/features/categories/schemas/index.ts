import { z } from "zod";
import { paginationSchema } from "@/shared/schemas/shared.schema";

export const categoryParamsSchema = paginationSchema;

export const createCategorySchema = z.object({
    title: z
        .string()
        .min(2, "Title must be at least 2 characters")
        .max(100, "Title must be at most 100 characters"),
    description: z
        .string()
        .max(500, "Description must be at most 500 characters")
        .optional(),
    image: z.string().url("Image must be a valid URL").optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CategoryParamsSchema = z.infer<typeof categoryParamsSchema>;
export type CreateCategorySchema = z.infer<typeof createCategorySchema>;
export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>;
