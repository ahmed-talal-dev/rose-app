"use client";

import { useTranslations } from "next-intl";
import { Ticket } from "lucide-react";

interface CheckoutSummaryProps {
    subtotal: number;
    discountAmount: number;
    total: number;
    couponCode: string;
    onCouponCodeChange: (code: string) => void;
    appliedCoupon: string | null;
    couponDiscount: number;
    onApplyCoupon: (e: React.FormEvent) => void;
}

export function CheckoutSummary({
    subtotal,
    discountAmount,
    total,
    couponCode,
    onCouponCodeChange,
    appliedCoupon,
    couponDiscount,
    onApplyCoupon,
}: CheckoutSummaryProps) {
    const t = useTranslations("checkout");
    const tCart = useTranslations("cart");
    const tCommon = useTranslations("common");

    return (
        <div className="flex w-full flex-col items-start gap-6 lg:w-[458px]">
            <h2 className="font-sarabun text-3xl font-semibold leading-none text-[#000000] dark:text-zinc-100">
                {tCart("summaryTitle")}
            </h2>

            <div className="flex w-full flex-col items-start gap-2.5 rounded-lg bg-[#FAFAFA] p-4 dark:bg-zinc-900 lg:w-[458px]">
                <form
                    onSubmit={onApplyCoupon}
                    className="flex h-12 w-full flex-row items-start gap-2.5 lg:w-[426px]"
                >
                    <div className="flex h-12 w-[257px] flex-col items-start gap-1.5">
                        <div className="flex h-12 w-full flex-row items-center gap-2 rounded-lg border border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
                            <input
                                type="text"
                                placeholder={tCart("couponPlaceholder")}
                                value={couponCode}
                                onChange={(e) => onCouponCodeChange(e.target.value)}
                                className="w-full bg-transparent font-inter text-sm font-normal text-zinc-800 placeholder-zinc-400 outline-none dark:text-zinc-100"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="flex h-12 w-[159px] cursor-pointer flex-row justify-center items-center gap-2.5 rounded-lg border-none bg-primary-600 transition-colors hover:bg-primary-700 outline-none"
                    >
                        <Ticket className="h-6 w-6 text-white" strokeWidth={1.5} />
                        <span className="font-mulish text-sm font-semibold leading-relaxed text-white whitespace-nowrap">
                            {tCart("applyCoupon")}
                        </span>
                    </button>
                </form>

                <div className="flex h-[260px] w-full flex-row justify-center items-center rounded-md border border-zinc-300 bg-transparent p-2.5 dark:border-zinc-700 lg:w-[426px]">
                    {appliedCoupon ? (
                        <span className="font-sarabun text-base font-semibold leading-relaxed text-primary-600 dark:text-rose-400">
                            {tCart("couponAppliedDisplay", {
                                code: appliedCoupon,
                                percent: (couponDiscount * 100).toFixed(0),
                            })}
                        </span>
                    ) : (
                        <span className="font-sarabun text-base font-normal italic text-zinc-400">
                            {tCart("noCoupons")}
                        </span>
                    )}
                </div>

                <div className="flex w-full flex-col justify-end items-start gap-4 p-2.5 lg:w-[426px]">
                    <div className="flex w-full flex-row justify-between items-center gap-2.5">
                        <span className="font-sarabun text-lg font-medium leading-none text-zinc-800 dark:text-zinc-300">
                            {tCart("subtotal")}
                        </span>
                        <span className="font-sarabun text-xl font-semibold leading-none text-zinc-800 dark:text-zinc-100">
                            {subtotal.toFixed(2)} {tCommon("currency")}
                        </span>
                    </div>

                    {appliedCoupon ? (
                        <div className="flex w-full flex-row items-center gap-2.5">
                            <div className="h-px flex-1 border-t border-zinc-300 dark:border-zinc-700" />
                            <span className="font-sarabun text-base font-semibold leading-none text-zinc-800 dark:text-zinc-300 whitespace-nowrap">
                                {t("discountDisplay", { percent: (couponDiscount * 100).toFixed(0) })}
                            </span>
                            <div className="h-px flex-1 border-t border-zinc-300 dark:border-zinc-700" />
                        </div>
                    ) : (
                        <div className="w-full h-px border-t border-zinc-300 dark:border-zinc-700" />
                    )}

                    <div className="flex w-full flex-row justify-between items-center gap-2.5">
                        <span className="font-sarabun text-2xl font-bold leading-none text-primary-600 dark:text-rose-400">
                            {tCart("total")}
                        </span>
                        <span className="font-sarabun text-2xl font-bold leading-none text-primary-600 dark:text-rose-400">
                            {total.toFixed(2)} {tCommon("currency")}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
