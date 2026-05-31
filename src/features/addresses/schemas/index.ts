import { z } from "zod";

export const createAddressSchema = z.object({
    title: z
        .string()
        .min(2, "Title must be at least 2 characters")
        .max(100, "Title must be at most 100 characters"),
    isPrimary: z.boolean().optional().default(false),
    city: z
        .string()
        .min(2, "City must be at least 2 characters")
        .max(100, "City must be at most 100 characters"),
    street: z
        .string()
        .min(5, "Street must be at least 5 characters")
        .max(200, "Street must be at most 200 characters"),
    phone: z
        .string()
        .min(10, "Phone number must be at least 10 digits")
        .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number format"),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
});

export const updateAddressSchema = createAddressSchema.partial();

export type CreateAddressSchema = z.infer<typeof createAddressSchema>;
export type UpdateAddressSchema = z.infer<typeof updateAddressSchema>;
