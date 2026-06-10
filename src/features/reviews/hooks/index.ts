import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReviews, getReview, createReview, updateReview, deleteReview } from "../apis";
import { ReviewsParams, CreateReviewInput, UpdateReviewInput } from "../types";

export const useReviews = (params?: ReviewsParams) =>
    useQuery({
        queryKey: ["reviews", params],
        queryFn: () => getReviews(params),
    });

export const useCreateReview = (productId?: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateReviewInput) => createReview(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
            if (productId) {
                queryClient.invalidateQueries({ queryKey: ["products", productId] });
            }
        },
    });
};

export const useUpdateReview = (id: string, productId?: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: UpdateReviewInput) => updateReview(id, body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
            if (productId) {
                queryClient.invalidateQueries({ queryKey: ["products", productId] });
            }
        },
    });
};

export const useDeleteReview = (productId?: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteReview(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
            if (productId) {
                queryClient.invalidateQueries({ queryKey: ["products", productId] });
            }
        },
    });
};
