import { PaginationParams } from "@/shared/types";

export type DiscountType = "PERCENT" | "FIXED";

export type Product = {
    id: string;
    title: string;
    description: string;
    rating: number;
    ratings: number;
    stock: number;
    price: number;
    discountType?: DiscountType;
    discountValue?: number;
    cover: string;
    gallery: string[];
    categoryId: string;
    subCategoryId?: string;
    createdAt: string;
    updatedAt: string;
};

export type ProductsParams = PaginationParams & {
    categoryId?: string;
    subCategoryId?: string;
    occasionId?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sortBy?: "price" | "rating" | "createdAt";
    sortOrder?: "asc" | "desc";
};

export type CreateProductInput = {
    title: string;
    description: string;
    stock: number;
    price: number;
    discountType?: DiscountType;
    discountValue?: number;
    cover: string;
    gallery?: string[];
    categoryId: string;
    subCategoryId?: string;
    occasionIds?: string[];
};

export type UpdateProductInput = Partial<CreateProductInput>;