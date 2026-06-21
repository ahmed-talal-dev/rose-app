import { useState } from "react";
import { Address } from "@/features/addresses/types";

const STORAGE_KEY = "checkout_selected_address";

export function useSelectedAddress(addresses: Address[]) {
  const [selectedId, setSelectedId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(STORAGE_KEY) ?? "";
  });

  const effectiveId =
    selectedId && addresses.find((a) => a.id === selectedId)
      ? selectedId
      : addresses.find((a) => a.isPrimary)?.id ?? addresses[0]?.id ?? "";

  const selectAddress = (id: string) => {
    setSelectedId(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  return { selectedAddressId: effectiveId, selectAddress };
}
