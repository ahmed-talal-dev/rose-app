import { fetchClient } from "@/shared/lib/apis/fetch.client";
import { PaginatedPayload } from "@/shared/types";
import { Product, ProductsParams, CreateProductInput, UpdateProductInput } from "../types";

export const getProducts = (params?: ProductsParams) =>
    fetchClient<PaginatedPayload<Product>>("/api/products", { params });

export const getProduct = (id: string) =>
    fetchClient<Product>(`/api/products/${id}`);

export const createProduct = (body: CreateProductInput) =>
    fetchClient<Product>("/api/products", {
        method: "POST",
        body: JSON.stringify(body),
    });

export const updateProduct = (id: string, body: UpdateProductInput) =>
    fetchClient<Product>(`/api/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
    });

export const deleteProduct = (id: string) =>
    fetchClient<null>(`/api/products/${id}`, { method: "DELETE" });