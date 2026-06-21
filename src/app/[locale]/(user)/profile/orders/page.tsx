"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useOrders } from "@/features/orders/hooks";
import { useProducts } from "@/features/products/hooks";
import { useSession } from "next-auth/react";
import {
    Loader2,
    Wallet,
    CreditCard,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronDown,
    ChevronUp,
    Star,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { resolveImageUrl } from "@/shared/lib/utils/resolve-image-url";
import type { Order, OrderItem } from "@/features/orders/types";

export default function OrdersPage() {
    const locale = useLocale();
    const router = useRouter();
    const t = useTranslations("orders");
    const tCommon = useTranslations("common");
    const { status } = useSession();

    const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

    const { data: ordersData, isLoading: isOrdersLoading } = useOrders();
    const { data: productsData } = useProducts({ limit: 100 });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading" || isOrdersLoading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
                <span className="text-zinc-500 dark:text-zinc-400 font-sarabun text-sm">
                    {tCommon("loading")}
                </span>
            </div>
        );
    }

    const allProducts = (productsData?.data || []) as (import("@/features/products/types").Product & {
        imgCover?: string;
        rateAvg?: number;
        rateCount?: number;
    })[];

    // Format createdAt date to match mockup exactly
    const formatOrderDate = (dateStr: string) => {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;

        const day = date.getDate();
        const month = date.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", { month: "long" });
        const year = date.getFullYear();

        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;

        const formattedAmPm = locale === "ar" ? (ampm === "AM" ? "ص" : "م") : ampm;
        return t("orderDateFormat", {
            day: String(day),
            month,
            year: String(year),
            hours: String(hours),
            minutes,
            ampm: formattedAmPm
        });
    };

    const toggleOrderItems = (orderId: string) => {
        setExpandedOrders((prev) => ({
            ...prev,
            [orderId]: !prev[orderId],
        }));
    };

    const orders: Order[] = ordersData?.data ?? [];

    return (
        <div className="flex flex-col items-center p-0 gap-9 w-full max-w-4xl mx-auto mt-10 mb-16 text-start px-4 lg:px-0">
            <h1 className="font-sarabun font-bold text-5xl leading-none text-zinc-800 dark:text-zinc-100 w-full m-0">
                {t("title")}
            </h1>

            <div className="flex flex-col gap-9 w-full">
                {orders.length === 0 ? (
                    <div className="box-border flex flex-col items-center justify-center p-5 w-full min-h-72 border border-zinc-200 dark:border-zinc-800 rounded-xl shrink-0 gap-6">
                        <p className="text-zinc-400 font-medium font-sarabun text-lg">
                            {t("noOrders")}
                        </p>
                    </div>
                ) : (
                    orders.map((order: Order) => {
                        const isExpanded = !!expandedOrders[order.id];
                        const displayItems = order.items || [];
                        const hasMoreThanTwo = displayItems.length > 2;

                        // Payment Status Badges
                        const showPaidBadge = order.paymentStatus === "SUCCEEDED" || order.paymentStatus === "PAID";

                        // Status Mapping
                        let statusColor = "bg-blue-600"; // Blue - In Progress
                        let statusText = t("statusInProgress");
                        const currentStatus = order.status as string;
                        if (currentStatus === "DELIVERED" || currentStatus === "Done") {
                            statusColor = "bg-green-500"; // Green - Done
                            statusText = t("statusDone");
                        } else if (currentStatus === "CANCELLED" || currentStatus === "Canceled" || currentStatus === "REFUNDED") {
                            statusColor = "bg-red-500"; // Red - Canceled
                            statusText = t("statusCanceled");
                        }

                        // Payment Method details
                        const isCard = order.paymentMethod === "CREDIT_CARD";
                        const paymentMethodText = isCard ? t("creditCard") : t("cash");

                        // Delivery Status Details
                        let deliveryIcon = <Clock className="w-5 h-5 text-amber-600 shrink-0" />;
                        let deliveryText = t("pending");
                        let deliveryColorClass = "text-amber-600 dark:text-amber-500";

                        if (currentStatus === "DELIVERED" || currentStatus === "Done") {
                            deliveryIcon = <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />;
                            deliveryText = t("delivered");
                            deliveryColorClass = "text-green-600 dark:text-green-500";
                        } else if (currentStatus === "CANCELLED" || currentStatus === "Canceled") {
                            deliveryIcon = <XCircle className="w-5 h-5 text-red-600 shrink-0" />;
                            deliveryText = t("statusCanceled");
                            deliveryColorClass = "text-red-600 dark:text-red-500";
                        }

                        return (
                            <div
                                key={order.id}
                                className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 overflow-hidden flex flex-col font-sarabun text-start shadow-sm"
                            >
                                {/* Order Card Header */}
                                <div className="bg-primary-600 px-5 py-3 flex flex-row justify-between items-center text-white">
                                    <span className="font-bold text-lg">
                                        {t("orderNumber", { id: order.id })}
                                    </span>
                                    <span className="text-sm font-medium opacity-90">
                                        {t("createdIn")} <strong className="font-semibold">{formatOrderDate(order.createdAt)}</strong>
                                    </span>
                                </div>

                                {/* Order Card Body */}
                                <div className="p-5 flex flex-col gap-4">
                                    {/* Total Price and Status */}
                                    <div className="flex flex-row justify-between items-center w-full">
                                        <div className="flex flex-row items-center gap-2.5">
                                            <span className="text-lg font-medium text-zinc-500 dark:text-zinc-400">
                                                {t("totalPrice")}
                                            </span>
                                            <span className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
                                                {(order.total ?? 0).toLocaleString()} {tCommon("currency")}
                                            </span>
                                            {showPaidBadge && (
                                                <span className="bg-green-500 text-white font-bold text-xs px-2.5 py-0.5 rounded-full flex items-center justify-center gap-1">
                                                    ✓ {t("paymentStatusPaid")}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-row items-center gap-2">
                                            <span className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                                                {t("status")}
                                            </span>
                                            <span className={`${statusColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                                                {statusText}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Payment Method and Delivery Status */}
                                    <div className="flex flex-col gap-2.5 text-sm text-zinc-700 dark:text-zinc-300 font-medium pb-2 border-b border-zinc-100 dark:border-zinc-800">
                                        <div className="flex items-center gap-2">
                                            <span className="text-zinc-400 dark:text-zinc-500 font-bold min-w-28">
                                                {t("paymentMethod")}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200">
                                                {isCard ? (
                                                    <CreditCard className="w-5 h-5 text-zinc-500 shrink-0" strokeWidth={1.5} />
                                                ) : (
                                                    <Wallet className="w-5 h-5 text-zinc-500 shrink-0" strokeWidth={1.5} />
                                                )}
                                                <span>{paymentMethodText}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-zinc-400 dark:text-zinc-500 font-bold min-w-28">
                                                {t("deliveryStatus")}
                                            </span>
                                            <div className={`flex items-center gap-1.5 font-semibold ${deliveryColorClass}`}>
                                                {deliveryIcon}
                                                <span>{deliveryText}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="flex flex-col gap-2 w-full">
                                        <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                                            {t("orderItems")}
                                        </span>

                                        <div className="relative w-full">
                                            {/* Products Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-2">
                                                {displayItems.map((item: OrderItem, idx: number) => {
                                                    const realProduct = allProducts.find(
                                                        (p) => p.id === item.productId
                                                    );
                                                    const title = item.product?.title ?? realProduct?.title ?? "";
                                                    const imgUrl = item.product?.image ?? realProduct?.imgCover ?? "";
                                                    const rating = item.product?.rating ?? realProduct?.rateAvg ?? 0;
                                                    const count = item.product?.reviewsCount ?? realProduct?.rateCount ?? 0;

                                                    // Fading effect for collapsed state beyond first 2 items
                                                    const isFaded = hasMoreThanTwo && !isExpanded && idx >= 2;

                                                    return (
                                                        <div
                                                            key={item.id}
                                                            className={`box-border flex flex-row items-center p-3 gap-4 w-full bg-zinc-50 dark:bg-zinc-800/40 rounded-lg border border-zinc-100 dark:border-zinc-800 transition-all duration-300 ${
                                                                isFaded ? "opacity-[0.15] dark:opacity-[0.08] blur-[0.5px] pointer-events-none select-none" : "opacity-100"
                                                            }`}
                                                        >
                                                            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white shrink-0 border border-zinc-100 dark:border-zinc-800">
                                                                <Image
                                                                    src={resolveImageUrl(imgUrl)}
                                                                    alt={title}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex flex-col items-start gap-1 min-w-0">
                                                                <span className="font-bold text-base leading-[1.2] text-primary-600 dark:text-rose-400 truncate w-full text-start">
                                                                    {title}
                                                                </span>
                                                                <div className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                                                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                                    <span>
                                                                        {t("ratingLabel", { rating })}
                                                                    </span>
                                                                    <span className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                                                                        {t("ratingsCount", { count })}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-baseline gap-1.5 mt-0.5">
                                                                    <span className="text-sm text-zinc-400 dark:text-zinc-500">
                                                                        (x{item.quantity})
                                                                    </span>
                                                                    <span className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                                                                        {(item.price ?? 0).toLocaleString()} {tCommon("currency")}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Show All / Show Less Button Overlay */}
                                            {hasMoreThanTwo && (
                                                <div
                                                    className={`absolute left-0 right-0 bottom-0 flex items-end justify-center pointer-events-none transition-all duration-300 ${
                                                        isExpanded
                                                            ? "relative h-12 mt-4"
                                                            : "h-24 bg-linear-to-t from-white dark:from-zinc-900 via-white/80 dark:via-zinc-900/80 to-transparent"
                                                    }`}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleOrderItems(order.id)}
                                                        className="flex flex-row justify-center items-center gap-1.5 px-4 py-2 h-9 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-md pointer-events-auto cursor-pointer outline-none mb-1 text-xs font-semibold text-primary-600 dark:text-rose-400"
                                                    >
                                                        {isExpanded ? (
                                                            <>
                                                                <span>{t("showLess")}</span>
                                                                <ChevronUp className="w-4 h-4" />
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span>{t("showAll")}</span>
                                                                <ChevronDown className="w-4 h-4" />
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
