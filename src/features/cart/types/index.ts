export type DiscountType = "PERCENT" | "FIXED";

export type CartProduct = {
    id: string;
    title: string;
    price: number;
    discountType: DiscountType | null;
    discountValue: number | null;
    cover: string;
    stock: number;
    rating: number;
    ratings: number;
};

export type CartItem = {
    id: string;
    quantity: number;
    product: CartProduct;
};

export type CartData = {
    id: string;
    cartItems: CartItem[];
};

export type AddToCartInput = {
    productId: string;
    quantity?: number;
};

export type UpdateCartInput = {
    quantity: number;
};