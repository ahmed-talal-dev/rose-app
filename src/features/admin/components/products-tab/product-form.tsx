import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, Image as ImageIcon, Upload, Loader2 } from "lucide-react";
import { Product } from "@/features/products/types";
import { Category } from "@/features/categories/types";
import { Occasion } from "@/features/occasions/types";
import { resolveImageUrl } from "@/shared/lib/utils/resolve-image-url";
import {
    productSchema,
    ProductFormInput,
    ProductFormOutput,
    calcPriceAfterDiscount,
} from "./types";

interface ProductFormViewProps {
    mode: "add" | "edit";
    editingProduct?: Product;
    onBack: () => void;
    onSubmit: (values: ProductFormOutput) => Promise<void>;
    categoriesList: Category[];
    occasionsList: Occasion[];
    isPending: boolean;
}

export function ProductFormView({
    mode,
    editingProduct,
    onBack,
    onSubmit,
    categoriesList,
    occasionsList,
    isPending,
}: ProductFormViewProps) {
    const isEdit = mode === "edit";

    // Build schema with dynamic refinement
    const dynamicSchema = productSchema.superRefine((data, ctx) => {
        if (!isEdit && !data.coverFile) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["coverFile"],
                message: "Product cover image is required",
            });
        }
        if (!isEdit && (!data.galleryFiles || data.galleryFiles.length === 0)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["galleryFiles"],
                message: "Product gallery is required",
            });
        }
    });

    const form = useForm<ProductFormInput, unknown, ProductFormOutput>({
        resolver: zodResolver(dynamicSchema),
        defaultValues: {
            title: editingProduct?.title ?? "",
            description: editingProduct?.description ?? "",
            price: editingProduct?.price != null ? String(editingProduct.price) : "",
            discountValue: editingProduct?.discountValue != null ? String(editingProduct.discountValue) : "",
            stock: editingProduct?.stock != null ? String(editingProduct.stock) : "",
            categoryId: editingProduct?.categoryId ?? "",
            occasionId: editingProduct?.occasionId ?? "",
        },
    });

    const { register, control, setValue, formState: { errors } } = form;
    const price = useWatch({ control, name: "price" });
    const discountValue = useWatch({ control, name: "discountValue" });
    const categoryId = useWatch({ control, name: "categoryId" });
    const occasionId = useWatch({ control, name: "occasionId" });

    // Convert price string and discountValue string to numbers safely for the helper
    const priceNum = price ? parseFloat(price) : 0;
    const discountNum = discountValue ? parseFloat(discountValue) : undefined;
    const priceAfterDiscount = calcPriceAfterDiscount(priceNum, discountNum);

    return (
        <div className="animate-fade-in w-full">
            <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm w-full">

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <button
                        type="button"
                        onClick={onBack}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer bg-transparent"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <h1 className="text-xl md:text-2xl font-bold text-zinc-800 dark:text-zinc-200 font-sans">
                        {isEdit ? "Edit Product" : "Add New Product"}
                    </h1>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">

                    <FormField label="Product title" required error={errors.title?.message}>
                        <input
                            id="product-title"
                            {...register("title")}
                            placeholder="Enter product title"
                            className={inputCn(!!errors.title)}
                        />
                    </FormField>

                    <FormField label="Description" required error={errors.description?.message}>
                        <textarea
                            id="product-description"
                            {...register("description")}
                            placeholder="Enter product description"
                            rows={4}
                            className={`${inputCn(!!errors.description)} resize-none py-2 h-auto`}
                        />
                    </FormField>

                    {/* Price row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                        <FormField label="Price" required error={errors.price?.message}>
                            <input
                                id="product-price"
                                {...register("price")}
                                type="number"
                                placeholder="5000"
                                className={inputCn(!!errors.price)}
                            />
                        </FormField>

                        <FormField label="Discount" error={errors.discountValue?.message}>
                            <input
                                id="product-discount"
                                {...register("discountValue")}
                                type="number"
                                placeholder="0"
                                className={inputCn(!!errors.discountValue)}
                            />
                        </FormField>

                        <FormField label="Price after discount">
                            <input
                                id="product-price-after-discount"
                                type="text"
                                value={priceAfterDiscount}
                                readOnly
                                disabled
                                className="w-full px-3 h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-400 dark:text-zinc-500 text-sm cursor-not-allowed"
                            />
                        </FormField>
                    </div>

                    <FormField label="Quantity" required error={errors.stock?.message}>
                        <input
                            id="product-stock"
                            {...register("stock")}
                            type="number"
                            placeholder="200"
                            className={inputCn(!!errors.stock)}
                        />
                    </FormField>

                    {/* File uploads */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <FileUploadField
                            id="product-cover-image"
                            label="Product cover image"
                            required={!isEdit}
                            accept="image/*"
                            error={errors.coverFile?.message}
                            onChange={(file) => setValue("coverFile", file, { shouldValidate: true })}
                            hint={isEdit ? "Leave empty to keep current" : undefined}
                        />
                        <FileUploadField
                            id="product-gallery-images"
                            label="Product gallery"
                            required={!isEdit}
                            accept="image/*"
                            multiple
                            error={errors.galleryFiles?.message}
                            onChange={(_, files) => setValue("galleryFiles", files, { shouldValidate: true })}
                            hint={isEdit ? "Leave empty to keep current" : undefined}
                        />
                    </div>

                    {/* View current media (edit mode only) */}
                    {isEdit && (editingProduct?.cover || (editingProduct?.gallery?.length ?? 0) > 0) && (
                        <div className="flex flex-col md:flex-row gap-3 items-center justify-end w-full">
                            {editingProduct?.cover && (
                                <a
                                    href={resolveImageUrl(editingProduct.cover)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex md:inline-flex items-center justify-center gap-2 px-4 h-9 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-blue-500 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 cursor-pointer font-sans w-full md:w-auto"
                                >
                                    <ImageIcon size={14} />
                                    View current cover
                                </a>
                            )}
                            {(editingProduct?.gallery?.length ?? 0) > 0 && (
                                <a
                                    href={resolveImageUrl(editingProduct!.gallery[0])}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex md:inline-flex items-center justify-center gap-2 px-4 h-9 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-blue-500 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 cursor-pointer font-sans w-full md:w-auto"
                                >
                                    <ImageIcon size={14} />
                                    View current gallery
                                </a>
                            )}
                        </div>
                    )}

                    <SelectField
                        id="product-category"
                        label="Category"
                        required
                        error={errors.categoryId?.message}
                        value={categoryId ?? ""}
                        onChange={(v) => setValue("categoryId", v, { shouldValidate: true })}
                        options={categoriesList.map((c) => ({ value: c.id, label: c.title }))}
                    />

                    <SelectField
                        id="product-occasion"
                        label="Occasion"
                        required
                        error={errors.occasionId?.message}
                        value={occasionId ?? ""}
                        onChange={(v) => setValue("occasionId", v, { shouldValidate: true })}
                        options={occasionsList.map((o) => ({ value: o.id, label: o.title }))}
                    />

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-zinc-400 disabled:cursor-not-allowed text-white rounded-lg h-10 text-sm font-semibold transition-colors border-none cursor-pointer flex items-center justify-center gap-2 font-sans md:mt-12 mt-6 shadow-sm"
                    >
                        {isPending && <Loader2 size={16} className="animate-spin" />}
                        {isEdit ? "Update Product" : "Add Product"}
                    </button>
                </form>
            </div>
        </div>
    );
}

function inputCn(hasError: boolean): string {
    return `w-full px-3 h-10 rounded-lg border text-sm bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary-600/20 transition-all ${hasError
        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
        : "border-zinc-200 dark:border-zinc-700 focus:border-primary-600"
        }`;
}

interface FormFieldProps {
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
}

function FormField({ label, required, error, children }: FormFieldProps) {
    return (
        <div className="flex flex-col gap-1.5 w-full font-sans">
            <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-300">
                {label} {required && <span className="text-red-600">*</span>}
            </label>
            {children}
            {error && <span className="text-xs text-red-500 font-semibold mt-0.5">{error}</span>}
        </div>
    );
}

interface FileUploadFieldProps {
    id: string;
    label: string;
    required?: boolean;
    accept?: string;
    multiple?: boolean;
    error?: string;
    hint?: string;
    onChange: (file: File, files: File[]) => void;
}

function FileUploadField({ id, label, required, accept, multiple, error, hint, onChange }: FileUploadFieldProps) {
    const [displayName, setDisplayName] = useState<string>("");

    return (
        <FormField label={label} required={required} error={error}>
            <div className={`flex items-center justify-between pl-3 pr-1 py-1 rounded-lg border bg-white dark:bg-zinc-800 h-10 w-full ${error ? "border-red-500" : "border-zinc-200 dark:border-zinc-700"
                }`}>
                <span className="text-sm text-zinc-400 dark:text-zinc-500 truncate mr-4">
                    {displayName || hint || "Choose file..."}
                </span>
                <label className="flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-600 rounded-md text-xs font-semibold cursor-pointer hover:bg-primary-100 transition-colors whitespace-nowrap">
                    <Upload size={14} />
                    Upload
                    <input
                        id={id}
                        type="file"
                        accept={accept}
                        multiple={multiple}
                        className="hidden"
                        onChange={(e) => {
                            const files = Array.from(e.target.files ?? []);
                            if (files.length > 0) {
                                setDisplayName(multiple ? `${files.length} file(s) selected` : files[0].name);
                                onChange(files[0], files);
                            }
                        }}
                    />
                </label>
            </div>
        </FormField>
    );
}

interface SelectFieldProps {
    id: string;
    label: string;
    required?: boolean;
    error?: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
}

const ChevronDownIcon = () => (
    <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="w-4 h-4">
        <path d="m6 9 6 6 6-6" />
    </svg>
);

function SelectField({ id, label, required, error, value, onChange, options }: SelectFieldProps) {
    return (
        <FormField label={label} required={required} error={error}>
            <div className="relative w-full">
                <select
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full px-3 h-10 rounded-lg border text-sm bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary-600/20 transition-all cursor-pointer appearance-none ${error
                        ? "border-red-500 focus:border-red-500"
                        : "border-zinc-200 dark:border-zinc-700 focus:border-primary-600"
                        }`}
                >
                    <option value="" disabled>Select an option</option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                    <ChevronDownIcon />
                </div>
            </div>
        </FormField>
    );
}
