import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrders, getOrder, createOrder, updateOrderStatus, cancelOrder } from "../apis";
import { OrdersParams, CreateOrderInput, OrderStatus } from "../types";

export const useOrders = (params?: OrdersParams) =>
    useQuery({
        queryKey: ["orders", params],
        queryFn: () => getOrders(params),
    });

export const useOrder = (id: string) =>
    useQuery({
        queryKey: ["orders", id],
        queryFn: () => getOrder(id),
        enabled: !!id,
    });

export const useCreateOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateOrderInput) => createOrder(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
    });
};

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status, trackingNumber }: { id: string; status: OrderStatus; trackingNumber?: string }) =>
            updateOrderStatus(id, status, trackingNumber),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
    });
};

export const useCancelOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => cancelOrder(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
    });
};