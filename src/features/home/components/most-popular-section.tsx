"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { useProducts } from "@/features/products/hooks";
import { ProductCardSkeleton } from "@/features/home/components/product-card-skeleton";
import { useOccasions } from "@/features/occasions/hooks";
import { HomeProductCard } from "./home-product-card";

const SKELETON_KEYS = [
  "most-popular-skeleton-1",
  "most-popular-skeleton-2",
  "most-popular-skeleton-3",
  "most-popular-skeleton-4",
  "most-popular-skeleton-5",
  "most-popular-skeleton-6",
  "most-popular-skeleton-7",
  "most-popular-skeleton-8",
];

export function MostPopularSection() {
  const t = useTranslations("home.mostPopular");
  const tCommon = useTranslations("common");
  const [activeOccasionId, setActiveOccasionId] = useState<string | undefined>(
    undefined,
  );

  const { data: occasionsData } = useOccasions({ limit: 6 });
  const defaultOccasionId =
    occasionsData?.data.find((occ) =>
      occ.title.toLowerCase().includes("wedding"),
    )?.id ?? occasionsData?.data[0]?.id;
  const selectedOccasionId = activeOccasionId ?? defaultOccasionId;
  const { data, isLoading, isError } = useProducts({
    occasionId: selectedOccasionId,
    sortBy: "rating",
    sortOrder: "desc",
    limit: 12,
  });

  const products = data?.data ?? [];

  return (
    <section className="w-full bg-white dark:bg-zinc-800  py-8 lg:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-12">
          <div className="relative">
            <div className="absolute -bottom-2 inset-s-0 h-0.5 w-[60px] bg-rose-500" />
            <h2 className="relative font-sarabun font-bold text-4xl leading-none text-primary-600 dark:text-rose-400 z-10">
              {t("title")}
            </h2>
          </div>

          <div className="flex items-center gap-8 overflow-x-auto pb-1 no-scrollbar">
            {occasionsData?.data.map((occ) => (
              <button
                type="button"
                key={occ.id}
                onClick={() => setActiveOccasionId(occ.id)}
                className={`shrink-0 font-sarabun font-semibold text-base leading-none transition-colors whitespace-nowrap ${
                  selectedOccasionId === occ.id
                    ? "text-primary-600 dark:text-rose-400"
                    : "text-zinc-600 dark:hover:text-rose-400"
                }`}
              >
                {occ.title}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            SKELETON_KEYS.map((key) => (
              <div key={key} className="w-full">
                <ProductCardSkeleton />
              </div>
            ))
          ) : isError ? (
            <p className="text-center text-sm text-zinc-400 col-span-full w-full">
              {t("error")}
            </p>
          ) : products.length === 0 ? (
            <p className="text-center text-sm text-zinc-400 col-span-full w-full">
              {t("empty")}
            </p>
          ) : (
            products.map((product) => (
              <HomeProductCard
                key={product._id}
                product={product}
                variant="popular"
              />
            ))
          )}
        </div>

        <div className="flex justify-end mt-10">
          <Link
            href="/products"
            className="flex items-center gap-2.5 font-sarabun font-semibold text-base leading-none text-primary-600 dark:text-rose-400   hover:opacity-80  transition-opacity"
          >
            {tCommon("viewMore")}
            <ArrowRight className="size-5 text-primary-600 dark:text-rose-400" />
          </Link>
        </div>
      </div>
    </section>
  );
}
