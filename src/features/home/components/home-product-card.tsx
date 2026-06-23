"use client";

import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Eye, Heart, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { useAddToCart } from "@/features/cart/hooks";
import { Product } from "@/features/products/types";
import { calculateDiscount } from "@/features/products/utils/price";
import { toNum } from "@/shared/lib/utils/number";

const HOT_RATING_THRESHOLD = 4.5;
const STAR_COUNT = 5;

interface HomeProductCardProps {
  product: Product;
  variant?: "slider" | "popular";
}

export function HomeProductCard({
  product,
  variant = "slider",
}: HomeProductCardProps) {
  const tCommon = useTranslations("common");
  const tProducts = useTranslations("products");
  const { data: session } = useSession();
  const router = useRouter();
  const { mutate: addToCart } = useAddToCart();

  const price = toNum(product.price);
  const isOutOfStock = product.quantity === 0;
  const isPopular = variant === "popular";
  const { discounted: discountedPrice, discountLabel } = calculateDiscount(
    product.price,
    product.discountType,
    product.discountValue,
    tCommon("currency"),
  );

  const handleCartAdd = () => {
    if (!session) {
      router.push("/login");
      return;
    }

    addToCart(
      { product: product._id, quantity: 1 },
      {
        onSuccess: () => {
          toast.success(tCommon("addedToCart"));
        },
        onError: (err: unknown) => {
          toast.error(err instanceof Error ? err.message : String(err));
        },
      },
    );
  };

  return (
    <div
      data-card
      className={`group relative flex flex-col gap-4 rounded-2xl ${
        isPopular ? "w-full min-w-0" : "snap-start shrink-0 w-[302px]"
      }`}
    >
      <div className="relative h-[272px] w-full rounded-xl overflow-hidden">
        <Image
          src={product.imgCover || "/images/placeholder.svg"}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
          onError={(e) => {
            e.currentTarget.src = "/images/placeholder.svg";
          }}
        />
        <div className="absolute top-2.5 inset-e-2.5 flex gap-1.5 flex-wrap justify-end">
          {discountedPrice !== null && !isOutOfStock && (
            <span
              className={`text-xs font-sarabun font-medium px-2 py-0.5 rounded-full leading-none ${
                isPopular
                  ? "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  : "bg-muted dark:bg-zinc-800 text-muted-foreground dark:text-zinc-300"
              }`}
            >
              {tProducts("new")}
            </span>
          )}
          {toNum(product.rateAvg) >= HOT_RATING_THRESHOLD && !isOutOfStock && (
            <span
              className="bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-200 text-xs font-sarabun font-medium px-2 py-0.5 rounded-full leading-none"
            >
              {tProducts("hot")}
            </span>
          )}
          {discountLabel && !isOutOfStock && (
            <span className="bg-red-600 text-rose-50 text-xs font-sarabun font-medium px-2 py-0.5 rounded-full leading-none">
              {discountLabel}
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-red-600 text-rose-50 text-xs font-sarabun font-medium px-2 py-0.5 rounded-full leading-none">
              {tProducts("outOfStock")}
            </span>
          )}
        </div>

        {isPopular && (
          <div className="absolute inset-0 flex items-center justify-center gap-2.5 bg-rose-600/40 dark:bg-rose-950/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <button
              type="button"
              aria-label={tCommon("addToWishlist")}
              onClick={() => {
                if (!session) {
                  router.push("/login");
                }
              }}
              className="size-[30px] rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center hover:bg-rose-50 dark:hover:bg-zinc-750 transition-colors"
            >
              <Heart className="size-5 text-rose-600 dark:text-rose-400" />
            </button>
            <Link
              href={`/products/${product._id}`}
              aria-label={product.title}
              className="size-[30px] rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center hover:bg-rose-50 dark:hover:bg-zinc-750 transition-colors"
            >
              <Eye className="size-5 text-rose-600 dark:text-rose-400" />
            </Link>
          </div>
        )}
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          <h3
            className={`font-sarabun font-semibold text-lg leading-none truncate ${
              isPopular
                ? "text-primary-600 dark:text-rose-200"
                : "text-primary-700 dark:text-rose-200"
            }`}
          >
            {product.title}
          </h3>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              {Array.from({ length: STAR_COUNT }).map((_, index) => (
                <Star
                  key={`rating-star-${index + 1}`}
                  className={`size-3.5 ${
                    index < Math.round(toNum(product.rateAvg))
                      ? "fill-yellow-400 text-yellow-400"
                      : isPopular
                        ? "fill-transparent text-yellow-400/45 dark:text-yellow-400/20"
                        : "fill-border text-border dark:fill-zinc-800 dark:text-zinc-800"
                  }`}
                />
              ))}
            </div>

            <div
              className={`flex items-baseline gap-2 font-sarabun font-medium text-base ${
                isPopular
                  ? "text-primary-600 dark:text-rose-200"
                  : "text-primary-700 dark:text-rose-200"
              }`}
            >
              <span>
                {discountedPrice !== null
                  ? toNum(discountedPrice).toFixed(2)
                  : price.toFixed(2)}{" "}
                {tCommon("currency")}
              </span>
              {discountedPrice !== null && (
                <span
                  className={`text-sm line-through ${
                    isPopular
                      ? "text-zinc-300 dark:text-zinc-600"
                      : "text-muted-foreground dark:text-zinc-300/60"
                  }`}
                >
                  {price.toFixed(2)} {tCommon("currency")}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          aria-label={tCommon("addToCart")}
          disabled={isOutOfStock}
          onClick={handleCartAdd}
          className={`shrink-0 flex items-center justify-center bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow-[0_0_40px_5px_rgba(0,0,0,0.05)] transition-colors ${
            isPopular ? "size-[46px]" : "size-[42px]"
          }`}
        >
          <ShoppingCart className="size-5 text-rose-50" />
        </button>
      </div>
    </div>
  );
}
