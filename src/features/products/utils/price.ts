import { toNum } from "@/shared/lib/utils/number";

export interface DiscountResult {
  discounted: number | null;
  discountLabel: string | null;
}

export function calculateDiscount(
  price: unknown,
  discountType: string | undefined,
  discountValue: unknown,
  currencyLabel: string
): DiscountResult {
  const priceNum = toNum(price);
  const discountVal = toNum(discountValue);

  if (!discountType || discountVal <= 0) {
    return { discounted: null, discountLabel: null };
  }

  if (discountType === "PERCENT") {
    return {
      discounted: priceNum - (priceNum * discountVal) / 100,
      discountLabel: `-${discountVal}% OFF`,
    };
  }

  if (discountType === "FIXED") {
    return {
      discounted: priceNum - discountVal,
      discountLabel: `-${discountVal} ${currencyLabel}`,
    };
  }

  return { discounted: null, discountLabel: null };
}
