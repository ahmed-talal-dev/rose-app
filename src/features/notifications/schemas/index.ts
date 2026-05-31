import { z } from "zod";

export const updateProfileSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be at most 30 characters")
        .optional(),
    firstName: z.string().min(1, "First name is required").optional(),
    lastName: z.string().min(1, "Last name is required").optional(),
    phone: z
        .string()
        .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number format")
        .optional(),
    gender: z.enum(["MALE", "FEMALE"]).optional(),
    photo: z.string().url("Photo must be a valid URL").optional(),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
