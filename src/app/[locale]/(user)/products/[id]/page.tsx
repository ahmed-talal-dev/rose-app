"use client";

import {  useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useProduct, useProducts } from "@/features/products/hooks";
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from "@/features/wishlist/hooks";
import { useAddToCart } from "@/features/cart/hooks";
import { useReviews, useCreateReview } from "@/features/reviews/hooks";
import { useSession } from "next-auth/react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ProductGallery } from "@/features/products/components/ProductGallery";
import { ProductInfo } from "@/features/products/components/ProductInfo";
import { ProductReviews, ExtendedReview } from "@/features/products/components/ProductReviews";
import { RelatedProducts } from "@/features/products/components/RelatedProducts";
import { Product } from "@/features/products/types";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://rose-app.elevate-bootcamp.cloud";

function parseToNumber(val: unknown): number {
    return Number(val) || 0;
}

export default function ProductDetailPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const t = useTranslations("products");
    const tCommon = useTranslations("common");
    const { data: session } = useSession();

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Reviews form states
    const [rating, setRating] = useState(5);
    const [reviewTitle, setReviewTitle] = useState("");
    const [reviewBody, setReviewBody] = useState("");

    // Fetch product details
    const { data: product, isLoading, isError } = useProduct(id);

    // Fetch related products in the same category
    const { data: relatedData } = useProducts({
        categoryId: product?.categoryId,
        limit: 10,
    });

    // Fetch reviews
    const { data: reviewsData } = useReviews({ productId: id });

    // Hooks for Wishlist, Cart, and Reviews
    const { data: wishlistData } = useWishlist();
    const addToWishlistMutation = useAddToWishlist();
    const removeFromWishlistMutation = useRemoveFromWishlist();
    const addToCartMutation = useAddToCart();
    const createReviewMutation = useCreateReview(id);

    const isWishlistPending = addToWishlistMutation.isPending || removeFromWishlistMutation.isPending;

    if (isLoading) {
        return (
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
                <span className="font-sarabun text-sm text-zinc-500 dark:text-zinc-400">
                    {tCommon("loading")}
                </span>
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center">
                <h3 className="font-sarabun text-xl font-bold text-zinc-800 dark:text-zinc-200">
                    {t("notFoundTitle") || "Product Not Found"}
                </h3>
                <p className="mt-2 font-sarabun text-zinc-500 dark:text-zinc-400">
                    {t("notFoundSubtitle") || "The product you are looking for does not exist or has been removed."}
                </p>
                <Link
                    href="/products"
                    className="mt-6 rounded-xl bg-primary-600 px-5 py-2.5 font-sarabun text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                >
                    {t("backToProducts") || "Back to Products"}
                </Link>
            </div>
        );
    }

    const price = parseToNumber(product.price);
    const discountVal = parseToNumber(product.discountValue);
    const isOutOfStock = product.stock === 0;

    const discountedPrice =
        product.discountType === "PERCENT"
            ? price - (price * discountVal) / 100
            : product.discountType === "FIXED"
            ? price - discountVal
            : null;

    const discountLabel =
        product.discountType === "PERCENT"
            ? `-${discountVal}% OFF`
            : product.discountType === "FIXED"
            ? `-${discountVal} ${tCommon("currency")}`
            : null;

    const isInWishlist = wishlistData?.data?.some((wishlistItem) => wishlistItem.id === product.id) || false;

    const handleWishlistToggle = () => {
        if (!session) {
            router.push("/login");
            return;
        }

        if (isInWishlist) {
            removeFromWishlistMutation.mutate(product.id, {
                onSuccess: () => {
                    toast.success(tCommon("removedFromWishlist"));
                },
                onError: (error: unknown) => {
                    const message = error instanceof Error ? error.message : "Failed to update wishlist";
                    toast.error(message);
                },
            });
        } else {
            addToWishlistMutation.mutate(product.id, {
                onSuccess: () => {
                    toast.success(tCommon("addedToWishlist"));
                },
                onError: (error: unknown) => {
                    const message = error instanceof Error ? error.message : "Failed to update wishlist";
                    toast.error(message);
                },
            });
        }
    };

    const handleAddToCart = () => {
        if (!session) {
            router.push("/login");
            return;
        }

        addToCartMutation.mutate(
            { productId: product.id, quantity: 1 },
            {
                onSuccess: () => {
                    toast.success(tCommon("addedToCart"));
                },
                onError: (error: unknown) => {
                    const message = error instanceof Error ? error.message : "Failed to add to cart";
                    toast.error(message);
                },
            }
        );
    };

    const handleAddReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) {
            router.push("/login");
            return;
        }

        if (!reviewBody.trim()) {
            toast.error(t("reviewCommentRequired"));
            return;
        }

        const combinedComment = `Title: ${reviewTitle.trim()}\nReview: ${reviewBody.trim()}`;

        createReviewMutation.mutate(
            {
                productId: product.id,
                rating,
                comment: combinedComment,
            },
            {
                onSuccess: () => {
                    toast.success(t("reviewSuccess"));
                    setRating(5);
                    setReviewTitle("");
                    setReviewBody("");
                },
                onError: (error: unknown) => {
                    const message = error instanceof Error ? error.message : "Failed to add review";
                    toast.error(message);
                },
            }
        );
    };

    const resolveImageUrl = (imageUrl: string) => {
        if (!imageUrl) return "/images/placeholder.svg";
        return imageUrl.startsWith("http") ? imageUrl : `${BASE_URL}${imageUrl}`;
    };

    const relatedProducts =
        (relatedData?.data as { id: string }[] | undefined)
            ?.filter((p) => p.id !== product.id)
            .slice(0, 8) || [];

    const reviewsList = (reviewsData?.data ?? []) as ExtendedReview[];

    return (
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-12 py-8 px-4 sm:px-6 lg:gap-16 lg:px-0 md:py-12">
            <div className="flex justify-start shrink-0">
                <Link
                    href="/products"
                    className="flex items-center gap-2 font-sarabun text-sm font-medium text-zinc-500 transition-colors hover:text-primary-700 dark:text-zinc-400 dark:hover:text-rose-300"
                >
                    <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                    <span>{t("backToProducts") || "Back to Products"}</span>
                </Link>
            </div>

            <div className="flex w-full flex-col lg:h-[523px] lg:w-[1280px] lg:flex-row lg:items-center gap-6 lg:gap-[70px] shrink-0 text-start">
                <ProductGallery
                    product={product}
                    selectedImage={selectedImage}
                    onSelectImage={setSelectedImage}
                    discountLabel={discountLabel}
                    isOutOfStock={isOutOfStock}
                    resolveImageUrl={resolveImageUrl}
                />

                <ProductInfo
                    product={product}
                    discountedPrice={discountedPrice}
                    originalPrice={price}
                    isInWishlist={isInWishlist}
                    isWishlistPending={isWishlistPending}
                    isAddToCartPending={addToCartMutation.isPending}
                    onWishlistToggle={handleWishlistToggle}
                    onAddToCart={handleAddToCart}
                />
            </div>

            <ProductReviews
                reviews={reviewsList}
                isLoggedIn={!!session}
                rating={rating}
                onSetRating={setRating}
                reviewTitle={reviewTitle}
                onSetReviewTitle={setReviewTitle}
                reviewBody={reviewBody}
                onSetReviewBody={setReviewBody}
                onSubmitReview={handleAddReview}
                isSubmitting={createReviewMutation.isPending}
                productRating={parseToNumber(product.rating)}
                ratingsCount={product.ratings || 0}
            />

            <RelatedProducts products={relatedProducts as unknown as Product[]} />
        </div>
    );
}
