"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/features/products/hooks";
import { useCategories } from "@/features/categories/hooks";
import { useOccasions } from "@/features/occasions/hooks";
import { useUpload } from "@/shared/hooks/use-upload";
import { Product } from "@/features/products/types";
import { Category } from "@/features/categories/types";
import { Occasion } from "@/features/occasions/types";

import { ProductList } from "./products-tab/product-list";
import { ProductFormView } from "./products-tab/product-form";
import { ProductFormOutput, DEFAULT_IMAGE } from "./products-tab/types";

interface ProductsTabProps {
    view: "list" | "add" | "edit";
    setView: (view: "list" | "add" | "edit") => void;
    editingProduct: Product | null;
    setEditingProduct: (prod: Product | null) => void;
}

export function ProductsTab({
    view,
    setView,
    editingProduct,
    setEditingProduct,
}: ProductsTabProps) {
    const t = useTranslations("admin.products");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [activeRowMenuId, setActiveRowMenuId] = useState<string | null>(null);

    // ── Data fetching ─────────────────────────────────────────────────────────
    const { data: productsData, isLoading } = useProducts({ page: currentPage, limit: 10 });
    const { data: categoriesData } = useCategories({ limit: 100 });
    const { data: occasionsData } = useOccasions({ limit: 100 });

    const products: Product[] = productsData?.data ?? [];
    const categoriesList: Category[] = categoriesData?.data ?? [];
    const occasionsList: Occasion[] = occasionsData?.data ?? [];
    const totalPages = productsData?.metadata?.totalPages ?? 1;

    const filteredProducts = products.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ── Mutations ─────────────────────────────────────────────────────────────
    const uploadMutation = useUpload();
    const createMutation = useCreateProduct();
    const updateMutation = useUpdateProduct(editingProduct?.id ?? "");
    const deleteMutation = useDeleteProduct();

    const isPending =
        uploadMutation.isPending ||
        createMutation.isPending ||
        updateMutation.isPending;

    // ── Upload helpers ────────────────────────────────────────────────────────
    async function uploadFile(file: File, fallback: string): Promise<string> {
        try {
            const res = await uploadMutation.mutateAsync(file);
            return res.url;
        } catch {
            toast.warning(t("coverUploadError"));
            return fallback;
        }
    }

    async function uploadFiles(files: File[], fallback: string): Promise<string[]> {
        try {
            const results = await Promise.all(files.map((f) => uploadMutation.mutateAsync(f)));
            return results.map((r) => r.url);
        } catch {
            toast.warning(t("galleryUploadError"));
            return [fallback];
        }
    }

    // ── Handlers ──────────────────────────────────────────────────────────────
    function handleOpenAdd() {
        setView("add");
    }

    function handleOpenEdit(prod: Product) {
        setEditingProduct(prod);
        setView("edit");
    }

    async function handleAddSubmit(values: ProductFormOutput) {
        const cover = values.coverFile
            ? await uploadFile(values.coverFile, DEFAULT_IMAGE)
            : DEFAULT_IMAGE;

        const gallery =
            values.galleryFiles && values.galleryFiles.length > 0
                ? await uploadFiles(values.galleryFiles, DEFAULT_IMAGE)
                : [DEFAULT_IMAGE];

        try {
            await createMutation.mutateAsync({
                title: values.title,
                description: values.description,
                stock: values.stock,
                price: values.price,
                ...(values.discountValue !== undefined && {
                    discountType: "FIXED" as const,
                    discountValue: values.discountValue,
                }),
                cover,
                gallery,
                categoryId: values.categoryId,
                occasionIds: [values.occasionId],
            });
            toast.success(t("successAdd"));
            setView("list");
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : t("addError"));
        }
    }

    async function handleUpdateSubmit(values: ProductFormOutput) {
        if (!editingProduct) return;

        const cover = values.coverFile
            ? await uploadFile(values.coverFile, editingProduct.cover)
            : editingProduct.cover;

        const gallery =
            values.galleryFiles && values.galleryFiles.length > 0
                ? await uploadFiles(values.galleryFiles, editingProduct.cover)
                : editingProduct.gallery;

        try {
            await updateMutation.mutateAsync({
                title: values.title,
                description: values.description,
                stock: values.stock,
                price: values.price,
                ...(values.discountValue !== undefined && {
                    discountType: "FIXED" as const,
                    discountValue: values.discountValue,
                }),
                cover,
                gallery,
                categoryId: values.categoryId,
                occasionIds: [values.occasionId],
            });
            toast.success(t("successUpdate"));
            setView("list");
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : t("updateError"));
        }
    }

    async function handleDelete(prod: Product) {
        if (!confirm(t("deleteConfirm", { name: prod.title }))) return;
        try {
            await deleteMutation.mutateAsync(prod.id);
            toast.success(t("successDelete"));
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : t("deleteError"));
        }
    }

    function handlePageChange(page: number) {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    }

    if (view === "add") {
        return (
            <ProductFormView
                mode="add"
                onBack={() => setView("list")}
                onSubmit={handleAddSubmit}
                categoriesList={categoriesList}
                occasionsList={occasionsList}
                isPending={isPending}
            />
        );
    }

    if (view === "edit" && editingProduct) {
        return (
            <ProductFormView
                mode="edit"
                editingProduct={editingProduct}
                onBack={() => setView("list")}
                onSubmit={handleUpdateSubmit}
                categoriesList={categoriesList}
                occasionsList={occasionsList}
                isPending={isPending}
            />
        );
    }

    return (
        <ProductList
            products={filteredProducts}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            currentPage={currentPage}
            totalPages={totalPages}
            onOpenAdd={handleOpenAdd}
            onOpenEdit={handleOpenEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
            activeRowMenuId={activeRowMenuId}
            setActiveRowMenuId={setActiveRowMenuId}
            handlePageChange={handlePageChange}
        />
    );
}