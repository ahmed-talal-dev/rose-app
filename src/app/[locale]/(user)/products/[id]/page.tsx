"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useProduct, useProducts } from "@/features/products/hooks";
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from "@/features/wishlist/hooks";
import { useAddToCart } from "@/features/cart/hooks";
import { useReviews, useCreateReview } from "@/features/reviews/hooks";
import { useSession } from "next-auth/react";
import {
    Star,
    ShoppingCart,
    Heart,
    ArrowLeft,
    Loader2,
    Package,
    ChevronLeft,
    ChevronRight,
    MessageSquare,
} from "lucide-react";
import Image from "next/image";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { ProductCard } from "@/features/products/components/product-card";

function toNum(val: unknown): number {
    return Number(val) || 0;
}

export default function ProductDetailPage() {
    const { id } = useParams() as { id: string };
    const locale = useLocale();
    const router = useRouter();
    const t = useTranslations("products");
    const tCommon = useTranslations("common");
    const { data: session } = useSession();

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Reviews form states
    const [rating, setRating] = useState(5);
    const [reviewTitle, setReviewTitle] = useState("");
    const [reviewBody, setReviewBody] = useState("");

    // Slider ref
    const relatedSliderRef = useRef<HTMLDivElement>(null);

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
            <div className="mx-auto max-w-7xl px-4 py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="size-10 animate-spin text-[#A6252A]" />
                <span className="text-zinc-500 dark:text-zinc-400 font-sarabun text-sm">
                    {tCommon("loading")}
                </span>
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-20 text-center flex flex-col items-center">
                <h3 className="font-sarabun font-bold text-xl text-zinc-800 dark:text-zinc-200">
                    {t("notFoundTitle") || "Product Not Found"}
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 font-sarabun mt-2">
                    {t("notFoundSubtitle") || "The product you are looking for does not exist or has been removed."}
                </p>
                <Link
                    href="/products"
                    className="mt-6 px-5 py-2.5 bg-[#A6252A] hover:bg-[#741C21] text-white text-sm font-semibold rounded-xl font-sarabun transition-colors"
                >
                    {t("backToProducts") || "Back to Products"}
                </Link>
            </div>
        );
    }

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

    // Wishlist check
    const isInWishlist = wishlistData?.data?.some((item) => item.id === product.id) || false;

    const handleWishlistToggle = () => {
        if (!session) {
            router.push("/login");
            return;
        }

        if (isInWishlist) {
            removeFromWishlistMutation.mutate(product.id, {
                onSuccess: () => {
                    toast.success(locale === "ar" ? "تمت الإزالة من المفضلة!" : "Removed from wishlist!");
                },
            });
        } else {
            addToWishlistMutation.mutate(product.id, {
                onSuccess: () => {
                    toast.success(locale === "ar" ? "تمت الإضافة إلى المفضلة!" : "Added to wishlist!");
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
                    toast.success(locale === "ar" ? "تمت إضافة المنتج إلى السلة!" : "Added to cart successfully!");
                },
                onError: (err) => {
                    toast.error(err.message || "Failed to add to cart");
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
            toast.error(locale === "ar" ? "برجاء كتابة التعليق" : "Please write a review comment");
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
                    toast.success(locale === "ar" ? "تم إضافة التقييم بنجاح!" : "Review added successfully!");
                    setRating(5);
                    setReviewTitle("");
                    setReviewBody("");
                },
                onError: (err: any) => {
                    toast.error(err.message || "Failed to add review");
                },
            }
        );
    };

    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://rose-app.elevate-bootcamp.cloud";

    const resolveImageUrl = (url: string) => {
        if (!url) return "/images/placeholder.svg";
        return url.startsWith("http") ? url : `${BASE_URL}${url}`;
    };

    const coverUrl = resolveImageUrl(product.cover);
    const galleryImages = [product.cover, ...(product.gallery || [])].filter(Boolean);
    const activeImage = selectedImage || coverUrl;

    // Filter related products
    const relatedProducts =
        relatedData?.data?.filter((p) => p.id !== product.id).slice(0, 8) || [];

    // Parse comment into title and body
    const parseComment = (comment: string = "") => {
        const parts = comment.split("\n");
        if (parts.length > 1) {
            const title = parts[0].replace(/^Title:\s*/i, "").trim();
            const body = parts.slice(1).join("\n").replace(/^Review:\s*/i, "").trim();
            return { title, body };
        }
        return { title: "", body: comment };
    };

    const getUserName = (review: any) => {
        if (review.user) {
            const first = review.user.firstName || "";
            const last = review.user.lastName || "";
            if (first || last) return `${first} ${last}`.trim();
            return review.user.username || review.user.name || "Anonymous User";
        }
        return review.userName || "Anonymous User";
    };

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    const scrollSlider = (direction: "left" | "right") => {
        if (relatedSliderRef.current) {
            const { scrollLeft, clientWidth } = relatedSliderRef.current;
            const scrollAmount = clientWidth * 0.75;
            const target =
                direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
            relatedSliderRef.current.scrollTo({ left: target, behavior: "smooth" });
        }
    };

    const reviewsList = reviewsData?.data ?? [];

    return (
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-0 py-8 md:py-12 flex flex-col gap-12 md:gap-16 w-full">
            {/* Back button */}
            <div className="flex justify-start shrink-0">
                <Link
                    href="/products"
                    className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-[#741C21] dark:hover:text-rose-300 font-sarabun text-sm font-medium transition-colors"
                >
                    <ArrowLeft className="size-4 rtl:rotate-180" />
                    <span>{t("backToProducts") || "Back to Products"}</span>
                </Link>
            </div>

            {/* Split layout: Gallery / Info */}
            <div className="flex flex-col lg:flex-row lg:items-center p-0 gap-6 lg:gap-[70px] w-full lg:w-[1280px] lg:h-[523px] shrink-0 text-start">

                {/* ── Left: Image Gallery ── */}
                <div className="flex flex-col items-start p-0 gap-[10px] w-full lg:w-[605px] lg:h-[523px] shrink-0">
                    <div className="relative w-full lg:w-[605px] h-[300px] sm:h-[402px] lg:h-[402px] rounded-[12px] overflow-hidden bg-zinc-50 dark:bg-zinc-800 border border-zinc-150 dark:border-zinc-800 shrink-0">
                        <Image
                            src={resolveImageUrl(activeImage)}
                            alt={product.title}
                            fill
                            className="object-cover"
                            unoptimized
                            priority
                        />
                        {discountLabel && !isOutOfStock && (
                            <span className="absolute top-4 start-4 bg-red-650 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10 font-sarabun">
                                {discountLabel}
                            </span>
                        )}
                        {isOutOfStock && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                                <span className="bg-red-650 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md font-sarabun">
                                    {t("outOfStock") || "OUT OF STOCK"}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Gallery Thumbnails */}
                    {galleryImages.length > 1 && (
                        <div className="flex flex-row items-center p-0 gap-[10px] w-full lg:w-[605px] lg:h-[111px] overflow-x-auto pb-1.5 scrollbar-hide shrink-0">
                            {galleryImages.map((imgUrl, index) => {
                                const resolved = resolveImageUrl(imgUrl);
                                const isCurrent = activeImage === imgUrl;
                                return (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(imgUrl)}
                                        className={`relative w-[91px] h-[111px] rounded-[8px] overflow-hidden border-2 bg-zinc-50 shrink-0 cursor-pointer transition-colors ${isCurrent
                                            ? "border-[#A6252A]"
                                            : "border-transparent"
                                            }`}
                                    >
                                        <Image
                                            src={resolved}
                                            alt={`${product.title} gallery ${index}`}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Right: Product Details ── */}
                <div className="flex flex-col items-start p-0 gap-4 w-full lg:w-[605px] lg:h-[523px] shrink-0 font-sarabun">

                    {/* Header info */}
                    <div className="flex flex-col items-start p-0 gap-2 w-full lg:w-[395px] lg:h-[70px] shrink-0">
                        <h1 className="w-full lg:w-[395px] lg:h-[30px] font-sarabun font-semibold text-[30px] leading-none text-[#27272A] dark:text-zinc-100 truncate">
                            {product.title}
                        </h1>

                        {/* Price & Stock */}
                        <div className="flex flex-row items-center p-0 gap-3.5 w-full lg:w-[357px] lg:h-[32px] shrink-0">
                            <div className="flex flex-row items-center p-0 gap-1.5 w-[194px] lg:h-[30px] shrink-0">
                                {discounted && (
                                    <span className="w-[51px] lg:h-[30px] font-sarabun font-bold text-[30px] leading-none text-[#D4D4D8] dark:text-zinc-650 line-through">
                                        {price.toFixed(0)}
                                    </span>
                                )}
                                <span className="w-[137px] lg:h-[30px] font-sarabun font-bold text-[30px] leading-none text-[#27272A] dark:text-zinc-100">
                                    {(discounted || price).toFixed(2)} EGP
                                </span>
                            </div>

                            {/* Stock Indicator */}
                            {product.stock > 0 ? (
                                <div className="flex flex-row items-center justify-center px-3 py-1.5 gap-1.5 w-[149px] h-8 bg-[#F4F4F5] dark:bg-zinc-800 rounded-[16px] shrink-0">
                                    <Package className="size-5 text-zinc-500 dark:text-zinc-400 shrink-0" strokeWidth={1.5} />
                                    <span className="w-[99px] h-3.5 font-sarabun font-medium text-[14px] leading-none text-[#27272A] dark:text-zinc-350 truncate">
                                        {product.stock} {locale === "ar" ? "في المخزون" : "left in stock"}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex flex-row items-center justify-center px-3 py-1.5 gap-1.5 w-[149px] h-8 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-[16px] shrink-0">
                                    <span className="font-sarabun font-semibold text-[14px] leading-none text-red-650 dark:text-red-400">
                                        {locale === "ar" ? "نفذ" : "Out of Stock"}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Line 4 */}
                    <div className="w-full lg:w-[605px] h-0 border-t border-[#F4F4F5] dark:border-zinc-850 shrink-0" />

                    {/* Rating row */}
                    <div className="flex flex-row items-center p-0 gap-1.5 w-full lg:w-[605px] h-5 shrink-0">
                        <Star className="size-5 fill-[#FFA508] text-[#FFA508] shrink-0" strokeWidth={1.5} />
                        <span className="w-[91px] h-4 font-sarabun font-normal text-[16px] leading-none text-black dark:text-zinc-300">
                            {locale === "ar" ? "تقييم:" : "Rating:"} {toNum(product.rating).toFixed(1)}/5
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                window.scrollTo({
                                    top: (document.getElementById("reviews-section")?.offsetTop ?? 1000) - 80,
                                    behavior: "smooth",
                                });
                            }}
                            className="w-[73px] h-4 font-sarabun font-medium text-[16px] leading-none text-[#155DFC] dark:text-blue-400 hover:underline border-none bg-transparent cursor-pointer text-start"
                        >
                            ({product.ratings || 0} {locale === "ar" ? "تقييمات" : "ratings"})
                        </button>
                    </div>

                    {/* Line 5 */}
                    <div className="w-full lg:w-[605px] h-0 border-t border-[#F4F4F5] dark:border-zinc-850 shrink-0" />

                    {/* Description */}
                    <div className="flex flex-row justify-center items-start p-0 gap-2.5 w-full lg:w-[605px] flex-1 shrink-0">
                        <p className="w-full lg:w-[605px] font-sarabun font-normal text-[16px] leading-relaxed text-[#52525B] dark:text-zinc-400">
                            {product.description || t("noDescription") || "No description available."}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row items-start p-0 gap-2.5 w-full lg:w-[605px] h-[46px] shrink-0 mt-auto">

                        {/* Add to wishlist */}
                        <button
                            onClick={handleWishlistToggle}
                            disabled={isWishlistPending}
                            className={`flex flex-row justify-center items-center p-2.5 gap-2.5 w-[49px] h-[46px] bg-[#F4F4F5] dark:bg-zinc-850 rounded-[10px] shrink-0 cursor-pointer border-none transition-colors ${isInWishlist ? "bg-red-50 dark:bg-red-950/20" : ""
                                }`}
                            aria-label={tCommon("addToWishlist")}
                        >
                            {isWishlistPending ? (
                                <Loader2 className="size-5 animate-spin text-[#27272A] dark:text-white" />
                            ) : (
                                <Heart
                                    className={`w-[25px] h-[25px] transition-colors ${isInWishlist
                                        ? "fill-[#A6252A] text-[#A6252A] dark:fill-rose-450 dark:text-rose-450"
                                        : "text-[#27272A] dark:text-zinc-200"
                                        }`}
                                    strokeWidth={1.75}
                                />
                            )}
                        </button>

                        {/* Add to cart */}
                        <button
                            onClick={handleAddToCart}
                            disabled={isOutOfStock || addToCartMutation.isPending}
                            className="flex flex-row justify-center items-center px-4 py-2.5 gap-2.5 w-full lg:w-[546px] h-[46px] bg-[#A6252A] hover:bg-[#8B1E22] disabled:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-[10px] shrink-0 cursor-pointer border-none transition-colors text-white font-sarabun font-medium text-[16px]"
                        >
                            {addToCartMutation.isPending ? (
                                <Loader2 className="size-5 animate-spin text-white" />
                            ) : (
                                <>
                                    <ShoppingCart className="w-[25px] h-[25px] text-white shrink-0" strokeWidth={1.75} />
                                    <span className="w-20 h-4 font-sarabun font-medium text-[16px] leading-none text-white text-center">
                                        {locale === "ar" ? "إضافة للسلة" : "Add to Cart"}
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Product Reviews Section ── */}
            <div id="reviews-section" className="flex flex-col items-start p-0 gap-[16px] w-full max-w-[1280px] shrink-0 text-start border-none bg-transparent pt-8 mx-auto">

                {/* General Rating / Rate Header block */}
                <div className="flex flex-col items-start p-0 gap-[10px] w-full shrink-0 relative">

                    {/* Heading Component */}
                    <div className="relative w-[268px] h-[41px] shrink-0">
                        {/* Rectangle 1 (underlying soft-pink highlight) */}
                        <div className="absolute w-[154px] h-[17px] left-0 top-[24px] bg-[#FFE0E7] dark:bg-[#741C21]/40 rounded-r-[20px]" />
                        {/* Rectangle 2 (darker pink accent line) */}
                        <div className="absolute w-[60px] h-[2px] left-0 top-[39px] bg-[#E65073]" />
                        {/* Title text */}
                        <h2 className="absolute w-[268px] h-[36px] left-0 top-0 font-sarabun font-bold text-[36px] leading-none text-[#741C21] dark:text-rose-300 flex items-center z-10">
                            {locale === "ar" ? "تقييمات المنتج" : "Product Reviews"}
                        </h2>
                    </div>

                    {/* General rating details row */}
                    <div className="flex flex-col items-start p-0 gap-[4px] shrink-0 mt-2">
                        <span className="font-sarabun font-semibold text-[20px] leading-none text-[#27272A] dark:text-zinc-200">
                            {locale === "ar" ? "التقييم العام:" : "General rating:"}
                        </span>

                        <div className="flex flex-col items-start p-0 gap-[4px] shrink-0">
                            {/* Score & Count (Modified to match Date style) */}
                            <div className="flex flex-row items-baseline gap-[6px]">
                                <span className="font-sarabun font-bold text-[24px] leading-none text-[#27272A] dark:text-zinc-100">
                                    {toNum(product.rating).toFixed(1)}
                                </span>
                                {/* Changed color from #155DFC to #A1A1AA and size to 14px to match the date style */}
                                <span className="font-sarabun font-medium text-[14px] leading-none text-[#A1A1AA] dark:text-zinc-500 cursor-pointer hover:underline">
                                    ({reviewsList.length} {locale === "ar" ? "تقييمات" : "ratings"})
                                </span>
                            </div>

                            {/* General Stars */}
                            <div className="flex flex-row items-center p-0 h-[20px] shrink-0">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-[20px] h-[20px] shrink-0 ${i < Math.round(toNum(product.rating))
                                            ? "fill-[#FFA508] text-[#FFA508]"
                                            : "fill-transparent text-[#FFA508]"
                                            }`}
                                        strokeWidth={1.5}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Full width Horizontal Line */}
                <div className="w-full h-px bg-[#E4E4E7] dark:bg-zinc-800 shrink-0" />

                {/* Form and Reviews Content Horizontal Flex */}
                <div className="flex flex-col lg:flex-row items-start p-0 gap-[20px] w-full shrink-0">

                    {/* 1. Reviews List */}
                    <div className="flex flex-col items-start p-[8px_7px] gap-[10px] w-full lg:w-[756px] shrink-0 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-hide">
                        {reviewsList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-10 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-[12px] text-center gap-3 w-full">
                                <span className="text-zinc-500 dark:text-zinc-400 font-sarabun text-[16px]">
                                    {locale === "ar"
                                        ? "لا توجد تقييمات بعد لهذا المنتج. كن أول من يكتب تقييماً!"
                                        : "No reviews yet for this product. Be the first to write a review!"}
                                </span>
                            </div>
                        ) : (
                            <div className="flex flex-col w-full">
                                {reviewsList.map((review: any) => {
                                    const { title, body } = parseComment(review.comment);
                                    const name = getUserName(review);
                                    const initial = name.charAt(0).toUpperCase() || "U";

                                    return (
                                        <div
                                            key={review.id}
                                            className="box-border flex flex-col items-start p-0 pb-[16px] mb-[16px] gap-[10px] w-full lg:w-[742px] border-b border-[#F4F4F5] dark:border-zinc-800 shrink-0 last:border-b-0"
                                        >
                                            {/* User Row */}
                                            <div className="flex flex-row items-center p-0 px-[3px] gap-[10px] shrink-0">
                                                <div className="flex flex-row justify-center items-center w-[45px] h-[45px] bg-[#A6252A] rounded-full shrink-0 font-sarabun font-semibold text-[20px] leading-none text-white select-none">
                                                    {initial}
                                                </div>
                                                <div className="flex flex-col items-start justify-center shrink-0 gap-[4px]">
                                                    <span className="font-sarabun font-semibold text-[16px] leading-none text-[#27272A] dark:text-zinc-200">
                                                        {name}
                                                    </span>
                                                    <span className="font-sarabun font-medium text-[14px] leading-none text-[#A1A1AA] dark:text-zinc-500 whitespace-nowrap">
                                                        {formatDate(review.createdAt)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Rating score and stars */}
                                            <div className="flex flex-row items-center p-0 gap-[6px] h-[20px] shrink-0">
                                                <div className="flex flex-row items-center p-0 h-[20px] shrink-0">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-[20px] h-[20px] shrink-0 ${i < review.rating
                                                                ? "fill-[#FFA508] text-[#FFA508]"
                                                                : "fill-transparent text-[#FFA508]"
                                                                }`}
                                                            strokeWidth={1.5}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="font-sarabun font-semibold text-[16px] leading-none text-[#27272A] dark:text-zinc-200 flex items-center">
                                                    ({review.rating.toFixed(1)})
                                                </span>
                                            </div>

                                            {/* Text comment body */}
                                            <div className="flex flex-col items-start pt-[4px] pb-0 px-0 gap-[6px] w-full shrink-0">
                                                {title && (
                                                    <h4 className="font-sarabun font-semibold text-[16px] leading-none text-[#000000] dark:text-white">
                                                        {title}
                                                    </h4>
                                                )}
                                                <p className="w-full lg:w-[742px] font-sarabun font-normal text-[16px] leading-[125%] text-[#52525B] dark:text-zinc-400 m-0">
                                                    {body}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* 2. Vertical Separator (Line 7) */}
                    <div className="hidden lg:block w-px self-stretch min-h-[367px] bg-[#E4E4E7] dark:bg-zinc-800" />

                    {/* 3. Review Submission Form */}
                    <form
                        onSubmit={handleAddReview}
                        className="flex flex-col justify-start items-start p-0 gap-[10px] w-full lg:w-[484px] shrink-0 mx-auto lg:mx-0"
                    >
                        {/* Rating selector row */}
                        <div className="flex flex-row items-center py-[10px] px-0 gap-[10px] w-full h-[45px] shrink-0">
                            <span className="font-sarabun font-medium text-[16px] leading-none text-[#27272A] dark:text-zinc-200 select-none">
                                {locale === "ar" ? "تقييمك:" : "Your rating:"}
                            </span>
                            <div className="flex flex-row items-center p-0 gap-[4px] h-[25px] shrink-0">
                                {Array.from({ length: 5 }).map((_, i) => {
                                    const starVal = i + 1;
                                    const active = starVal <= rating;
                                    return (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setRating(starVal)}
                                            className="cursor-pointer border-none bg-transparent hover:scale-105 transition-transform p-0 outline-none flex items-center justify-center"
                                        >
                                            <Star
                                                className={`w-[25px] h-[25px] transition-colors shrink-0 ${active
                                                    ? "fill-[#FFA508] text-[#FFA508]"
                                                    : "fill-transparent text-[#FFA508]"
                                                    }`}
                                                strokeWidth={1.5}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Title input field */}
                        <div className="flex flex-col items-start p-0 gap-[6px] w-full lg:w-[484px] shrink-0">
                            <label className="font-inter font-medium text-[14px] leading-none text-[#27272A] dark:text-zinc-300">
                                {locale === "ar" ? "العنوان" : "Title"}
                            </label>
                            <input
                                type="text"
                                placeholder={locale === "ar" ? "اكتب عنوان التقييم" : "Enter review title"}
                                value={reviewTitle}
                                onChange={(e) => setReviewTitle(e.target.value)}
                                className="box-border flex flex-row items-center px-[16px] w-full h-[49px] bg-white dark:bg-zinc-800 border border-[#D4D4D8] dark:border-zinc-700 rounded-[10px] text-[14px] text-[#27272A] dark:text-zinc-100 font-inter placeholder-[#A1A1AA] outline-none focus:border-[#A6252A] transition-colors"
                            />
                        </div>

                        {/* Review body textarea */}
                        <div className="flex flex-col items-start p-0 gap-[6px] w-full lg:w-[484px] shrink-0">
                            <label className="font-inter font-medium text-[14px] leading-none text-[#27272A] dark:text-zinc-300">
                                {locale === "ar" ? "التقييم" : "Review"}
                            </label>
                            <textarea
                                placeholder={
                                    locale === "ar"
                                        ? "ما هو رأيك في هذا المنتج؟"
                                        : "What do you think of this product?"
                                }
                                value={reviewBody}
                                onChange={(e) => setReviewBody(e.target.value)}
                                className="box-border flex flex-row items-start p-[16px] w-full min-h-[150px] h-[150px] bg-white dark:bg-zinc-800 border border-[#D4D4D8] dark:border-zinc-700 rounded-[10px] text-[14px] text-[#27272A] dark:text-zinc-100 font-inter placeholder-[#A1A1AA] outline-none focus:border-[#A6252A] transition-colors resize-y"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={createReviewMutation.isPending}
                            className="flex flex-row justify-center items-center px-[16px] w-full lg:w-[484px] h-[44px] bg-[#A6252A] hover:bg-[#8B1E22] disabled:bg-[#D4D4D8] disabled:opacity-70 transition-colors rounded-[10px] cursor-pointer border-none shadow-sm text-white font-sarabun font-medium text-[16px] leading-none mt-2 outline-none"
                        >
                            {createReviewMutation.isPending ? (
                                <Loader2 className="w-[20px] h-[20px] animate-spin text-white" />
                            ) : (
                                <span>
                                    {locale === "ar" ? "إضافة تقييم" : "Add Review"}
                                </span>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* ── Related Products Section ── */}
            {relatedProducts.length > 0 && (
                <div className="flex flex-col items-start p-0 gap-[16px] w-full max-w-[1280px] shrink-0 text-start border-none bg-transparent pt-8 mx-auto mt-4 relative">

                    {/* Heading Component */}
                    <div className="relative w-[279px] h-[41px] shrink-0 ml-[10px]">
                        <div className="absolute w-[154px] h-[17px] left-0 top-[24px] bg-[#FFE0E7] dark:bg-[#741C21]/40 rounded-r-[20px]" />
                        <div className="absolute w-[60px] h-[2px] left-0 top-[39px] bg-[#E65073]" />
                        <h2 className="absolute w-[279px] h-[36px] left-0 top-0 font-sarabun font-bold text-[36px] leading-none text-[#741C21] dark:text-rose-300 flex items-center z-10">
                            {locale === "ar" ? "منتجات ذات صلة" : "Related Products"}
                        </h2>
                    </div>

                    {/* Products list grid & Arrows wrapper */}
                    <div className="relative w-full flex items-center justify-center">

                        {/* Prev Arrow (Floating Left - Centered to the image height) */}
                        <button
                            onClick={() => scrollSlider("left")}
                            className="absolute top-[146px] -translate-y-1/2 -left-[16px] z-10 flex flex-col justify-center items-center w-[33px] h-[33px] bg-[#A6252A] rounded-full hover:bg-[#8B1E22] transition-colors cursor-pointer border-none outline-none shadow-md"
                            aria-label="Previous products"
                        >
                            <ChevronLeft className="w-[20px] h-[20px] text-white rtl:rotate-180" strokeWidth={2} />
                        </button>

                        {/* Products list grid (horizontal scrollable wrapper with hidden scrollbar) */}
                        <div
                            ref={relatedSliderRef}
                            className="flex flex-row items-start p-[10px] gap-[16px] overflow-x-auto scroll-smooth w-full max-w-[1260px] mx-auto isolate [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                        >
                            {relatedProducts.map((relProduct) => (
                                <div key={relProduct.id} className="shrink-0 z-0">
                                    <ProductCard product={relProduct} />
                                </div>
                            ))}
                        </div>

                        {/* Next Arrow (Floating Right - Centered to the image height) */}
                        <button
                            onClick={() => scrollSlider("right")}
                            className="absolute top-[146px] -translate-y-1/2 -right-[16px] z-10 flex flex-col justify-center items-center w-[33px] h-[33px] bg-[#A6252A] rounded-full hover:bg-[#8B1E22] transition-colors cursor-pointer border-none outline-none shadow-md"
                            aria-label="Next products"
                        >
                            <ChevronRight className="w-[20px] h-[20px] text-white rtl:rotate-180" strokeWidth={2} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
