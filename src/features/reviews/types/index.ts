import { PaginationParams } from "@/shared/types";

export type Review = {
    id: string;
    productId: string;
    userId: string;
    rating: number;
    comment?: string;
    createdAt: string;
    updatedAt: string;
};

export type ReviewsParams = PaginationParams & {
    productId?: string;
    userId?: string;
};

export type CreateReviewInput = {
    productId: string;
    rating: number;
    comment?: string;
};

export type UpdateReviewInput = {
    rating?: number;
    comment?: string;
};