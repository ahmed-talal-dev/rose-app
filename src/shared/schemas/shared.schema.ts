import { z } from "zod";

export const paginationSchema = z.object({
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(10),
});

export const idSchema = z.object({
    id: z.string().uuid("Invalid ID format"),
});

export type PaginationSchema = z.infer<typeof paginationSchema>;
export type IdSchema = z.infer<typeof idSchema>;