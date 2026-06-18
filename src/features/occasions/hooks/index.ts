import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOccasions, getOccasion, createOccasion, updateOccasion, deleteOccasion } from "../apis";
import { OccasionsParams, CreateOccasionInput, UpdateOccasionInput } from "../types";

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

export const useCreateOccasion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateOccasionInput) => createOccasion(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["occasions"] });
        },
    });
};

export const useUpdateOccasion = (id: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: UpdateOccasionInput) => updateOccasion(id, body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["occasions"] });
        },
    });
};

export const useDeleteOccasion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteOccasion(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["occasions"] });
        },
    });
};