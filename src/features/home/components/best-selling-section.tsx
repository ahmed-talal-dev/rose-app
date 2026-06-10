"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import { useProducts } from "@/features/products/hooks";
import { ProductCardSkeleton } from "./product-card-skeleton";

function toNum(val: unknown): number {
    return Number(val) || 0;
}

export function BestSellingSection() {
    const t = useTranslations("home.bestSelling");
    const tCommon = useTranslations("common");
    const sliderRef = useRef<HTMLDivElement>(null);
    const { data: session } = useSession();
    const router = useRouter();

    const { data, isLoading } = useProducts({
        sortBy: "rating",
        sortOrder: "desc",
        limit: 8,
    });

    const scroll = (dir: "prev" | "next") => {
        if (!sliderRef.current) return;
        const card = sliderRef.current.querySelector("[data-card]") as HTMLElement;
        const amount = card ? card.offsetWidth + 24 : 326;
        sliderRef.current.scrollBy({ left: dir === "next" ? amount : -amount, behavior: "smooth" });
    };

    return (
        <section className="py-16 lg:py-24 bg-background dark:bg-zinc-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-9 items-start">

                    {/* ── Left: Text ── */}
                    <div className="flex flex-col gap-2.5 lg:w-[291px] shrink-0">
                        {/* Eyebrow */}
                        <span className="font-sarabun font-bold text-base uppercase tracking-[0.25em] text-rose-500 dark:text-[#FDCFD4]">
                            {t("eyebrow")}
                        </span>

                        {/* Headline */}
                        <div className="flex flex-col gap-2">
                            <h2
                                className="font-sarabun font-bold text-[30px] leading-[100%] tracking-normal align-middle text-primary-700 dark:text-[#A6252A]"
                            >
                                {t.rich("title", {
                                    pink: (chunks) => <span className="text-[#FF668B] dark:text-[#FDCFD4]">{chunks}</span>
                                })}
                            </h2>
                            <p
                                className="font-sarabun font-normal text-base leading-[120%] mt-2 text-muted-foreground dark:text-[#D1D1D6]/70"
                            >
                                {t("subtitle")}
                            </p>
                        </div>

                        {/* CTA */}
                        <Link
                            href="/products"
                            className="mt-12 inline-flex items-center gap-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-[#FDCFD4] dark:hover:bg-[#FDCFD4]/90 text-white dark:text-[#4A1519] font-sarabun text-base px-4 py-2.5 rounded-[10px] w-fit transition-colors"
                        >
                            {tCommon("exploreGifts")}
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>

                    {/* ── Right: Slider ── */}
                    <div className="relative flex-1 min-w-0">
                        {/* Prev */}
                        <button
                            onClick={() => scroll("prev")}
                            aria-label="Previous"
                            className="absolute -start-[19px] top-1/2 -translate-y-1/2 z-10 size-[38px] flex items-center justify-center bg-primary-600 hover:bg-primary-700 dark:bg-[#A6252A] dark:hover:bg-[#4A1519] rounded-full shadow-[0_0_40px_5px_rgba(0,0,0,0.05)] transition-colors"
                        >
                            <ChevronLeft className="size-5 text-primary-50" />
                        </button>

                        {/* Cards */}
                        <div
                            ref={sliderRef}
                            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 no-scrollbar"
                        >
                            {isLoading
                                ? Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} data-card className="snap-start shrink-0 w-[302px]">
                                        <ProductCardSkeleton />
                                    </div>))
                                : (data?.data ?? []).map((product) => {
                                    const price = toNum(product.price);
                                    const discountVal = toNum(product.discountValue);
                                    const isOutOfStock = product.stock === 0;

                                    const discounted =
                                        product.discountType === "PERCENT"
                                            ? price - (price * discountVal) / 100
                                            : product.discountType === "FIXED"
                                                ? price - discountVal
                                                : null;

                                    const discountLabel =
                                        product.discountType === "PERCENT"
                                            ? `-${discountVal}% OFF`
                                            : product.discountType === "FIXED"
                                                ? `-${discountVal} EGP`
                                                : null;

                                    return (
                                        <div
                                            key={product.id}
                                            data-card
                                            className="snap-start shrink-0 w-[302px] flex flex-col gap-4 rounded-2xl"
                                        >
                                            {/* Cover */}
                                            <div className="relative h-[272px] w-full rounded-xl overflow-hidden">
                                                <Image
                                                    src={product.cover}
                                                    alt={product.title}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = "/images/placeholder.svg";
                                                    }}
                                                />
                                                {/* Badges — top end */}
                                                <div className="absolute top-2.5 end-2.5 flex gap-1.5">
                                                    {/* NEW badge — light */}
                                                    {product.discountType && !isOutOfStock && (
                                                        <span className="bg-muted dark:bg-[#3A393E] text-muted-foreground dark:text-[#D1D1D6] text-xs font-sarabun font-medium px-2 py-0.5 rounded-full">
                                                            NEW
                                                        </span>
                                                    )}
                                                    {/* HOT badge — light maroon */}
                                                    {toNum(product.rating) >= 4.5 && !isOutOfStock && (
                                                        <span className="bg-primary-50 text-primary-600 dark:bg-[#FDF0F1] dark:text-[#A6252A] text-xs font-sarabun font-medium px-2 py-0.5 rounded-full">
                                                            HOT
                                                        </span>
                                                    )}
                                                    {/* Discount badge — red */}
                                                    {discountLabel && !isOutOfStock && (
                                                        <span className="bg-red-600 text-rose-50 text-xs font-sarabun font-medium px-2 py-0.5 rounded-full">
                                                            {discountLabel}
                                                        </span>
                                                    )}
                                                    {/* Out of stock badge */}
                                                    {isOutOfStock && (
                                                        <span className="bg-red-600 text-rose-50 text-xs font-sarabun font-medium px-2 py-0.5 rounded-full">
                                                            OUT OF STOCK
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div className="flex items-end justify-between gap-2">
                                                <div className="flex flex-col gap-3 flex-1 min-w-0">
                                                    {/* Title */}
                                                    <h3 className="font-sarabun font-semibold text-lg leading-none text-primary-700 dark:text-[#FDCFD4] truncate">
                                                        {product.title}
                                                    </h3>

                                                    {/* Rating + Price */}
                                                    <div className="flex flex-col gap-1">
                                                        {/* Stars */}
                                                        <div className="flex items-center gap-1">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`size-3.5 ${i < Math.round(toNum(product.rating))
                                                                        ? "fill-[#FBA707] text-[#FBA707]"
                                                                        : "fill-border text-border dark:fill-[#3A393E] dark:text-[#3A393E]"
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>

                                                        {/* Price */}
                                                        <div className="flex items-baseline gap-2 font-sarabun font-medium text-base text-primary-700 dark:text-[#FDCFD4]">
                                                            <span>
                                                                {discounted ? discounted.toFixed(2) : price.toFixed(2)} EGP
                                                            </span>
                                                            {discounted && (
                                                                <span className="text-sm text-muted-foreground dark:text-[#D1D1D6]/60 line-through">
                                                                    {price.toFixed(2)} EGP
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Add to cart */}
                                                <button
                                                    disabled={isOutOfStock}
                                                    onClick={() => {
                                                        if (!session) {
                                                            router.push("/login");
                                                        }
                                                    }}
                                                    className="shrink-0 size-[42px] flex items-center justify-center bg-primary-600 hover:bg-primary-700 dark:bg-[#A6252A] dark:hover:bg-[#4A1519] disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow-[0_0_40px_5px_rgba(0,0,0,0.05)] transition-colors"
                                                >
                                                    <ShoppingCart className="size-5 text-primary-50" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div>

                        {/* Next */}
                        <button
                            onClick={() => scroll("next")}
                            aria-label="Next"
                            className="absolute -end-[19px] top-1/2 -translate-y-1/2 z-10 size-[38px] flex items-center justify-center bg-primary-600 hover:bg-primary-700 dark:bg-[#A6252A] dark:hover:bg-[#4A1519] rounded-full shadow-[0_0_40px_5px_rgba(0,0,0,0.05)] transition-colors"
                        >
                            <ChevronRight className="size-5 text-primary-50" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}