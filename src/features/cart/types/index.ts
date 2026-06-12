export type CartItem = {
    id: string;
    productId: string;
    quantity: number;
    product: {
        id: string;
        title: string;
        price: number;
        cover: string;
        stock: number;
    };
};

export type Cart = {
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