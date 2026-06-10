"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight, Eye, Heart, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import { useProducts } from "@/features/products/hooks";
import { ProductCardSkeleton } from "@/features/home/components/product-card-skeleton";
import { useOccasions } from "@/features/occasions/hooks";

function toNum(val: unknown): number {
    return Number(val) || 0;
}

export function MostPopularSection() {
    const t = useTranslations("home.mostPopular");
    const tCommon = useTranslations("common");
    const [activeOccasionId, setActiveOccasionId] = useState<string | undefined>(undefined);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const { data: session } = useSession();
    const router = useRouter();

    const { data: occasionsData } = useOccasions({ limit: 6 });
    const { data, isLoading } = useProducts({
        occasionId: activeOccasionId,
        sortBy: "rating",
        sortOrder: "desc",
        limit: 12,
    });

    return (
        <section className="w-full py-10 lg:py-16 dark:bg-zinc-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
                    {/* Title */}
                    <div className="relative">
                        {/* Pink highlight behind text */}
                        <div className="absolute bottom-0 left-0 h-[17px] w-[154px] bg-[#FFE0E7] dark:bg-[#4A1519]/40 rounded-r-[20px]" />
                        {/* Underline */}
                        <div className="absolute -bottom-[2px] inset-s-0 h-[2px] w-[60px] bg-[#A6252A] dark:bg-[#FDCFD4]" />
                        <h2 className="relative font-sarabun font-bold text-[36px] leading-[100%] text-[#A6252A] dark:text-[#FDCFD4] z-10">
                            {t("title")}
                        </h2>
                    </div>

                    {/* Occasions Filter */}
                    <div className="flex items-center gap-6 overflow-x-auto pb-1 no-scrollbar">
                        <button
                            onClick={() => setActiveOccasionId(undefined)}
                            className={`shrink-0 font-sarabun font-medium text-base leading-[100%] transition-colors whitespace-nowrap ${activeOccasionId === undefined ? "text-[#A6252A] dark:text-[#FDCFD4]" : "text-zinc-700 dark:text-muted-foreground hover:text-[#A6252A] dark:hover:text-[#FDCFD4]"
                                }`}
                        >
                            {t("all")}
                        </button>
                        {occasionsData?.data.map((occ) => (
                            <button
                                key={occ.id}
                                onClick={() => setActiveOccasionId(occ.id)}
                                className={`shrink-0 font-sarabun font-medium text-base leading-[100%] transition-colors whitespace-nowrap ${activeOccasionId === occ.id ? "text-[#A6252A] dark:text-[#FDCFD4]" : "text-zinc-700 dark:text-muted-foreground hover:text-[#A6252A] dark:hover:text-[#FDCFD4]"
                                    }`}
                            >
                                {occ.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {isLoading
                        ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
                        : (data?.data ?? []).map((product) => {
                            const price = toNum(product.price);
                            const discountVal = toNum(product.discountValue);
                            const isOutOfStock = product.stock === 0;
                            const isHot = toNum(product.rating) >= 4.5;

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
                                    className="flex flex-col gap-4 w-full rounded-2xl"
                                    onMouseEnter={() => setHoveredId(product.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                >
                                    {/* Cover */}
                                    <div className="relative h-[272px] w-full rounded-xl overflow-hidden">
                                        <Image
                                            src={product.cover}
                                            alt={product.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            unoptimized
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "/images/placeholder.svg";
                                            }}
                                        />

                                        {/* Badges — top end */}
                                        <div className="absolute top-2.5 end-2.5 flex gap-1.5 flex-wrap justify-end">
                                            {isHot && !isOutOfStock && (
                                                <span className="bg-[#FFE0E7] text-[#A6252A] dark:bg-[#4A1519] dark:text-[#FDCFD4] text-[12px] font-sarabun font-medium px-2 py-0.5 rounded-full leading-[100%]">
                                                    HOT
                                                </span>
                                            )}
                                            {discountLabel && !isOutOfStock && (
                                                <span className="bg-[#FBEAEA] text-[#A6252A] dark:bg-[#FDCFD4] dark:text-[#4A1519] text-[12px] font-sarabun font-medium px-2 py-0.5 rounded-full leading-[100%]">
                                                    NEW
                                                </span>
                                            )}
                                            {isOutOfStock && (
                                                <span className="bg-[#A6252A] text-white text-[12px] font-sarabun font-medium px-2 py-0.5 rounded-full leading-[100%]">
                                                    OUT OF STOCK
                                                </span>
                                            )}
                                        </div>

                                        {/* Hover overlay with actions */}
                                        {hoveredId === product.id && (
                                            <div className="absolute inset-0 bg-[rgba(166,37,42,0.4)] flex items-center justify-center gap-2.5 z-10 transition-opacity duration-200">
                                                <button
                                                    onClick={() => {
                                                        if (!session) {
                                                            router.push("/login");
                                                        }
                                                    }}
                                                    className="w-[30px] h-[30px] bg-card rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                                                >
                                                    <Heart className="size-5 text-[#A6252A] dark:text-[#FDCFD4]" />
                                                </button>
                                                <Link
                                                    href={`/products/${product.id}`}
                                                    className="w-[30px] h-[30px] bg-card rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                                                >
                                                    <Eye className="size-5 text-[#A6252A] dark:text-[#FDCFD4]" />
                                                </Link>
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex items-end justify-between gap-2">
                                        <div className="flex flex-col gap-3 flex-1 min-w-0">
                                            {/* Title */}
                                            <h3 className="font-sarabun font-semibold text-[18px] leading-[100%] text-[#A6252A] dark:text-[#FDCFD4] truncate">
                                                {product.title}
                                            </h3>

                                            {/* Rating + Price */}
                                            <div className="flex flex-col gap-1">
                                                {/* Stars */}
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`size-[15px] ${i < Math.round(toNum(product.rating))
                                                                ? "fill-[#FBA707] text-[#FBA707]"
                                                                : "fill-border text-border"
                                                                }`}
                                                        />
                                                    ))}
                                                </div>

                                                {/* Price */}
                                                <div className="flex items-end gap-2 font-sarabun font-medium text-[16px] leading-[100%] text-[#A6252A] dark:text-[#FDCFD4]">
                                                    <span>
                                                        {discounted ? discounted.toFixed(2) : price.toFixed(2)} EGP
                                                    </span>
                                                    {discounted && (
                                                        <span className="text-sm text-muted-foreground line-through">
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
                        })}
                </div>

                {/* View More */}
                <div className="flex justify-end mt-10">
                    <Link
                        href="/products"
                        className="flex items-center gap-2.5 font-sarabun font-semibold text-[16px] leading-[100%] text-[#A6252A] dark:text-[#FDCFD4] hover:opacity-80 transition-opacity"
                    >
                        {tCommon("viewMore")}
                        <ArrowRight className="size-5 text-[#A6252A] dark:text-[#FDCFD4]" />
                    </Link>
                </div>
            </div>
        </section>
    );
}