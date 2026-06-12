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
    const locale = useLocale();
    const router = useRouter();
    const { data: session } = useSession();

    const { data: wishlistData } = useWishlist();
    const addToWishlistMutation = useAddToWishlist();
    const removeFromWishlistMutation = useRemoveFromWishlist();
    const addToCartMutation = useAddToCart();

    // Log the product data received by the component
    console.log(`[ProductCard Rendered] Title: ${product.title}`, product);

    const price = toNum(product.price);
    const discountVal = toNum(product.discountValue);
    const isOutOfStock = product.stock === 0;

    const discounted =
        product.discountType === "PERCENT"
            ? price - (price * discountVal) / 100
            : product.discountType === "FIXED"
                ? price - discountVal
                : null;

    const isInWishlist = wishlistData?.data?.some((item) => item.id === product.id) || false;
    const isWishlistLoading = addToWishlistMutation.isPending || removeFromWishlistMutation.isPending;

    const handleWishlistClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            console.log("[Wishlist Action] User not logged in, redirecting to login...");
            router.push("/login");
            return;
        }

        console.log(`[Wishlist Action] Toggling wishlist for Product ID: ${product.id}`);

        if (isInWishlist) {
            removeFromWishlistMutation.mutate(product.id, {
                onSuccess: (data) => {
                    console.log("[Wishlist Success] Removed successfully", data);
                    toast.success(locale === "ar" ? "تمت الإزالة من المفضلة!" : "Removed from wishlist!");
                },
                onError: (err) => {
                    console.error("[Wishlist Error] Failed to remove", err);
                    toast.error(err.message || "Failed to remove from wishlist");
                },
            });
        } else {
            addToWishlistMutation.mutate(product.id, {
                onSuccess: (data) => {
                    console.log("[Wishlist Success] Added successfully", data);
                    toast.success(locale === "ar" ? "تمت الإضافة إلى المفضلة!" : "Added to wishlist!");
                },
                onError: (err) => {
                    console.error("[Wishlist Error] Failed to add", err);
                    toast.error(err.message || "Failed to add to wishlist");
                },
            });
        }
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            console.log("[Cart Action] User not logged in, redirecting to login...");
            router.push("/login");
            return;
        }

        console.log(`[Cart Action] Attempting to add Product ID: ${product.id} to cart`);

        addToCartMutation.mutate(
            { productId: product.id, quantity: 1 },
            {
                onSuccess: (data) => {
                    console.log("[Cart Success] Added to cart successfully!", data);
                    toast.success(locale === "ar" ? "تمت إضافة المنتج إلى السلة!" : "Product added to cart!");
                },
                onError: (err) => {
                    console.error("[Cart Error] Failed to add to cart", err);
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

            {/* Image Cover Container */}
            <div className="relative w-[270px] h-[272px] rounded-[12px] overflow-hidden bg-zinc-50 dark:bg-zinc-800">
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
                        No Image
                    </div>
                )}

                {/* Top-left Badges */}
                <div className="absolute top-[10px] left-[10px] flex flex-row items-center gap-[6px] z-10 pointer-events-none">
                    {toNum(product.rating) >= 4.5 && !isOutOfStock && (
                        <div className="flex justify-center items-center px-[8px] py-[2px] bg-[#FBEAEA] rounded-full h-[16px]">
                            <span className="font-sarabun font-medium text-[12px] leading-none text-[#A6252A]">
                                HOT
                            </span>
                        </div>
                    )}
                    {isOutOfStock && (
                        <div className="flex justify-center items-center px-[8px] py-[2px] bg-[#DC2626] rounded-full h-[16px]">
                            <span className="font-sarabun font-medium text-[12px] leading-none text-[#FFF1F5]">
                                OUT OF STOCK
                            </span>
                        </div>
                    )}
                    {product.discountType && !isOutOfStock && (
                        <div className="flex justify-center items-center px-[8px] py-[2px] bg-zinc-100 rounded-full h-[16px]">
                            <span className="font-sarabun font-medium text-[12px] leading-none text-zinc-700">
                                NEW
                            </span>
                        </div>
                    )}
                </div>

                {/* Hover Wishlist Pill Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <button
                        aria-label={t("addToWishlist")}
                        disabled={isWishlistLoading}
                        onClick={handleWishlistClick}
                        className="flex flex-row justify-center items-center px-[6px] py-0 gap-[6px] h-[30px] bg-white rounded-[1000px] shadow-md hover:bg-zinc-50 transition-colors border-none cursor-pointer"
                    >
                        {isWishlistLoading ? (
                            <Loader2 className="w-[20px] h-[20px] animate-spin text-[#A6252A]" />
                        ) : (
                            <Heart
                                className={`w-[20px] h-[20px] ${isInWishlist ? "fill-[#A6252A] text-[#A6252A]" : "text-[#A6252A]"}`}
                                strokeWidth={1.5}
                            />
                        )}
                        <span className="font-sarabun font-medium text-[12px] leading-none text-[#A6252A] whitespace-nowrap">
                            {isInWishlist
                                ? (locale === "ar" ? "إزالة من المفضلة" : "Remove from Wishlist")
                                : (locale === "ar" ? "أضف إلى المفضلة" : "Add to Wishlist")
                            }
                        </span>
                    </button>
                </div>
            </div>

            {/* Product Details */}
            <div className="flex flex-col justify-end items-start w-[270px] gap-[12px] flex-1">

                <Link href={`/products/${product.id}`} className="block w-full">
                    <h3 className="font-sarabun font-semibold text-[18px] leading-none text-[#741C21] dark:text-[#E07A7D] hover:text-[#A6252A] dark:hover:text-[#D75458] transition-colors truncate">
                        {product.title}
                    </h3>
                </Link>

                <div className="flex flex-row items-center w-full gap-[10px]">
                    <div className="flex flex-col items-start flex-1 gap-[6px]">

                        <div className="flex flex-row items-center gap-[4px] h-[15px]">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-[16.88px] h-[15px] ${i < Math.round(toNum(product.rating))
                                            ? "fill-[#FBA707] text-[#FBA707]"
                                            : "fill-transparent text-[#FBA707]"
                                        }`}
                                    strokeWidth={1.5}
                                />
                            ))}
                        </div>

                        <div className="flex flex-row items-end gap-[8px] w-full font-sarabun font-medium text-[16px] leading-none text-[#741C21] dark:text-[#E07A7D]">
                            <span>{discounted ? discounted.toFixed(2) : price.toFixed(2)} EGP</span>
                            {discounted && (
                                <span className="line-through opacity-70">
                                    {price.toFixed(2)} EGP
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        aria-label={t("addToCart")}
                        disabled={isOutOfStock || addToCartMutation.isPending}
                        onClick={handleAddToCart}
                        className="flex items-center justify-center w-[42px] h-[42px] bg-[#A6252A] shadow-[0_0_40px_5px_rgba(0,0,0,0.05)] hover:scale-105 disabled:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-all duration-200 focus:outline-none border-none cursor-pointer shrink-0"
                    >
                        {addToCartMutation.isPending ? (
                            <Loader2 className="w-[24px] h-[24px] animate-spin text-white" />
                        ) : (
                            <ShoppingCart className="w-[24px] h-[24px] text-[#FBEAEA]" strokeWidth={1.5} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}