"use client";

import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import {
    useCart,
    useUpdateCartItem,
    useRemoveCartItem,
    useClearCart,
} from "@/features/cart/hooks";
import { useProducts } from "@/features/products/hooks";
import { ProductCard } from "@/features/products/components/product-card";
import { useSession } from "next-auth/react";
import {
    ArrowLeft,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    TicketPercent,
    BrushCleaning,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { CartItemRow, getUnitPrice } from "@/features/cart/components/CartItemRow";
import { LoadingState, EmptyCart } from "@/features/cart/components/CartStates";

const COUPONS: Record<string, number> = {
    ROSE50: 0.5,
    ROSE20: 0.2,
};

export default function CartPage() {
    const router = useRouter();
    const t = useTranslations("cart");
    const tCommon = useTranslations("common");
    const { status } = useSession();

    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
    const [couponDiscount, setCouponDiscount] = useState(0);

    const recommendedSliderRef = useRef<HTMLDivElement>(null);

    const { data: cartData, isLoading: isCartLoading } = useCart();
    const { data: productsData } = useProducts({ limit: 10 });

    const updateItemMutation = useUpdateCartItem();
    const removeItemMutation = useRemoveCartItem();
    const clearCartMutation = useClearCart();

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
    }, [status, router]);

    if (status === "loading" || isCartLoading) {
        return <LoadingState label={tCommon("loading")} />;
    }

    const cartItems = cartData?.cartItems ?? [];
    const productsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce((sum, item) => sum + getUnitPrice(item.product) * item.quantity, 0);
    const discountAmount = subtotal * couponDiscount;
    const total = subtotal - discountAmount;
    const recommendedProducts = productsData?.data?.slice(0, 8) ?? [];

    const handleQuantityChange = (
        itemId: string,
        currentQty: number,
        delta: number,
        stock: number
    ) => {
        const newQty = currentQty + delta;
        if (newQty < 1) return;
        if (newQty > stock) {
            toast.error(t("stockExceeded"));
            return;
        }
        updateItemMutation.mutate(
            { id: itemId, body: { quantity: newQty } },
            {
                onSuccess: () => toast.success(t("updatedSuccess")),
                onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Failed to update cart"),
            }
        );
    };

    const handleRemoveItem = (itemId: string) => {
        removeItemMutation.mutate(itemId, {
            onSuccess: () => toast.success(t("removedSuccess")),
            onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Failed to remove item"),
        });
    };

    const handleClearCart = () => {
        clearCartMutation.mutate(undefined, {
            onSuccess: () => toast.success(t("clearedSuccess")),
            onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Failed to clear cart"),
        });
    };

    const handleApplyCoupon = (e: React.FormEvent) => {
        e.preventDefault();
        const code = couponCode.trim().toUpperCase();
        const discount = COUPONS[code];
        if (discount) {
            setAppliedCoupon(code);
            setCouponDiscount(discount);
            toast.success(t("couponApplied"));
        } else {
            toast.error(t("invalidCoupon"));
        }
    };

    const scrollSlider = (direction: "left" | "right") => {
        if (!recommendedSliderRef.current) return;
        const scrollAmount = direction === "left" ? -318 : 318;
        recommendedSliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    };

    return (
        <div className="flex flex-col items-center mx-auto mt-10 mb-16 px-4 gap-12 w-full max-w-7xl text-start">
            <div className="flex flex-col lg:flex-row items-start w-full gap-10">
                <div className="flex flex-col shrink-0 w-full lg:w-195.5 gap-6">
                    <div className="flex flex-row justify-between items-end w-full h-12">
                        <div className="flex items-end gap-2.5">
                            <h1 className="m-0 font-sarabun font-bold text-5xl leading-none text-zinc-800 dark:text-zinc-100">
                                {t("title")}
                            </h1>
                            <span className="pb-1.5 font-sarabun font-medium text-base leading-none text-zinc-400 dark:text-zinc-400">
                                {productsCount === 1
                                    ? t("productCountSingle")
                                    : t("productsCount", { count: productsCount })}
                            </span>
                        </div>

                        <button
                            onClick={handleClearCart}
                            disabled={clearCartMutation.isPending || cartItems.length === 0}
                            className="flex items-center justify-center shrink-0 px-4 py-2.5 w-40 h-10 bg-primary-50 rounded-lg border-none outline-none cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50"
                        >
                            <BrushCleaning className="w-5 h-5 text-primary-600" />
                            <span className="font-mulish font-semibold text-sm text-primary-600">
                                {t("clearCart")}
                            </span>
                        </button>
                    </div>

                    {cartItems.length === 0 ? (
                        <EmptyCart subtitle={t("emptyCartSubtitle")} />
                    ) : (
                        <div className="flex flex-col w-full p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                            {cartItems.map((cartItem) => (
                                <CartItemRow
                                    key={cartItem.id}
                                    cartItem={cartItem}
                                    onQuantityChange={handleQuantityChange}
                                    onRemove={handleRemoveItem}
                                    isUpdating={updateItemMutation.isPending}
                                    isRemoving={removeItemMutation.isPending}
                                    ratingLabel={t("ratingLabel")}
                                    ratingsCount={(n) => t("ratingsCount", { count: n })}
                                    removeLabel={t("remove")}
                                    currency={tCommon("currency")}
                                />
                            ))}
                        </div>
                    )}

                    <div className="flex justify-start w-full">
                        <Link
                            href="/products"
                            className="flex items-center justify-center shrink-0 px-4 py-2.5 w-52 h-10 bg-primary-600 rounded-lg border-none outline-none cursor-pointer transition-colors hover:bg-primary-700"
                        >
                            <ArrowLeft className="shrink-0 w-5 h-5 text-white rtl:rotate-180" strokeWidth={1.5} />
                            <span className="font-mulish font-semibold text-sm text-white">
                                {t("continueShopping")}
                            </span>
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col shrink-0 w-full lg:w-114.5 gap-6 lg:sticky lg:top-24">
                    <h2 className="m-0 font-sarabun font-semibold text-3xl leading-none text-zinc-900 dark:text-zinc-100">
                        {t("summaryTitle")}
                    </h2>

                    <div className="flex flex-col p-4 w-full bg-zinc-50 dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-lg gap-2.5">
                        <form
                            onSubmit={handleApplyCoupon}
                            className="flex items-start w-full h-12 gap-2.5"
                        >
                            <div className="flex items-center flex-1 h-12 px-4 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg">
                                <input
                                    type="text"
                                    placeholder={t("couponPlaceholder")}
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    className="w-full bg-transparent border-none outline-none font-inter text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400"
                                />
                            </div>
                            <button
                                type="submit"
                                className="flex items-center justify-center shrink-0 px-4 w-40 h-12 bg-primary-600 rounded-lg border-none outline-none cursor-pointer transition-colors hover:bg-primary-700"
                            >
                                <TicketPercent className="shrink-0 w-6 h-6 text-white" strokeWidth={1.5} />
                                <span className="font-mulish font-semibold text-sm text-white whitespace-nowrap">
                                    {t("applyCoupon")}
                                </span>
                            </button>
                        </form>

                        <div className="flex items-center justify-center w-full h-16 border border-zinc-300 dark:border-zinc-700 rounded-md p-2.5">
                            {appliedCoupon ? (
                                <span className="font-sarabun font-semibold text-base text-primary-600">
                                    {t("couponAppliedDisplay", {
                                        code: appliedCoupon,
                                        percent: (couponDiscount * 100).toFixed(0),
                                    })}
                                </span>
                            ) : (
                                <span className="font-sarabun italic text-base text-zinc-400">
                                    {t("noCoupons")}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col w-full p-2.5 gap-4">
                            <div className="flex justify-between items-center w-full">
                                <span className="font-sarabun font-medium text-lg text-zinc-800 dark:text-zinc-300">
                                    {t("subtotal")}
                                </span>
                                <span className="font-sarabun font-semibold text-xl text-zinc-800 dark:text-zinc-100">
                                    {subtotal.toFixed(2)} {tCommon("currency")}
                                </span>
                            </div>

                            <hr className="w-full border-t border-zinc-300 dark:border-zinc-700" />

                            <div className="flex justify-between items-center w-full">
                                <span className="font-sarabun font-bold text-2xl text-primary-600 dark:text-rose-400">
                                    {t("total")}
                                </span>
                                <span className="font-sarabun font-bold text-2xl text-primary-600 dark:text-rose-400">
                                    {total.toFixed(2)} {tCommon("currency")}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => router.push("/checkout")}
                            className="flex items-center justify-center shrink-0 mt-2 gap-2.5 w-full h-16 bg-primary-600 rounded-lg border-none outline-none cursor-pointer transition-colors hover:bg-primary-700"
                        >
                            <span className="font-sarabun font-medium text-xl text-white">
                                {t("checkout")}
                            </span>
                            <ArrowRight className="shrink-0 w-6 h-6 text-white rtl:rotate-180" strokeWidth={1.5} />
                        </button>
                    </div>
                </div>
            </div>

            {recommendedProducts.length > 0 && (
                <div className="flex flex-col px-2.5 w-full max-w-7xl text-start relative gap-6">
                    <div className="relative ml-2.5 w-96 h-10">
                        <div className="absolute left-0 top-6 w-52 h-4 bg-rose-100 dark:bg-primary-700/40 rounded-r-2xl" />
                        <div className="absolute left-0 bottom-0 w-20 h-0.5 bg-rose-600" />
                        <h2 className="absolute left-0 top-0 z-10 flex items-center w-full h-9 m-0 font-sarabun font-bold text-4xl leading-none text-primary-700 dark:text-rose-300">
                            {t("recommendedTitle")}
                        </h2>
                    </div>

                    <div className="relative flex items-center justify-center w-full">
                        <button
                            onClick={() => scrollSlider("left")}
                            className="absolute z-10 flex items-center justify-center top-36 -translate-y-1/2 -left-4 w-8 h-8 bg-primary-600 rounded-full border-none outline-none cursor-pointer transition-colors hover:bg-primary-700 shadow-md"
                        >
                            <ChevronLeft className="w-5 h-5 text-white rtl:rotate-180" strokeWidth={2} />
                        </button>

                        <div
                            ref={recommendedSliderRef}
                            className="flex flex-row items-start w-full max-w-315 mx-auto p-2.5 gap-4 overflow-x-auto scroll-smooth isolate [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none"
                        >
                            {recommendedProducts.map((product) => (
                                <div key={product.id} className="shrink-0 z-0">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => scrollSlider("right")}
                            className="absolute z-10 flex items-center justify-center top-36 -translate-y-1/2 -right-4 w-8 h-8 bg-primary-600 rounded-full border-none outline-none cursor-pointer transition-colors hover:bg-primary-700 shadow-md"
                        >
                            <ChevronRight className="w-5 h-5 text-white rtl:rotate-180" strokeWidth={2} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}