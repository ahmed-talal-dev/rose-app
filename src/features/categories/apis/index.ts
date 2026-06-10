import { fetchClient } from "@/shared/lib/apis/fetch.client";
import { PaginatedPayload } from "@/shared/types";
import { Category, CategoriesParams, CreateCategoryInput, UpdateCategoryInput } from "../types";

export const getCategories = (params?: CategoriesParams) =>
    fetchClient<PaginatedPayload<Category>>("/api/categories", { params });

export const getCategory = (id: string) =>
    fetchClient<Category>(`/api/categories/${id}`);

export const createCategory = (body: CreateCategoryInput) =>
    fetchClient<Category>("/api/categories", {
        method: "POST",
        body: JSON.stringify(body),
    });

export const updateCategory = (id: string, body: UpdateCategoryInput) =>
    fetchClient<Category>(`/api/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
    });

export const deleteCategory = (id: string) =>
    fetchClient<null>(`/api/categories/${id}`, { method: "DELETE" });