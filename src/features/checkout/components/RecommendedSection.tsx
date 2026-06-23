"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/features/products/components/product-card";
import { Product } from "@/features/products/types";

const SLIDER_SCROLL_AMOUNT = 318;

interface RecommendedSectionProps {
    recommendedProducts: Product[];
}

export function RecommendedSection({ recommendedProducts }: RecommendedSectionProps) {
    const tCart = useTranslations("cart");
    const sliderRef = useRef<HTMLDivElement>(null);

    const handleScrollSlider = (direction: "left" | "right") => {
        if (sliderRef.current) {
            const scrollOffset = direction === "left" ? -SLIDER_SCROLL_AMOUNT : SLIDER_SCROLL_AMOUNT;
            const targetScrollPosition = sliderRef.current.scrollLeft + scrollOffset;
            sliderRef.current.scrollTo({ left: targetScrollPosition, behavior: "smooth" });
        }
    };

    if (recommendedProducts.length === 0) return null;

    return (
        <div className="relative mt-4 flex w-full max-w-[1280px] flex-col items-start gap-6 p-2.5 text-start">
            <div className="relative h-10 w-[367px] shrink-0 ml-2.5">
                <div className="absolute top-6 left-0 h-4 w-[214px] rounded-r-2xl bg-[#FFE0E7] dark:bg-[#741C21]/40" />
                <div className="absolute top-[39px] left-0 h-0.5 w-[83px] bg-[#E65073]" />
                <h2 className="absolute top-0 left-0 m-0 flex h-9 w-[367px] items-center font-sarabun text-4xl font-bold leading-none text-[#741C21] dark:text-rose-300 z-10">
                    {tCart("recommendedTitle")}
                </h2>
            </div>

            <div className="relative flex w-full items-center justify-center">
                <button
                    type="button"
                    onClick={() => handleScrollSlider("left")}
                    className="absolute top-[162px] -left-4 z-10 flex h-8 w-8 -translate-y-1/2 cursor-pointer flex-col items-center justify-center rounded-full border-none bg-primary-600 shadow-md transition-colors hover:bg-primary-700 outline-none"
                >
                    <ChevronLeft className="h-5 w-5 text-white rtl:rotate-180" strokeWidth={2} />
                </button>

                <div
                    ref={sliderRef}
                    className="mx-auto flex w-full max-w-[1260px] flex-row items-start gap-4 overflow-x-auto p-2.5 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                    {recommendedProducts.map((product) => (
                        <div key={product.id} className="shrink-0">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => handleScrollSlider("right")}
                    className="absolute top-[162px] -right-4 z-10 flex h-8 w-8 -translate-y-1/2 cursor-pointer flex-col items-center justify-center rounded-full border-none bg-primary-600 shadow-md transition-colors hover:bg-primary-700 outline-none"
                >
                    <ChevronRight className="h-5 w-5 text-white rtl:rotate-180" strokeWidth={2} />
                </button>
            </div>
        </div>
    );
}
