import { PaginationParams } from "@/shared/types";

export type Category = {
    id: string;
    title: string;
    description?: string;
    image?: string;
    createdAt: string;
    updatedAt: string;
};

export type CategoriesParams = PaginationParams;

export type CreateCategoryInput = {
    title: string;
    description?: string;
    image?: string;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;