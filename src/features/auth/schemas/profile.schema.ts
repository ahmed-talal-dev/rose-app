import { z } from "zod";

export const updateProfileSchema = z.object({
    firstName: z.string().min(1, "First name is required").optional(),
    lastName: z.string().min(1, "Last name is required").optional(),
    phone: z
        .string()
        .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number format")
        .optional(),
    gender: z.enum(["MALE", "FEMALE"]).optional(),
    photo: z.string().optional(),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;