"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Product } from "@/features/products/types";

type ProductCardProps = {
    product: Product;
};

function getDiscountedPrice(product: Product): number | null {
    const price = Number(product.price);
    const discountValue = product.discountValue ? Number(product.discountValue) : null;
    if (isNaN(price)) return null;
    if (!product.discountType || !discountValue) return null;
    if (product.discountType === "PERCENT") {
        return price - (price * discountValue) / 100;
    }
    return price - discountValue;
}

export function ProductCard({ product }: ProductCardProps) {
    const t = useTranslations("common");
    const price = Number(product.price);
    const discountedPrice = getDiscountedPrice(product);

    // دمج الـ Base URL مع رابط الصورة لضمان عملها بشكل صحيح
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://rose-app.elevate-bootcamp.cloud";
    const imageUrl = product.cover?.startsWith("http")
        ? product.cover
        : `${BASE_URL}${product.cover}`;

    return (
        <div className="group relative bg-card dark:bg-transparent rounded-2xl overflow-hidden border border-border dark:border-transparent hover:border-primary-200 dark:hover:border-transparent hover:shadow-xl dark:hover:shadow-none transition-all duration-300">
            {/* Image */}
            <div className="relative overflow-hidden bg-muted aspect-square">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted text-xs">
                        No Image
                    </div>
                )}

                {/* Discount Badge */}
                {product.discountType && product.discountValue && (
                    <span className="absolute top-3 start-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                        {product.discountType === "PERCENT"
                            ? `-${product.discountValue}%`
                            : `-${product.discountValue} EGP`}
                    </span>
                )}

                {/* Out of stock badge */}
                {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                        <span className="bg-card dark:bg-zinc-800 text-card-foreground text-sm font-semibold px-4 py-1.5 rounded-full">
                            Out of Stock
                        </span>
                    </div>
                )}

                {/* Wishlist Button */}
                <button
                    aria-label={t("addToWishlist")}
                    className="absolute top-3 end-3 p-2 bg-card/90 dark:bg-zinc-800/90 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary-50 dark:hover:bg-primary/20 hover:text-primary-500 dark:hover:text-primary z-10"
                >
                    <Heart className="h-4 w-4" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Title */}
                <Link href={`/products/${product.id}`}>
                    <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 hover:text-primary transition-colors mb-2">
                        {product.title}
                    </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-3">
                    <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${i < Math.round(product.rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-border fill-border"
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-muted-foreground">({product.ratings || 0})</span>
                </div>

                {/* Price + Cart */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                        {discountedPrice ? (
                            <>
                                <span className="text-base font-bold text-primary dark:text-foreground">
                                    {discountedPrice.toFixed(2)} EGP
                                </span>
                                <span className="text-xs text-muted-foreground line-through">
                                    {price.toFixed(2)} EGP
                                </span>
                            </>
                        ) : (
                            <span className="text-base font-bold text-foreground">
                                {price.toFixed(2)} EGP
                            </span>
                        )}
                    </div>

                    <button
                        aria-label={t("addToCart")}
                        disabled={product.stock === 0}
                        className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-white text-xs font-medium px-3 py-2 rounded-xl transition-colors"
                    >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{t("addToCart")}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}