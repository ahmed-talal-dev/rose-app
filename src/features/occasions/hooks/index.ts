import { useQuery } from "@tanstack/react-query";
import { getOccasions, getOccasion } from "../apis";
import { OccasionsParams } from "../types";

export const useOccasions = (params?: OccasionsParams) =>
    useQuery({
        queryKey: ["occasions", params],
        queryFn: () => getOccasions(params),
    });

export const useOccasion = (id: string) =>
    useQuery({
        queryKey: ["occasions", id],
        queryFn: () => getOccasion(id),
        enabled: !!id,
    });