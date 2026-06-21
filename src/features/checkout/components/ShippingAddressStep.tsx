"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, PhoneIcon } from "lucide-react";
import { Address } from "@/features/addresses/types";

interface ShippingAddressStepProps {
    addresses: Address[];
    selectedAddressId: string;
    onSelectAddress: (id: string) => void;
    onOpenAddressModal: () => void;
    onNextStep: () => void;
}

export function ShippingAddressStep({
    addresses,
    selectedAddressId,
    onSelectAddress,
    onOpenAddressModal,
    onNextStep,
}: ShippingAddressStepProps) {
    const t = useTranslations("checkout");

    return (
        <div className="flex w-full flex-col items-start gap-6 lg:w-[782px]">
            <h2 className="w-full font-sarabun text-3xl font-semibold leading-none text-[#000000] dark:text-zinc-100">
                {t("shippingAddress")}
            </h2>

            <div className="flex w-full flex-col items-end gap-3 rounded-xl lg:w-[782px]">
                {addresses.map((address) => {
                    const isSelected = selectedAddressId === address.id;
                    return (
                        <button
                            key={address.id}
                            type="button"
                            onClick={() => onSelectAddress(address.id)}
                            className={`flex min-h-[91px] w-full cursor-pointer flex-col items-start justify-center rounded-xl border p-4 text-start transition-all outline-none ${
                                isSelected
                                    ? "border-primary-600 bg-primary-600 text-white"
                                    : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900 hover:border-primary-600 dark:hover:border-primary-600"
                            }`}
                        >
                            <div className="flex min-h-[33px] w-full flex-row justify-between items-center gap-2.5 lg:w-[750px]">
                                <span className={`font-sarabun text-2xl font-semibold leading-none ${
                                    isSelected ? "text-zinc-50" : "text-zinc-800 dark:text-zinc-100"
                                }`}>
                                    {address.city}
                                </span>
                                <div className="flex flex-row items-center gap-1.5">
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                        isSelected ? "bg-zinc-50 text-primary-600" : "bg-primary-600 text-white"
                                    }`}>
                                        <PhoneIcon className="h-5 w-5" />
                                    </div>
                                    <span className={`font-sarabun text-lg font-medium leading-none ${
                                        isSelected ? "text-zinc-50" : "text-zinc-500 dark:text-zinc-400"
                                    }`}>
                                        {address.phone}
                                    </span>
                                </div>
                            </div>

                            <div className={`mt-1.5 flex h-6 flex-row items-center justify-center rounded-full px-3 py-1 ${
                                isSelected ? "bg-zinc-800 text-zinc-50 dark:bg-zinc-950" : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                            }`}>
                                <span className="max-w-[280px] overflow-hidden text-ellipsis whitespace-nowrap font-sarabun text-base font-medium leading-none sm:max-w-none">
                                    {address.street}, {address.city}
                                </span>
                            </div>
                        </button>
                    );
                })}

                <div className="flex h-9 w-full flex-row items-center gap-2.5 py-2">
                    <div className="flex-1 border-t border-zinc-100 dark:border-zinc-800" />
                    <span className="font-sarabun text-lg font-semibold leading-none text-zinc-500 dark:text-zinc-500">
                        {t("or") || "OR"}
                    </span>
                    <div className="flex-1 border-t border-zinc-100 dark:border-zinc-800" />
                </div>

                <button
                    type="button"
                    onClick={onOpenAddressModal}
                    className="flex h-11 w-full cursor-pointer flex-row justify-center items-center gap-2.5 rounded-lg border-none bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 outline-none transition-colors lg:w-[782px]"
                >
                    <span className="font-sarabun text-base font-medium leading-none text-primary-600">
                        {t("addAddress") || "Add a New Address"}
                    </span>
                </button>
            </div>

            <div className="flex w-full justify-end">
                <button
                    type="button"
                    onClick={onNextStep}
                    className="flex h-10 w-[152px] cursor-pointer flex-row justify-center items-center gap-2.5 rounded-lg border-none bg-primary-600 text-white hover:bg-primary-700 outline-none transition-colors"
                >
                    <span className="font-mulish text-sm font-semibold leading-relaxed">
                        {t("next") || "Next"}
                    </span>
                    <ArrowRight className="h-5 w-5 text-white rtl:rotate-180" strokeWidth={1.5} />
                </button>
            </div>
        </div>
    );
}
