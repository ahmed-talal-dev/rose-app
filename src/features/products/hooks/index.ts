import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from "../apis";
import { ProductsParams, CreateProductInput, UpdateProductInput } from "../types";

export const useProducts = (params?: ProductsParams) =>
    useQuery({
        queryKey: ["products", params],
        queryFn: () => getProducts(params),
    });

export const useProduct = (id: string) =>
    useQuery({
        queryKey: ["products", id],
        queryFn: () => getProduct(id),
        enabled: !!id,
    });

export const useCreateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateProductInput) => createProduct(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
};

export const useUpdateProduct = (id: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: UpdateProductInput) => updateProduct(id, body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
};