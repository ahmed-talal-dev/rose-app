"use client";

import { useLocale, useTranslations } from "next-intl";
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
    Ticket,
    Loader2,
    Star,
    TicketPercent,
    BrushCleaning,
} from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
function toNum(val: unknown): number {
    return Number(val) || 0;
}

export default function CartPage() {
    const locale = useLocale();
    const router = useRouter();
    const t = useTranslations("cart");
    const tCommon = useTranslations("common");
    const { data: session, status } = useSession();

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
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading" || isCartLoading) {
        return (
            <div className="mx-auto max-w-[1280px] px-4 py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-[40px] h-[40px] animate-spin text-[#A6252A]" />
                <span className="text-zinc-500 dark:text-zinc-400 font-sarabun text-[14px]">
                    {tCommon("loading")}
                </span>
            </div>
        );
    }

    const items = cartData?.cartItems ?? [];
    const productsCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://rose-app.elevate-bootcamp.cloud";

    const resolveImageUrl = (url: string) => {
        if (!url) return "/images/placeholder.svg";
        return url.startsWith("http") ? url : `${BASE_URL}${url}`;
    };

    const getUnitPrice = (product: any) => {
        const price = Number(product.price) || 0;
        const discountVal = Number(product.discountValue) || 0;
        if (product.discountType === "PERCENT") {
            return price - (price * discountVal) / 100;
        } else if (product.discountType === "FIXED") {
            return price - discountVal;
        }
        return price;
    };

    const handleQuantityChange = (itemId: string, currentQty: number, change: number, stock: number) => {
        const newQty = currentQty + change;
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
        if (code === "ROSE50") {
            setAppliedCoupon("ROSE50");
            setCouponDiscount(0.5);
            toast.success(t("couponApplied"));
        } else if (code === "ROSE20") {
            setAppliedCoupon("ROSE20");
            setCouponDiscount(0.2);
            toast.success(t("couponApplied"));
        } else {
            toast.error(t("invalidCoupon"));
        }
    };

    const subtotal = items.reduce((sum, item) => sum + getUnitPrice(item.product) * item.quantity, 0);
    const discountAmount = subtotal * couponDiscount;
    const total = subtotal - discountAmount;

    const recommendedProducts = productsData?.data?.slice(0, 8) || [];

    const scrollSlider = (direction: "left" | "right") => {
        if (recommendedSliderRef.current) {
            const scrollAmount = 318;
            if (direction === "left") {
                recommendedSliderRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
            } else {
                recommendedSliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
            }
        }
    };

    return (
        <div className="flex flex-col items-center p-0 gap-[50px] w-full max-w-[1280px] mx-auto mt-[40px] mb-[64px] text-start">

            <div className="flex flex-col lg:flex-row items-start p-0 gap-[40px] w-full shrink-0">

                <div className="flex flex-col items-start p-0 gap-[24px] w-full lg:w-[782px] shrink-0">

                    <div className="flex flex-row justify-between items-end p-0 w-full lg:w-[782px] h-[48px] shrink-0">
                        <div className="flex flex-row items-end p-0 gap-[10px] h-[48px] shrink-0">
                            <h1 className="font-sarabun font-bold text-[48px] leading-none text-[#27272A] dark:text-zinc-100 flex items-center m-0">
                                {t("title")}
                            </h1>
                            <span className="font-sarabun font-medium text-[16px] leading-[16px] pb-[6px] text-[#A1A1AA] dark:text-zinc-400">
                                {productsCount} products
                            </span>
                        </div>

                        <button
                            onClick={handleClearCart}
                            disabled={clearCartMutation.isPending || items.length === 0}
                            className="flex flex-row justify-center items-center px-[16px] py-[10px] gap-[6px] w-[165px] h-[41px] bg-[#FBEAEA] hover:opacity-80 rounded-[10px] disabled:opacity-50 transition-opacity cursor-pointer border-none outline-none shrink-0"
                        >
                            <BrushCleaning className="w-[20px] h-[20px] text-[#A6252A]" />
                            <span className="font-mulish font-semibold text-[14px] leading-[150%] text-[#A6252A]">
                                Clear Cart
                            </span>
                        </button>
                    </div>

                    {items.length === 0 ? (
                        <div className="box-border flex flex-col items-center justify-center p-[20px] w-full lg:w-[782px] min-h-[300px] border border-[#E4E4E7] dark:border-zinc-800 rounded-[12px] shrink-0 gap-[24px]">
                            <Image
                                src="/images/cart.png"
                                alt="Empty Cart "
                                width={240}
                                height={180}
                                className="w-[240px] h-auto object-contain"
                                unoptimized />
                            <p className="text-[#A1A1AA] font-medium font-sarabun text-[18px]">
                                {t("emptyCartSubtitle")}
                            </p>
                        </div>
                    ) : (
                        <div className="box-border flex flex-col items-start p-[20px] w-full lg:w-[782px] border border-[#E4E4E7] dark:border-zinc-800 rounded-[12px] shrink-0 bg-white dark:bg-zinc-900">
                            {items.map((item) => {
                                const unitPrice = getUnitPrice(item.product);
                                const itemTotal = unitPrice * item.quantity;
                                return (
                                    <div
                                        key={item.id}
                                        className="box-border flex flex-col lg:flex-row items-center p-0 pb-[20px] mb-[20px] gap-[16px] w-full lg:w-[742px] border-b border-[#E4E4E7] dark:border-zinc-800 shrink-0 last:border-b-0 last:mb-0 last:pb-0"
                                    >
                                        <div className="w-[117px] h-[140px] rounded-[8px] bg-zinc-50 dark:bg-zinc-800 shrink-0 relative overflow-hidden">
                                            <Image
                                                src={resolveImageUrl(item.product.cover)}
                                                alt={item.product.title}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>

                                        <div className="flex flex-col items-start p-0 gap-[10px] w-full lg:w-[609px] h-full lg:h-[140px] shrink-0 justify-between">

                                            <div className="flex flex-col lg:flex-row justify-between items-start p-0 w-full h-auto lg:h-[81px]">

                                                <div className="flex flex-col items-start p-0 gap-[6px] w-full lg:w-[507px] shrink-0">
                                                    <h3 className="font-sarabun font-semibold text-[18px] leading-none text-[#741C21] dark:text-rose-300 w-full truncate m-0">
                                                        {item.product.title}
                                                    </h3>

                                                    <div className="flex flex-row items-center p-0 gap-[6px] h-[21px] shrink-0">
                                                        <Star className="w-[20px] h-[20px] fill-[#FFA508] text-[#FFA508] shrink-0" strokeWidth={1.5} />
                                                        <span className="font-sarabun font-normal text-[16px] leading-none text-[#000000] dark:text-zinc-200">
                                                            {t("ratingLabel")}: {toNum(item.product.rating).toFixed(1)}/5
                                                        </span>
                                                        <span className="font-sarabun font-medium text-[16px] leading-none text-[#155DFC]">
                                                            {t("ratingsCount", { count: 8 })}
                                                        </span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    disabled={removeItemMutation.isPending}
                                                    className="flex flex-row justify-center items-center p-[10px] gap-[6px] w-[96px] h-[40px] bg-[#DC2626] hover:opacity-90 rounded-[10px] transition-opacity cursor-pointer border-none outline-none shrink-0 mt-3 lg:mt-0"
                                                >
                                                    <Trash2 className="w-[20px] h-[20px] text-white shrink-0" strokeWidth={1.5} />
                                                    <span className="font-sarabun font-medium text-[14px] leading-none text-white">
                                                        {t("remove")}
                                                    </span>
                                                </button>
                                            </div>

                                            <div className="flex flex-col lg:flex-row justify-between items-end p-0 w-full h-auto lg:h-[49px] shrink-0 mt-auto">

                                                <div className="flex flex-row items-center p-0 h-[30px] shrink-0">
                                                    <span className="font-sarabun font-semibold text-[20px] leading-none text-[#A6252A] dark:text-rose-400 flex items-center gap-1.5">
                                                        <span className="font-medium text-[14px] opacity-80">(×{item.quantity})</span>
                                                        <span className="font-bold">{unitPrice.toFixed(2)} EGP</span>
                                                    </span>
                                                </div>

                                                <div className="flex flex-row items-center p-0 gap-[8px] w-[217px] h-[49px] shrink-0 mt-3 lg:mt-0">
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, item.quantity, -1, item.product.stock)}
                                                        disabled={updateItemMutation.isPending || item.quantity <= 1}
                                                        className="flex flex-row justify-center items-center p-[10px_16px] gap-[10px] w-[49px] h-[49px] bg-[#FBEAEA] rounded-[10px] hover:opacity-80 transition-opacity cursor-pointer border-none outline-none shrink-0 disabled:opacity-50"
                                                    >
                                                        <Minus className="w-[20px] h-[20px] text-[#A6252A]" strokeWidth={2} />
                                                    </button>

                                                    <div className="box-border flex flex-row items-center justify-center p-[16px] gap-[8px] w-[103px] h-[49px] bg-white dark:bg-zinc-800 border border-[#D4D4D8] dark:border-zinc-700 rounded-[10px] shrink-0">
                                                        <span className="font-inter font-normal text-[14px] leading-[17px] text-[#27272A] dark:text-zinc-100">
                                                            {item.quantity}
                                                        </span>
                                                    </div>

                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, item.quantity, 1, item.product.stock)}
                                                        disabled={updateItemMutation.isPending || item.quantity >= item.product.stock}
                                                        className="flex flex-row justify-center items-center p-[10px_16px] gap-[10px] w-[49px] h-[49px] bg-[#FBEAEA] rounded-[10px] hover:opacity-80 transition-opacity cursor-pointer border-none outline-none shrink-0 disabled:opacity-50"
                                                    >
                                                        <Plus className="w-[20px] h-[20px] text-[#A6252A]" strokeWidth={2} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="flex justify-start w-full">
                        <Link
                            href="/products"
                            className="flex flex-row justify-center items-center p-[10px_16px] gap-[10px] w-[213px] h-[41px] bg-[#A6252A] hover:bg-[#8B1E22] rounded-[10px] transition-colors cursor-pointer border-none outline-none shrink-0"
                        >
                            <ArrowLeft className="w-[20px] h-[20px] text-white rtl:rotate-180 shrink-0" strokeWidth={1.5} />
                            <span className="font-mulish font-semibold text-[14px] leading-[150%] text-white">
                                {t("continueShopping")}
                            </span>
                        </Link>
                    </div>

                </div>

                <div className="flex flex-col items-start p-0 gap-[24px] w-full lg:w-[458px] shrink-0 lg:sticky lg:top-24">
                    <h2 className="font-sarabun font-semibold text-[30px] leading-none text-[#000000] dark:text-zinc-100 m-0">
                        {t("summaryTitle")}
                    </h2>

                    <div className="flex flex-col items-start p-[16px] gap-[10px] w-full bg-[#FAFAFA] dark:bg-zinc-900 rounded-[8px] shrink-0 border border-transparent dark:border-zinc-800">

                        <form onSubmit={handleApplyCoupon} className="flex flex-row items-start p-0 gap-[10px] w-full h-[49px] shrink-0">
                            <div className="box-border flex flex-row items-center p-[16px] gap-[8px] flex-1 h-[49px] bg-white dark:bg-zinc-800 border border-[#D4D4D8] dark:border-zinc-700 rounded-[10px] shrink-0">
                                <input
                                    type="text"
                                    placeholder={t("couponPlaceholder")}
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    className="w-full bg-transparent border-none outline-none font-inter font-normal text-[14px] leading-[17px] text-[#27272A] dark:text-zinc-100 placeholder-[#A1A1AA]"
                                />
                            </div>
                            <button
                                type="submit"
                                className="flex flex-row justify-center items-center p-[10px_16px] gap-[10px] w-[159px] h-[49px] bg-[#A6252A] hover:bg-[#8B1E22] rounded-[10px] transition-colors cursor-pointer border-none outline-none shrink-0"
                            >
                                <TicketPercent className="w-[24px] h-[24px] text-white shrink-0" strokeWidth={1.5} />
                                <span className="font-mulish font-semibold text-[14px] leading-[150%] text-white whitespace-nowrap">
                                    {t("applyCoupon")}
                                </span>
                            </button>
                        </form>

                        <div className="box-border flex flex-row justify-center items-center p-[10px] gap-[10px] w-full h-[260px] border border-[#D4D4D8] dark:border-zinc-700 rounded-[6px] shrink-0 bg-transparent">
                            {appliedCoupon ? (
                                <span className="font-sarabun font-semibold text-[16px] leading-[21px] text-[#A6252A]">
                                    {t("couponAppliedDisplay", { code: appliedCoupon, percent: (couponDiscount * 100).toFixed(0) })}
                                </span>
                            ) : (
                                <span className="font-sarabun font-normal italic text-[16px] leading-[21px] text-[#A1A1AA]">
                                    {t("noCoupons")}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col justify-end items-start p-[10px] gap-[16px] w-full shrink-0">

                            <div className="flex flex-row justify-between items-center p-0 gap-[10px] w-full h-[22px] shrink-0">
                                <span className="font-sarabun font-medium text-[18px] leading-none text-[#27272A] dark:text-zinc-300">
                                    {t("subtotal")}
                                </span>
                                <span className="font-sarabun font-semibold text-[20px] leading-none text-[#27272A] dark:text-zinc-100">
                                    {subtotal.toFixed(2)} EGP
                                </span>
                            </div>

                            <div className="flex flex-row items-center p-0 gap-[10px] w-full shrink-0">
                                <div className="w-full h-px border-t border-[#D4D4D8] dark:border-zinc-700 shrink-0" />
                            </div>

                            <div className="flex flex-row justify-between items-center p-0 gap-[10px] w-full h-[24px] shrink-0">
                                <span className="font-sarabun font-bold text-[24px] leading-none text-[#A6252A] dark:text-rose-400">
                                    {t("total")}
                                </span>
                                <span className="font-sarabun font-bold text-[24px] leading-none text-[#A6252A] dark:text-rose-400">
                                    {total.toFixed(2)} EGP
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => router.push("/checkout")}
                            className="flex flex-row justify-center items-center p-[10px_16px] gap-[10px] w-full h-[70px] bg-[#A6252A] hover:bg-[#8B1E22] rounded-[10px] transition-colors cursor-pointer border-none outline-none shrink-0 mt-2"
                        >
                            <span className="font-sarabun font-medium text-[20px] leading-none text-white">
                                {t("checkout")}
                            </span>
                            <ArrowRight className="w-[24px] h-[24px] text-white shrink-0 rtl:rotate-180" strokeWidth={1.5} />
                        </button>
                    </div>
                </div>
            </div>

            {recommendedProducts.length > 0 && (
                <div className="flex flex-col items-start p-[10px] gap-[24px] w-full max-w-[1280px] shrink-0 text-start relative">

                    <div className="relative w-[367px] h-[41px] shrink-0 ml-[10px]">
                        <div className="absolute w-[214px] h-[17px] left-0 top-[24px] bg-[#FFE0E7] dark:bg-[#741C21]/40 rounded-r-[20px]" />
                        <div className="absolute w-[83px] h-[2px] left-0 top-[39px] bg-[#E65073]" />
                        <h2 className="absolute w-[367px] h-[36px] left-0 top-0 font-sarabun font-bold text-[36px] leading-none text-[#741C21] dark:text-rose-300 flex items-center z-10 m-0">
                            {t("recommendedTitle")}
                        </h2>
                    </div>

                    <div className="relative w-full flex items-center justify-center">
                        <button
                            onClick={() => scrollSlider("left")}
                            className="absolute top-[146px] -translate-y-1/2 -left-[16px] z-10 flex flex-col justify-center items-center w-[33px] h-[33px] bg-[#A6252A] rounded-full hover:bg-[#8B1E22] transition-colors cursor-pointer border-none outline-none shadow-md"
                        >
                            <ChevronLeft className="w-[20px] h-[20px] text-white rtl:rotate-180" strokeWidth={2} />
                        </button>

                        <div
                            ref={recommendedSliderRef}
                            className="flex flex-row items-start p-[10px] gap-[16px] overflow-x-auto scroll-smooth w-full max-w-[1260px] mx-auto isolate [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                        >
                            {recommendedProducts.map((recProduct) => (
                                <div key={recProduct.id} className="shrink-0 z-0">
                                    <ProductCard product={recProduct} />
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => scrollSlider("right")}
                            className="absolute top-[146px] -translate-y-1/2 -right-[16px] z-10 flex flex-col justify-center items-center w-[33px] h-[33px] bg-[#A6252A] rounded-full hover:bg-[#8B1E22] transition-colors cursor-pointer border-none outline-none shadow-md"
                        >
                            <ChevronRight className="w-[20px] h-[20px] text-white rtl:rotate-180" strokeWidth={2} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

