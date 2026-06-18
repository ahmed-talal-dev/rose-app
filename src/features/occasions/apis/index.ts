import { fetchClient } from "@/shared/lib/apis/fetch.client";
import { PaginatedPayload } from "@/shared/types";
import { Occasion, OccasionsParams, CreateOccasionInput, UpdateOccasionInput } from "../types";

export const getOccasions = (params?: OccasionsParams) =>
    fetchClient<PaginatedPayload<Occasion>>("/api/occasions", {
        params: params as Record<string, string | number | boolean | undefined>,
    });

export const getOccasion = (id: string) =>
    fetchClient<Occasion>(`/api/occasions/${id}`);

export const createOccasion = (body: CreateOccasionInput) =>
    fetchClient<Occasion>("/api/occasions", {
        method: "POST",
        body: JSON.stringify(body),
    });

export const updateOccasion = (id: string, body: UpdateOccasionInput) =>
    fetchClient<Occasion>(`/api/occasions/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
    });

export const deleteOccasion = (id: string) =>
    fetchClient<null>(`/api/occasions/${id}`, { method: "DELETE" });