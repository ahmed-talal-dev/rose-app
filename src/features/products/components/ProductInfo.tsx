"use client";

import { useTranslations } from "next-intl";
import { Star, Package, Heart, ShoppingCart, Loader2 } from "lucide-react";
import { Product } from "@/features/products/types";

interface ProductInfoProps {
    product: Product;
    discountedPrice: number | null;
    originalPrice: number;
    isInWishlist: boolean;
    isWishlistPending: boolean;
    isAddToCartPending: boolean;
    onWishlistToggle: () => void;
    onAddToCart: () => void;
}

export function ProductInfo({
    product,
    discountedPrice,
    originalPrice,
    isInWishlist,
    isWishlistPending,
    isAddToCartPending,
    onWishlistToggle,
    onAddToCart,
}: ProductInfoProps) {
    const t = useTranslations("products");
    const tCommon = useTranslations("common");

    const isOutOfStock = product.stock === 0;

    const handleScrollToReviews = () => {
        const reviewsSection = document.getElementById("reviews-section");
        if (reviewsSection) {
            const offsetTop = reviewsSection.offsetTop;
            window.scrollTo({
                top: offsetTop - 80,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="flex w-full flex-col items-start gap-4 lg:h-[523px] lg:w-[605px] font-sarabun">
            <div className="flex w-full flex-col items-start gap-2 lg:h-[70px] lg:w-[395px]">
                <h1 className="w-full font-sarabun text-3xl font-semibold leading-none text-zinc-800 dark:text-zinc-100 truncate lg:h-[30px] lg:w-[395px]">
                    {product.title}
                </h1>

                <div className="flex w-full flex-row items-center gap-3.5 lg:h-[32px] lg:w-[357px]">
                    <div className="flex w-[194px] flex-row items-center gap-1.5 lg:h-[30px]">
                        {discountedPrice !== null && (
                            <span className="font-sarabun text-3xl font-bold leading-none text-zinc-300 dark:text-zinc-600 line-through lg:h-[30px]">
                                {originalPrice.toFixed(0)}
                            </span>
                        )}
                        <span className="font-sarabun text-3xl font-bold leading-none text-zinc-800 dark:text-zinc-100 lg:h-[30px]">
                            {(discountedPrice ?? originalPrice).toFixed(2)} {tCommon("currency")}
                        </span>
                    </div>

                    {product.stock > 0 ? (
                        <div className="flex h-8 w-[149px] flex-row items-center justify-center gap-1.5 rounded-2xl bg-zinc-100 px-3 py-1.5 dark:bg-zinc-800">
                            <Package className="h-5 w-5 text-zinc-500 dark:text-zinc-400" strokeWidth={1.5} />
                            <span className="font-sarabun text-sm font-medium leading-none text-zinc-800 dark:text-zinc-300 truncate w-[99px]">
                                {product.stock} {t("leftInStock")}
                            </span>
                        </div>
                    ) : (
                        <div className="flex h-8 w-[149px] flex-row items-center justify-center gap-1.5 rounded-2xl border border-red-200 bg-red-50 px-3 py-1.5 dark:border-red-900/30 dark:bg-red-950/20">
                            <span className="font-sarabun text-sm font-semibold leading-none text-red-600 dark:text-red-400">
                                {t("outOfStock")}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 w-full border-t border-zinc-100 dark:border-zinc-800 lg:w-[605px]" />

            <div className="flex h-5 w-full flex-row items-center gap-1.5 lg:w-[605px]">
                <Star className="h-5 w-5 fill-[#FFA508] text-[#FFA508]" strokeWidth={1.5} />
                <span className="font-sarabun text-base font-normal leading-none text-zinc-950 dark:text-zinc-300">
                    {t("ratingLabel")} {(Number(product.rating) || 0).toFixed(1)}/5
                </span>
                <button
                    type="button"
                    onClick={handleScrollToReviews}
                    className="h-4 cursor-pointer border-none bg-transparent font-sarabun text-base font-medium leading-none text-blue-600 hover:underline dark:text-blue-400"
                >
                    ({product.ratings || 0} {t("ratings")})
                </button>
            </div>

            <div className="w-full border-t border-zinc-100 dark:border-zinc-800 lg:w-[605px]" />

            <div className="flex w-full flex-1 flex-row justify-center items-start gap-2.5 lg:w-[605px]">
                <p className="w-full font-sarabun text-base font-normal leading-relaxed text-zinc-600 dark:text-zinc-400 lg:w-[605px]">
                    {product.description || t("noDescription") || "No description available."}
                </p>
            </div>

            <div className="mt-auto flex h-[46px] w-full flex-row items-start gap-2.5 lg:w-[605px]">
                <button
                    type="button"
                    onClick={onWishlistToggle}
                    disabled={isWishlistPending}
                    className={`flex h-[46px] w-[49px] cursor-pointer flex-row justify-center items-center rounded-lg border-none bg-zinc-100 p-2.5 transition-colors dark:bg-zinc-800 ${
                        isInWishlist ? "bg-red-50 dark:bg-red-950/20" : ""
                    }`}
                    aria-label={tCommon("addToWishlist")}
                >
                    {isWishlistPending ? (
                        <Loader2 className="h-5 w-5 animate-spin text-zinc-800 dark:text-white" />
                    ) : (
                        <Heart
                            className={`h-6 w-6 transition-colors ${
                                isInWishlist
                                    ? "fill-primary-600 text-primary-600 dark:fill-rose-400 dark:text-rose-400"
                                    : "text-zinc-800 dark:text-zinc-200"
                            }`}
                            strokeWidth={1.75}
                        />
                    )}
                </button>

                <button
                    type="button"
                    onClick={onAddToCart}
                    disabled={isOutOfStock || isAddToCartPending}
                    className="flex h-[46px] w-full cursor-pointer flex-row justify-center items-center gap-2.5 rounded-lg border-none bg-primary-600 px-4 py-2.5 text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:opacity-50 lg:w-[546px]"
                >
                    {isAddToCartPending ? (
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                    ) : (
                        <>
                            <ShoppingCart className="h-6 w-6 text-white" strokeWidth={1.75} />
                            <span className="font-sarabun text-base font-medium leading-none text-white text-center">
                                {tCommon("addToCart")}
                            </span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
