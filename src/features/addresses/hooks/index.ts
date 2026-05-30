import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAddresses, getAddress, createAddress, updateAddress, deleteAddress } from "../apis";
import { CreateAddressInput, UpdateAddressInput } from "../types";

export const useAddresses = () =>
    useQuery({
        queryKey: ["addresses"],
        queryFn: getAddresses,
    });

export const useAddress = (id: string) =>
    useQuery({
        queryKey: ["addresses", id],
        queryFn: () => getAddress(id),
        enabled: !!id,
    });

export const useCreateAddress = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateAddressInput) => createAddress(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
        },
    });
};

export const useUpdateAddress = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, body }: { id: string; body: UpdateAddressInput }) =>
            updateAddress(id, body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
        },
    });
};

export const useDeleteAddress = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteAddress(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
        },
    });
};