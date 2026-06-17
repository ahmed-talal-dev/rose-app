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
    Trash2,
    Plus,
    Minus,
    ArrowLeft,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Star,
    TicketPercent,
    BrushCleaning,
} from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toNum(val: unknown): number {
    return Number(val) || 0;
}

const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL || "https://rose-app.elevate-bootcamp.cloud";

function resolveImageUrl(url: string): string {
    if (!url) return "/images/placeholder.svg";
    return url.startsWith("http") ? url : `${BASE_URL}${url}`;
}

function getUnitPrice(product: any): number {
    const price = Number(product.price) || 0;
    const discountVal = Number(product.discountValue) || 0;

    if (product.discountType === "PERCENT") return price - (price * discountVal) / 100;
    if (product.discountType === "FIXED") return price - discountVal;
    return price;
}

// ─── Coupon logic ─────────────────────────────────────────────────────────────

const COUPONS: Record<string, number> = {
    ROSE50: 0.5,
    ROSE20: 0.2,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function LoadingState({ label }: { label: string }) {
    return (
        <div className="mx-auto max-w-7xl px-4 py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
            <span className="font-sarabun text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
        </div>
    );
}

function EmptyCart({ subtitle }: { subtitle: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-6 p-5 w-full min-h-72 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <Image
                src="/images/cart.png"
                alt="Empty Cart"
                width={240}
                height={180}
                className="w-60 h-auto object-contain"
                unoptimized
            />
            <p className="font-sarabun font-medium text-lg text-zinc-400">{subtitle}</p>
        </div>
    );
}

interface CartItemRowProps {
    item: any;
    onQuantityChange: (id: string, qty: number, delta: number, stock: number) => void;
    onRemove: (id: string) => void;
    isUpdating: boolean;
    isRemoving: boolean;
    ratingLabel: string;
    ratingsCount: (n: number) => string;
    removeLabel: string;
    currency: string;
}

function CartItemRow({
    item,
    onQuantityChange,
    onRemove,
    isUpdating,
    isRemoving,
    ratingLabel,
    ratingsCount,
    removeLabel,
    currency,
}: CartItemRowProps) {
    const unitPrice = getUnitPrice(item.product);

    return (
        <div className="flex flex-col lg:flex-row items-center gap-4 pb-5 mb-5 border-b border-zinc-200 dark:border-zinc-800 last:border-b-0 last:mb-0 last:pb-0">
            {/* Product image */}
            <div className="relative w-29.25 h-36 rounded-lg bg-zinc-50 dark:bg-zinc-800 shrink-0 overflow-hidden">
                <Image
                    src={resolveImageUrl(item.product.cover)}
                    alt={item.product.title}
                    fill
                    className="object-cover"
                    unoptimized
                />
            </div>

            {/* Product details */}
            <div className="flex flex-col justify-between gap-2.5 w-full h-full lg:h-36">
                {/* Top row: title + remove button */}
                <div className="flex flex-col lg:flex-row justify-between items-start gap-3 w-full">
                    <div className="flex flex-col gap-1.5 w-full lg:w-auto">
                        <h3 className="font-sarabun font-semibold text-lg text-primary-700 dark:text-rose-300 truncate m-0">
                            {item.product.title}
                        </h3>
                        <div className="flex items-center gap-1.5 h-5">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 shrink-0" strokeWidth={1.5} />
                            <span className="font-sarabun text-base text-zinc-900 dark:text-zinc-200">
                                {ratingLabel}: {toNum(item.product.rating).toFixed(1)}/5
                            </span>
                            <span className="font-sarabun font-medium text-base text-blue-600">
                                {ratingsCount(8)}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => onRemove(item.id)}
                        disabled={isRemoving}
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 w-24 h-10 bg-red-600 hover:opacity-90 rounded-lg transition-opacity cursor-pointer border-none outline-none shrink-0 disabled:opacity-50 mt-3 lg:mt-0"
                    >
                        <Trash2 className="w-5 h-5 text-white shrink-0" strokeWidth={1.5} />
                        <span className="font-sarabun font-medium text-sm text-white">{removeLabel}</span>
                    </button>
                </div>

                {/* Bottom row: price + quantity controls */}
                <div className="flex flex-col lg:flex-row justify-between items-end gap-3 w-full mt-auto">
                    <div className="flex items-center gap-1.5">
                        <span className="font-sarabun font-medium text-sm text-primary-600 dark:text-rose-400 opacity-80">
                            (×{item.quantity})
                        </span>
                        <span className="font-sarabun font-bold text-xl text-primary-600 dark:text-rose-400">
                            {unitPrice.toFixed(2)} {currency}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 w-56 h-12 shrink-0 mt-3 lg:mt-0">
                        {/* Decrease */}
                        <button
                            onClick={() => onQuantityChange(item.id, item.quantity, -1, item.product.stock)}
                            disabled={isUpdating || item.quantity <= 1}
                            className="flex items-center justify-center w-12 h-12 bg-primary-50 rounded-lg hover:opacity-80 transition-opacity cursor-pointer border-none outline-none shrink-0 disabled:opacity-50"
                        >
                            <Minus className="w-5 h-5 text-primary-600" strokeWidth={2} />
                        </button>

                        {/* Quantity display */}
                        <div className="flex items-center justify-center w-24 h-12 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 shrink-0">
                            <span className="font-inter text-sm text-zinc-800 dark:text-zinc-100">
                                {item.quantity}
                            </span>
                        </div>

                        {/* Increase */}
                        <button
                            onClick={() => onQuantityChange(item.id, item.quantity, 1, item.product.stock)}
                            disabled={isUpdating || item.quantity >= item.product.stock}
                            className="flex items-center justify-center w-12 h-12 bg-primary-50 rounded-lg hover:opacity-80 transition-opacity cursor-pointer border-none outline-none shrink-0 disabled:opacity-50"
                        >
                            <Plus className="w-5 h-5 text-primary-600" strokeWidth={2} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

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

    // ── Derived state ────────────────────────────────────────────────────────────

    const items = cartData?.cartItems ?? [];
    const productsCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + getUnitPrice(item.product) * item.quantity, 0);
    const discountAmount = subtotal * couponDiscount;
    const total = subtotal - discountAmount;
    const recommendedProducts = productsData?.data?.slice(0, 8) ?? [];

    // ── Handlers ─────────────────────────────────────────────────────────────────

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
                onError: (err: any) => toast.error(err.message || "Failed to update cart"),
            }
        );
    };

    const handleRemoveItem = (itemId: string) => {
        removeItemMutation.mutate(itemId, {
            onSuccess: () => toast.success(t("removedSuccess")),
            onError: (err: any) => toast.error(err.message || "Failed to remove item"),
        });
    };

    const handleClearCart = () => {
        clearCartMutation.mutate(undefined, {
            onSuccess: () => toast.success(t("clearedSuccess")),
            onError: (err: any) => toast.error(err.message || "Failed to clear cart"),
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

    // ── Render ───────────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto mt-10 mb-16 px-4 gap-12 text-start">

            {/* ── Main content: cart list + order summary ── */}
            <div className="flex flex-col lg:flex-row items-start gap-10 w-full">

                {/* ── Left: Cart items ── */}
                <div className="flex flex-col gap-6 w-full lg:w-195.5 shrink-0">

                    {/* Header row */}
                    <div className="flex flex-row justify-between items-end w-full h-12">
                        <div className="flex items-end gap-2.5">
                            <h1 className="font-sarabun font-bold text-5xl leading-none text-zinc-800 dark:text-zinc-100 m-0">
                                {t("title")}
                            </h1>
                            <span className="font-sarabun font-medium text-base leading-none pb-1.5 text-zinc-400 dark:text-zinc-400">
                                {productsCount === 1
                                    ? t("productCountSingle")
                                    : t("productsCount", { count: productsCount })}
                            </span>
                        </div>

                        <button
                            onClick={handleClearCart}
                            disabled={clearCartMutation.isPending || items.length === 0}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 w-40 h-10 bg-primary-50 hover:opacity-80 rounded-lg transition-opacity cursor-pointer border-none outline-none shrink-0 disabled:opacity-50"
                        >
                            <BrushCleaning className="w-5 h-5 text-primary-600" />
                            <span className="font-mulish font-semibold text-sm text-primary-600">
                                {t("clearCart")}
                            </span>
                        </button>
                    </div>

                    {/* Cart items list / empty state */}
                    {items.length === 0 ? (
                        <EmptyCart subtitle={t("emptyCartSubtitle")} />
                    ) : (
                        <div className="flex flex-col p-5 w-full border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900">
                            {items.map((item) => (
                                <CartItemRow
                                    key={item.id}
                                    item={item}
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

                    {/* Continue shopping */}
                    <div className="flex justify-start w-full">
                        <Link
                            href="/products"
                            className="flex items-center justify-center gap-2.5 px-4 py-2.5 w-52 h-10 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors cursor-pointer border-none outline-none shrink-0"
                        >
                            <ArrowLeft className="w-5 h-5 text-white rtl:rotate-180 shrink-0" strokeWidth={1.5} />
                            <span className="font-mulish font-semibold text-sm text-white">
                                {t("continueShopping")}
                            </span>
                        </Link>
                    </div>
                </div>

                {/* ── Right: Order summary ── */}
                <div className="flex flex-col gap-6 w-full lg:w-114.5 shrink-0 lg:sticky lg:top-24">
                    <h2 className="font-sarabun font-semibold text-3xl leading-none text-zinc-900 dark:text-zinc-100 m-0">
                        {t("summaryTitle")}
                    </h2>

                    <div className="flex flex-col gap-2.5 p-4 w-full bg-zinc-50 dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-lg">

                        {/* Coupon input */}
                        <form
                            onSubmit={handleApplyCoupon}
                            className="flex items-start gap-2.5 w-full h-12"
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
                                className="flex items-center justify-center gap-2.5 px-4 w-40 h-12 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors cursor-pointer border-none outline-none shrink-0"
                            >
                                <TicketPercent className="w-6 h-6 text-white shrink-0" strokeWidth={1.5} />
                                <span className="font-mulish font-semibold text-sm text-white whitespace-nowrap">
                                    {t("applyCoupon")}
                                </span>
                            </button>
                        </form>

                        {/* Coupon display area */}
                        <div className="flex items-center justify-center p-2.5 w-full h-64 border border-zinc-300 dark:border-zinc-700 rounded-md">
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

                        {/* Price breakdown */}
                        <div className="flex flex-col gap-4 p-2.5 w-full">
                            <div className="flex justify-between items-center w-full">
                                <span className="font-sarabun font-medium text-lg text-zinc-800 dark:text-zinc-300">
                                    {t("subtotal")}
                                </span>
                                <span className="font-sarabun font-semibold text-xl text-zinc-800 dark:text-zinc-100">
                                    {subtotal.toFixed(2)} {tCommon("currency")}
                                </span>
                            </div>

                            <hr className="border-t border-zinc-300 dark:border-zinc-700 w-full" />

                            <div className="flex justify-between items-center w-full">
                                <span className="font-sarabun font-bold text-2xl text-primary-600 dark:text-rose-400">
                                    {t("total")}
                                </span>
                                <span className="font-sarabun font-bold text-2xl text-primary-600 dark:text-rose-400">
                                    {total.toFixed(2)} {tCommon("currency")}
                                </span>
                            </div>
                        </div>

                        {/* Checkout button */}
                        <button
                            onClick={() => router.push("/checkout")}
                            className="flex items-center justify-center gap-2.5 w-full h-16 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors cursor-pointer border-none outline-none shrink-0 mt-2"
                        >
                            <span className="font-sarabun font-medium text-xl text-white">
                                {t("checkout")}
                            </span>
                            <ArrowRight className="w-6 h-6 text-white shrink-0 rtl:rotate-180" strokeWidth={1.5} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Recommended products slider ── */}
            {recommendedProducts.length > 0 && (
                <div className="flex flex-col gap-6 w-full max-w-7xl px-2.5 text-start relative">

                    {/* Section heading */}
                    <div className="relative w-96 h-10 ml-2.5">
                        <div className="absolute w-52 h-4 left-0 top-6 bg-rose-100 dark:bg-primary-700/40 rounded-r-2xl" />
                        <div className="absolute w-20 h-0.5 left-0 bottom-0 bg-rose-600" />
                        <h2 className="absolute w-full h-9 left-0 top-0 font-sarabun font-bold text-4xl leading-none text-primary-700 dark:text-rose-300 flex items-center z-10 m-0">
                            {t("recommendedTitle")}
                        </h2>
                    </div>

                    {/* Slider */}
                    <div className="relative flex items-center justify-center w-full">
                        <button
                            onClick={() => scrollSlider("left")}
                            className="absolute top-36 -translate-y-1/2 -left-4 z-10 flex items-center justify-center w-8 h-8 bg-primary-600 hover:bg-primary-700 rounded-full transition-colors cursor-pointer border-none outline-none shadow-md"
                        >
                            <ChevronLeft className="w-5 h-5 text-white rtl:rotate-180" strokeWidth={2} />
                        </button>

                        <div
                            ref={recommendedSliderRef}
                            className="flex flex-row items-start gap-4 p-2.5 overflow-x-auto scroll-smooth w-full max-w-315 mx-auto isolate [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                        >
                            {recommendedProducts.map((product) => (
                                <div key={product.id} className="shrink-0 z-0">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => scrollSlider("right")}
                            className="absolute top-36 -translate-y-1/2 -right-4 z-10 flex items-center justify-center w-8 h-8 bg-primary-600 hover:bg-primary-700 rounded-full transition-colors cursor-pointer border-none outline-none shadow-md"
                        >
                            <ChevronRight className="w-5 h-5 text-white rtl:rotate-180" strokeWidth={2} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}