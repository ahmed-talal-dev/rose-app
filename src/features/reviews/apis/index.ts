import { fetchClient } from "@/shared/lib/apis/fetch.client";
import { PaginatedPayload } from "@/shared/types";
import { Review, ReviewsParams, CreateReviewInput, UpdateReviewInput } from "../types";

export const getReviews = (params?: ReviewsParams) =>
    fetchClient<PaginatedPayload<Review>>("/api/reviews", { params });

export const getReview = (id: string) =>
    fetchClient<Review>(`/api/reviews/${id}`);

export const createReview = (body: CreateReviewInput) =>
    fetchClient<Review>("/api/reviews", {
        method: "POST",
        body: JSON.stringify(body),
    });

export const updateReview = (id: string, body: UpdateReviewInput) =>
    fetchClient<Review>(`/api/reviews/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
    });

export const deleteReview = (id: string) =>
    fetchClient<null>(`/api/reviews/${id}`, { method: "DELETE" });