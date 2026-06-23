"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useProducts } from "@/features/products/hooks";
import { ProductCardSkeleton } from "./product-card-skeleton";
import { HomeProductCard } from "./home-product-card";
import { useHorizontalSlider } from "../hooks/use-horizontal-slider";

const FALLBACK_CARD_WIDTH_PX = 326;
const SKELETON_KEYS = [
  "best-selling-skeleton-1",
  "best-selling-skeleton-2",
  "best-selling-skeleton-3",
];

export function BestSellingSection() {
  const t = useTranslations("home.bestSelling");
  const tCommon = useTranslations("common");
  const { sliderRef, handleSlidePrev, handleSlideNext } = useHorizontalSlider({
    fallbackCardWidth: FALLBACK_CARD_WIDTH_PX,
  });

  const { data, isLoading, isError } = useProducts({
    sortBy: "rating",
    sortOrder: "desc",
    limit: 8,
  });

  const products = data?.data ?? [];

  return (
    <section className="py-16 lg:py-24 bg-background dark:bg-zinc-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-9 items-start">
          <div className="flex flex-col gap-2.5 lg:w-[291px] shrink-0">
            <span className="font-sarabun font-bold text-base uppercase tracking-[0.25em] text-rose-500 dark:text-rose-200">
              {t("eyebrow")}
            </span>

            <div className="flex flex-col gap-2">
              <h2 className="font-sarabun font-bold text-3xl leading-none tracking-normal align-middle text-primary-700 dark:text-primary-600">
                {t.rich("title", {
                  pink: (chunks) => (
                    <span className="text-rose-500 dark:text-rose-200">
                      {chunks}
                    </span>
                  ),
                })}
              </h2>
              <p className="font-sarabun font-normal text-base leading-tight mt-2 text-muted-foreground dark:text-zinc-300/70">
                {t("subtitle")}
              </p>
            </div>

            <Link
              href="/products"
              className="mt-12 inline-flex items-center gap-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-rose-200 dark:hover:bg-rose-200/90 text-white dark:text-primary-900 font-sarabun text-base px-4 py-2.5 rounded-[10px] w-fit transition-colors"
            >
              {tCommon("exploreGifts")}
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="relative flex-1 min-w-0">
            <button
              type="button"
              onClick={handleSlidePrev}
              aria-label="Previous"
              className="absolute inset-s-[-19px] top-1/2 -translate-y-1/2 z-10 size-[38px] flex items-center justify-center bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-900 rounded-full shadow-[0_0_40px_5px_rgba(0,0,0,0.05)] transition-colors"
            >
              <ChevronLeft className="size-5 text-primary-50" />
            </button>

            <div
              ref={sliderRef}
              className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 no-scrollbar"
            >
              {isLoading ? (
                SKELETON_KEYS.map((key) => (
                  <div
                    key={key}
                    data-card
                    className="snap-start shrink-0 w-[302px]"
                  >
                    <ProductCardSkeleton />
                  </div>
                ))
              ) : isError ? (
                <p className="text-center text-sm text-muted-foreground w-full">{t("error")}</p>
              ) : products.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground w-full">{t("empty")}</p>
              ) : (
                products.map((product) => (
                  <HomeProductCard key={product._id} product={product} />
                ))
              )}
            </div>

            <button
              type="button"
              onClick={handleSlideNext}
              aria-label="Next"
              className="absolute inset-e-[-19px] top-1/2 -translate-y-1/2 z-10 size-[38px] flex items-center justify-center bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-900 rounded-full shadow-[0_0_40px_5px_rgba(0,0,0,0.05)] transition-colors"
            >
              <ChevronRight className="size-5 text-primary-50" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
