import { z } from "zod";
import { paginationSchema } from "@/shared/schemas/shared.schema";

export const notificationParamsSchema = paginationSchema;

export type NotificationParamsSchema = z.infer<typeof notificationParamsSchema>;