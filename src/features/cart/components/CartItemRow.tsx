import { Star, Trash2, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { CartItem } from "@/features/cart/types";

interface CartItemRowProps {
    cartItem: CartItem;
    onQuantityChange: (id: string, qty: number, delta: number, stock: number) => void;
    onRemove: (id: string) => void;
    isUpdating: boolean;
    isRemoving: boolean;
    ratingLabel: string;
    ratingsCount: (n: number) => string;
    removeLabel: string;
    currency: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://rose-app.elevate-bootcamp.cloud";

function resolveImageUrl(url: string): string {
    if (!url) return "/images/placeholder.svg";
    return url.startsWith("http") ? url : `${BASE_URL}${url}`;
}

export function getUnitPrice(product: CartItem["product"]): number {
    const price = Number(product.price) || 0;
    const discountVal = Number(product.discountValue) || 0;

    if (product.discountType === "PERCENT") return price - (price * discountVal) / 100;
    if (product.discountType === "FIXED") return price - discountVal;
    return price;
}

export function CartItemRow({
    cartItem,
    onQuantityChange,
    onRemove,
    isUpdating,
    isRemoving,
    ratingLabel,
    ratingsCount,
    removeLabel,
    currency,
}: CartItemRowProps) {
    const unitPrice = getUnitPrice(cartItem.product);

    return (
        <div className="flex flex-col lg:flex-row items-center gap-4 pb-5 mb-5 border-b border-zinc-200 dark:border-zinc-800 last:border-b-0 last:mb-0 last:pb-0">
            <div className="relative shrink-0 overflow-hidden w-[117px] h-36 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <Image
                    src={resolveImageUrl(cartItem.product.cover)}
                    alt={cartItem.product.title}
                    fill
                    className="object-cover"
                    unoptimized
                />
            </div>

            <div className="flex flex-col justify-between w-full h-full gap-2.5 lg:h-36">
                <div className="flex flex-col lg:flex-row justify-between items-start w-full gap-3">
                    <div className="flex flex-col w-full gap-1.5 lg:w-auto">
                        <h3 className="m-0 font-sarabun font-semibold text-lg text-primary-700 dark:text-rose-300 truncate">
                            {cartItem.product.title}
                        </h3>
                        <div className="flex items-center gap-1.5 h-5">
                            <Star className="shrink-0 w-5 h-5 text-yellow-400 fill-yellow-400" strokeWidth={1.5} />
                            <span className="font-sarabun text-base text-zinc-900 dark:text-zinc-200">
                                {ratingLabel}: {(Number(cartItem.product.rating) || 0).toFixed(1)}/5
                            </span>
                            <span className="font-sarabun font-medium text-base text-blue-600">
                                {ratingsCount(Number(cartItem.product.ratings) || 0)}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => onRemove(cartItem.id)}
                        disabled={isRemoving}
                        className="flex items-center justify-center shrink-0 px-4 py-2.5 mt-3 lg:mt-0 gap-1.5 w-24 h-10 bg-red-600 rounded-lg border-none outline-none cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        <Trash2 className="shrink-0 w-5 h-5 text-white" strokeWidth={1.5} />
                        <span className="font-sarabun font-medium text-sm text-white">{removeLabel}</span>
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row justify-between items-end w-full gap-3 mt-auto">
                    <div className="flex items-center gap-1.5">
                        <span className="font-sarabun font-medium text-sm text-primary-600 dark:text-rose-400 opacity-80">
                            (×{cartItem.quantity})
                        </span>
                        <span className="font-sarabun font-bold text-xl text-primary-600 dark:text-rose-400">
                            {unitPrice.toFixed(2)} {currency}
                        </span>
                    </div>

                    <div className="flex items-center shrink-0 mt-3 lg:mt-0 gap-2 w-56 h-12">
                        <button
                            onClick={() => onQuantityChange(cartItem.id, cartItem.quantity, -1, cartItem.product.stock)}
                            disabled={isUpdating || cartItem.quantity <= 1}
                            className="flex items-center justify-center shrink-0 w-12 h-12 bg-primary-50 rounded-lg border-none outline-none cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50"
                        >
                            <Minus className="w-5 h-5 text-primary-600" strokeWidth={2} />
                        </button>

                        <div className="flex items-center justify-center shrink-0 w-24 h-12 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg">
                            <span className="font-inter text-sm text-zinc-800 dark:text-zinc-100">
                                {cartItem.quantity}
                            </span>
                        </div>

                        <button
                            onClick={() => onQuantityChange(cartItem.id, cartItem.quantity, 1, cartItem.product.stock)}
                            disabled={isUpdating || cartItem.quantity >= cartItem.product.stock}
                            className="flex items-center justify-center shrink-0 w-12 h-12 bg-primary-50 rounded-lg border-none outline-none cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50"
                        >
                            <Plus className="w-5 h-5 text-primary-600" strokeWidth={2} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
