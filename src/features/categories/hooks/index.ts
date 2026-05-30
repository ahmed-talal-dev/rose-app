import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories, getCategory, createCategory, updateCategory, deleteCategory } from "../apis";
import { CategoriesParams, CreateCategoryInput, UpdateCategoryInput } from "../types";

export const useCategories = (params?: CategoriesParams) =>
    useQuery({
        queryKey: ["categories", params],
        queryFn: () => getCategories(params),
    });

export const useCategory = (id: string) =>
    useQuery({
        queryKey: ["categories", id],
        queryFn: () => getCategory(id),
        enabled: !!id,
    });

export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateCategoryInput) => createCategory(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });
};

export const useUpdateCategory = (id: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: UpdateCategoryInput) => updateCategory(id, body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });
};