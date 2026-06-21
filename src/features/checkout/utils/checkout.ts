import { CartItem } from "@/features/cart/types";

export function calculateItemPrice(item: CartItem): number {
  const price = Number(item.product.price) || 0;
  const discountVal = Number(item.product.discountValue) || 0;

  if (item.product.discountType === "PERCENT") {
    return price - (price * discountVal) / 100;
  }
  if (item.product.discountType === "FIXED") {
    return price - discountVal;
  }
  return price;
}

export function calculateSubtotal(cartItems: CartItem[]): number {
  return cartItems.reduce(
    (sum, item) => sum + calculateItemPrice(item) * item.quantity,
    0
  );
}

export function calculateTotal(subtotal: number, discountAmount: number): number {
  return subtotal - discountAmount;
}
