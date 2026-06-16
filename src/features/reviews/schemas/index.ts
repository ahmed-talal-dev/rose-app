import { z } from "zod";
import { paginationSchema } from "@/shared/schemas/shared.schema";

export const reviewParamsSchema = paginationSchema.extend({
    productId: z.string().optional(),
    userId: z.string().optional(),
});

export const createReviewSchema = z.object({
    productId: z.string().min(1, "Invalid product ID"),
    rating: z
        .number()
        .int("Rating must be a whole number")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot exceed 5"),
    comment: z
        .string()
        .max(1000, "Comment cannot exceed 1000 characters")
        .optional(),
});

export const updateReviewSchema = z.object({
    rating: z
        .number()
        .int("Rating must be a whole number")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot exceed 5")
        .optional(),
    comment: z
        .string()
        .max(1000, "Comment cannot exceed 1000 characters")
        .optional(),
});

export type ReviewParamsSchema = z.infer<typeof reviewParamsSchema>;
export type CreateReviewSchema = z.infer<typeof createReviewSchema>;
export type UpdateReviewSchema = z.infer<typeof updateReviewSchema>;
