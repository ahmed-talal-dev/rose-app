import { fetchClient } from "@/shared/lib/apis/fetch.client";
import { PaginatedPayload } from "@/shared/types";
import { Occasion, OccasionsParams } from "../types";

export const getOccasions = (params?: OccasionsParams) =>
    fetchClient<PaginatedPayload<Occasion>>("/api/occasions", {
        params: params as Record<string, string | number | boolean | undefined>,
    });

export const getOccasion = (id: string) =>
    fetchClient<Occasion>(`/api/occasions/${id}`);