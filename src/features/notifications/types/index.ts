import { PaginationParams } from "@/shared/types";

export type Notification = {
    id: string;
    userId: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
};

export type NotificationsParams = PaginationParams;