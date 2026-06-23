import { z } from "zod";

export const getProductSchema = (t: (key: string) => string) => z.object({
    title: z.string().min(3, t("validation.titleMin")),
    description: z.string().min(10, t("validation.descMin")),
    price: z
        .string()
        .min(1, t("validation.priceRequired"))
        .transform((v) => parseFloat(v))
        .pipe(z.number().positive(t("validation.priceRequired"))),
    discountValue: z
        .string()
        .optional()
        .transform((v) => (v ? parseFloat(v) : undefined))
        .pipe(z.number().min(0, t("validation.discountMin")).optional()),
    stock: z
        .string()
        .min(1, t("validation.stockRequired"))
        .transform((v) => parseInt(v, 10))
        .pipe(z.number().int().min(0, t("validation.stockRequired"))),
    categoryId: z.string().min(1, t("validation.categoryRequired")),
    occasionId: z.string().min(1, t("validation.occasionRequired")),
    coverFile: z.instanceof(File).optional(),
    galleryFiles: z.array(z.instanceof(File)).optional(),
});

export type ProductFormInput = z.input<ReturnType<typeof getProductSchema>>;
export type ProductFormOutput = z.output<ReturnType<typeof getProductSchema>>;

export const DEFAULT_IMAGE = "https://flower.elevateegy.com/uploads/flowers.png";

export function formatStock(stock: number): string {
    return stock.toLocaleString("en-US");
}

export function calcPriceAfterDiscount(price: number, discountValue?: number): string {
    if (!price || price <= 0) return "";
    if (!discountValue || discountValue < 0) return String(price);
    return String(Math.max(0, price - discountValue));
}
