"use client";

import Image from "next/image";
import { Product } from "@/features/products/types";

interface ProductGalleryProps {
    product: Product;
    selectedImage: string | null;
    onSelectImage: (imageUrl: string) => void;
    discountLabel: string | null;
    isOutOfStock: boolean;
    resolveImageUrl: (url: string) => string;
}

export function ProductGallery({
    product,
    selectedImage,
    onSelectImage,
    discountLabel,
    isOutOfStock,
    resolveImageUrl,
}: ProductGalleryProps) {
    const galleryImages = [product.cover, ...(product.gallery || [])].filter(Boolean);
    const activeImage = selectedImage || product.cover;

    return (
        <div className="flex w-full flex-col items-start gap-2.5 lg:h-[523px] lg:w-[605px]">
            <div className="relative h-[300px] w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 sm:h-[402px] lg:h-[402px]">
                <Image
                    src={resolveImageUrl(activeImage)}
                    alt={product.title}
                    fill
                    className="object-cover"
                    unoptimized
                    priority
                />
                {discountLabel && !isOutOfStock && (
                    <span className="absolute top-4 start-4 rounded-full bg-red-600 px-3 py-1 font-sarabun text-xs font-bold text-white shadow-sm z-10">
                        {discountLabel}
                    </span>
                )}
                {isOutOfStock && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
                        <span className="rounded-full bg-red-600 px-4 py-1.5 font-sarabun text-sm font-bold text-white shadow-md">
                            OUT OF STOCK
                        </span>
                    </div>
                )}
            </div>

            {galleryImages.length > 1 && (
                <div className="flex w-full flex-row items-center gap-2.5 overflow-x-auto pb-1.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:h-[111px] lg:w-[605px]">
                    {galleryImages.map((imgUrl, index) => {
                        const resolvedUrl = resolveImageUrl(imgUrl);
                        const isCurrent = activeImage === imgUrl;
                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={() => onSelectImage(imgUrl)}
                                className={`relative h-[111px] w-[91px] cursor-pointer rounded-lg border-2 bg-zinc-50 transition-colors ${
                                    isCurrent ? "border-primary-600" : "border-transparent"
                                }`}
                            >
                                <Image
                                    src={resolvedUrl}
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
    );
}
