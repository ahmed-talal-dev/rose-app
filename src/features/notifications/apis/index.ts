import { fetchClient } from "@/shared/lib/apis/fetch.client";
import { PaginatedPayload } from "@/shared/types";
import { Notification, NotificationsParams } from "../types";

export const getNotifications = (params?: NotificationsParams) =>
    fetchClient<PaginatedPayload<Notification>>("/api/notifications", { params });

export const markAsRead = (id: string) =>
    fetchClient<Notification>(`/api/notifications/${id}/read`, { method: "PATCH" });

export const markAllAsRead = () =>
    fetchClient<null>("/api/notifications/read-all", { method: "PATCH" });

export const deleteNotification = (id: string) =>
    fetchClient<null>(`/api/notifications/${id}`, { method: "DELETE" });