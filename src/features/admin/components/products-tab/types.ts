import { z } from "zod";

export const productSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z
        .string()
        .min(1, "Please enter a valid price")
        .transform((v) => parseFloat(v))
        .pipe(z.number().positive("Please enter a valid price")),
    discountValue: z
        .string()
        .optional()
        .transform((v) => (v ? parseFloat(v) : undefined))
        .pipe(z.number().min(0, "Discount cannot be negative").optional()),
    stock: z
        .string()
        .min(1, "Quantity is required")
        .transform((v) => parseInt(v, 10))
        .pipe(z.number().int().min(0, "Quantity is required")),
    categoryId: z.string().min(1, "Please select a category"),
    occasionId: z.string().min(1, "Please select an occasion"),
    coverFile: z.instanceof(File).optional(),
    galleryFiles: z.array(z.instanceof(File)).optional(),
});

export type ProductFormInput = z.input<typeof productSchema>;
export type ProductFormOutput = z.output<typeof productSchema>;

export const DEFAULT_IMAGE = "https://flower.elevateegy.com/uploads/flowers.png";

export function formatStock(stock: number): string {
    return stock.toLocaleString("en-US");
}

export function calcPriceAfterDiscount(price: number, discountValue?: number): string {
    if (!price || price <= 0) return "";
    if (!discountValue || discountValue < 0) return String(price);
    return String(Math.max(0, price - discountValue));
}
