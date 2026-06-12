import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addToCart, clearCart, getCart, removeCartItem, updateCartItem } from "../apis";


// ─── Query Keys ──────────────────────────────────────────────────────────────

export const cartKeys = {
    all: ["cart"] as const,
};

// ─── Hooks ───────────────────────────────────────────────────────────────────

/** جلب السلة */
export const useCart = (options?: { enabled?: boolean }) =>
    useQuery({
        queryKey: cartKeys.all,
        queryFn: getCart,
        enabled: options?.enabled ?? true,
    });

/** إضافة منتج للسلة */
export const useAddToCart = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addToCart,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
};

/** تعديل كمية منتج */
export const useUpdateCartItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateCartItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
};

/** إزالة منتج من السلة */
export const useRemoveCartItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: removeCartItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
};

/** تفريغ السلة كاملة */
export const useClearCart = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: clearCart,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
};