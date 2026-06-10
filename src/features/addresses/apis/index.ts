import { fetchClient } from "@/shared/lib/apis/fetch.client";
import { Address, CreateAddressInput, UpdateAddressInput } from "../types";

export const getAddresses = () =>
    fetchClient<Address[]>("/api/addresses");

export const getAddress = (id: string) =>
    fetchClient<Address>(`/api/addresses/${id}`);

export const createAddress = (body: CreateAddressInput) =>
    fetchClient<Address>("/api/addresses", {
        method: "POST",
        body: JSON.stringify(body),
    });

export const updateAddress = (id: string, body: UpdateAddressInput) =>
    fetchClient<Address>(`/api/addresses/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
    });

export const deleteAddress = (id: string) =>
    fetchClient<null>(`/api/addresses/${id}`, { method: "DELETE" });