"use client";

import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { Heart, ShoppingCart, Star, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { Product } from "@/features/products/types";
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from "@/features/wishlist/hooks";
import { useAddToCart } from "@/features/cart/hooks";
import { toast } from "sonner";

type ProductCardProps = {
    product: Product;
};

function toNum(val: unknown): number {
    return Number(val) || 0;
}

export function ProductCard({ product }: ProductCardProps) {
    const t = useTranslations("common");
    const tProducts = useTranslations("products");
    const locale = useLocale();
    const router = useRouter();
    const { data: session } = useSession();

    const { data: wishlistData } = useWishlist();
    const addToWishlistMutation = useAddToWishlist();
    const removeFromWishlistMutation = useRemoveFromWishlist();
    const addToCartMutation = useAddToCart();

    const price = toNum(product.price);
    const discountVal = toNum(product.discountValue);
    const isOutOfStock = product.stock === 0;

    const discounted =
        product.discountType === "PERCENT"
            ? price - (price * discountVal) / 100
            : product.discountType === "FIXED"
                ? price - discountVal
                : null;

    const isInWishlist = wishlistData?.data?.some((wishlistItem) => wishlistItem.id === product.id) || false;
    const isWishlistLoading = addToWishlistMutation.isPending || removeFromWishlistMutation.isPending;

    const handleWishlistClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            router.push("/login");
            return;
        }

        if (isInWishlist) {
            removeFromWishlistMutation.mutate(product.id, {
                onSuccess: () => {
                    toast.success(t("removedFromWishlist"));
                },
                onError: (err) => {
                    toast.error(err.message || "Failed to remove from wishlist");
                },
            });
        } else {
            addToWishlistMutation.mutate(product.id, {
                onSuccess: () => {
                    toast.success(t("addedToWishlist"));
                },
                onError: (err) => {
                    toast.error(err.message || "Failed to add to wishlist");
                },
            });
        }
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            router.push("/login");
            return;
        }

        addToCartMutation.mutate(
            { productId: product.id, quantity: 1 },
            {
                onSuccess: () => {
                    toast.success(t("addedToCart"));
                },
                onError: (err) => {
                    toast.error(err.message || "Failed to add to cart");
                },
            }
        );
    };

    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://rose-app.elevate-bootcamp.cloud";
    const imageUrl = product.cover?.startsWith("http")
        ? product.cover
        : `${BASE_URL}${product.cover}`;

    return (
        <div className="group relative w-[302px] h-[397px] bg-white dark:bg-zinc-900 rounded-2xl p-4 flex flex-col gap-4 transition-all duration-300">
            <div className="relative w-[270px] h-[272px] rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-800">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="270px"
                        unoptimized
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/placeholder.svg";
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">
                        {tProducts("noImage")}
                    </div>
                )}

                <div className="absolute top-2.5 left-2.5 flex flex-row items-center gap-1.5 z-10 pointer-events-none">
                    {toNum(product.rating) >= 4.5 && !isOutOfStock && (
                        <div className="flex justify-center items-center px-2 py-0.5 bg-primary-50 rounded-full h-4">
                            <span className="font-sarabun font-medium text-xs leading-none text-primary-600">
                                {tProducts("hot")}
                            </span>
                        </div>
                    )}
                    {isOutOfStock && (
                        <div className="flex justify-center items-center px-2 py-0.5 bg-red-600 rounded-full h-4">
                            <span className="font-sarabun font-medium text-xs leading-none text-rose-50">
                                {tProducts("outOfStock")}
                            </span>
                        </div>
                    )}
                    {product.discountType && !isOutOfStock && (
                        <div className="flex justify-center items-center px-2 py-0.5 bg-zinc-100 rounded-full h-4">
                            <span className="font-sarabun font-medium text-xs leading-none text-zinc-700">
                                {tProducts("new")}
                            </span>
                        </div>
                    )}
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <button
                        aria-label={t("addToWishlist")}
                        disabled={isWishlistLoading}
                        onClick={handleWishlistClick}
                        className="flex flex-row justify-center items-center px-1.5 py-0 gap-1.5 h-[30px] bg-white rounded-full shadow-md hover:bg-zinc-50 transition-colors border-none cursor-pointer"
                    >
                        {isWishlistLoading ? (
                            <Loader2 className="size-5 animate-spin text-primary-600" />
                        ) : (
                            <Heart
                                className={`size-5 ${isInWishlist ? "fill-primary-600 text-primary-600" : "text-primary-600"}`}
                                strokeWidth={1.5}
                            />
                        )}
                        <span className="font-sarabun font-medium text-xs leading-none text-primary-600 whitespace-nowrap">
                            {isInWishlist
                                ? t("removeFromWishlist")
                                : t("addToWishlist")
                            }
                        </span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col justify-end items-start w-[270px] gap-3 flex-1">
                <Link href={`/products/${product.id}`} className="block w-full">
                    <h3 className="font-sarabun font-semibold text-lg leading-none text-primary-700 dark:text-primary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate">
                        {product.title}
                    </h3>
                </Link>

                <div className="flex flex-row items-center w-full gap-2.5">
                    <div className="flex flex-col items-start flex-1 gap-1.5">
                        <div className="flex flex-row items-center gap-1 h-[15px]">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Star
                                    key={index}
                                    className={`size-4 ${index < Math.round(toNum(product.rating))
                                        ? "fill-yellow-500 text-yellow-500"
                                        : "fill-transparent text-yellow-500"
                                        }`}
                                    strokeWidth={1.5}
                                />
                            ))}
                        </div>

                        <div className="flex flex-row items-end gap-2 w-full font-sarabun font-medium text-base leading-none text-primary-700 dark:text-primary-300">
                            <span>{discounted ? discounted.toFixed(2) : price.toFixed(2)} {t("currency")}</span>
                            {discounted && (
                                <span className="line-through opacity-70">
                                    {price.toFixed(2)} {t("currency")}
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        aria-label={t("addToCart")}
                        disabled={isOutOfStock || addToCartMutation.isPending}
                        onClick={handleAddToCart}
                        className="flex items-center justify-center size-10 bg-primary-600 shadow-[0_0_40px_5px_rgba(0,0,0,0.05)] hover:scale-105 disabled:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-all duration-200 focus:outline-none border-none cursor-pointer shrink-0"
                    >
                        {addToCartMutation.isPending ? (
                            <Loader2 className="size-6 animate-spin text-white" />
                        ) : (
                            <ShoppingCart className="size-6 text-primary-50" strokeWidth={1.5} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}