"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ArrowRight, Loader2 } from "lucide-react";

interface PaymentStepProps {
    paymentMethod: "CASH_ON_DELIVERY" | "CREDIT_CARD";
    onSelectPaymentMethod: (method: "CASH_ON_DELIVERY" | "CREDIT_CARD") => void;
    onBackStep: () => void;
    onFinalizeCheckout: () => void;
    isPending: boolean;
}

export function PaymentStep({
    paymentMethod,
    onSelectPaymentMethod,
    onBackStep,
    onFinalizeCheckout,
    isPending,
}: PaymentStepProps) {
    const t = useTranslations("checkout");

    return (
        <div className="flex w-full flex-col gap-6">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={onBackStep}
                    className="flex cursor-pointer items-center gap-1 rounded-xl border-none bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                    <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                    <span>{t("back")}</span>
                </button>
                <h2 className="font-sarabun text-3xl font-bold leading-none text-[#000000] dark:text-zinc-100">
                    {t("paymentMethod")}
                </h2>
            </div>

            <div className="mt-2 grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                <button
                    type="button"
                    onClick={() => onSelectPaymentMethod("CASH_ON_DELIVERY")}
                    className={`flex cursor-pointer flex-col items-center rounded-2xl border bg-white p-6 text-center transition-all dark:bg-zinc-900 ${
                        paymentMethod === "CASH_ON_DELIVERY"
                            ? "border-primary-600 ring-1 ring-primary-600"
                            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                >
                    <img
                        src="/icons/cash.svg"
                        alt="Cash on Delivery"
                        className="h-[60px] w-20 object-contain"
                    />
                    <h3 className="mt-4 font-sarabun text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {t("cashOnDelivery")}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                        {t("cashOnDeliveryDesc")}
                    </p>
                </button>

                <button
                    type="button"
                    onClick={() => onSelectPaymentMethod("CREDIT_CARD")}
                    className={`flex cursor-pointer flex-col items-center rounded-2xl border bg-white p-6 text-center transition-all dark:bg-zinc-900 ${
                        paymentMethod === "CREDIT_CARD"
                            ? "border-primary-600 ring-1 ring-primary-600"
                            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                >
                    <img
                        src="/icons/credit.svg"
                        alt="Credit Card"
                        className="h-[60px] w-20 object-contain"
                    />
                    <h3 className="mt-4 font-sarabun text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {t("creditCard")}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                        {t("creditCardDesc")}
                    </p>
                </button>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    type="button"
                    onClick={onFinalizeCheckout}
                    disabled={isPending}
                    className="flex h-10 w-[152px] cursor-pointer flex-row justify-center items-center gap-2.5 rounded-lg border-none bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <>
                            <span className="font-mulish text-sm font-semibold leading-relaxed">
                                {t("checkout")}
                            </span>
                            <ArrowRight className="h-5 w-5 rtl:rotate-180" strokeWidth={1.5} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
