"use client";

import { useState } from "react";
import {
    Plus, Search, Edit, Trash2, ImageIcon, Upload,
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    Loader2, MoreVertical,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { useOccasions, useCreateOccasion, useDeleteOccasion } from "@/features/occasions/hooks";
import { updateOccasion } from "@/features/occasions/apis";
import { useUpload } from "@/shared/hooks/use-upload";
import { resolveImageUrl } from "@/shared/lib/utils/resolve-image-url";
import { Occasion } from "@/features/occasions/types";
import { capitalize } from "@/shared/lib/utils/string";
import { Pagination } from "@/features/admin/components/pagination";

// ─── Types ────────────────────────────────────────────────────────────────────

type OccasionView = "list" | "add" | "edit";
type OccasionWithCount = Occasion & { productsCount?: number };

interface OccasionsTabProps {
    view: OccasionView;
    setView: (view: OccasionView) => void;
    editingOccasion: Occasion | null;
    setEditingOccasion: (occ: Occasion | null) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_PAGES_SHOWN = 3;

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ─── OccasionsTab (main) ──────────────────────────────────────────────────────

export function OccasionsTab({
    view,
    setView,
    editingOccasion,
    setEditingOccasion,
}: OccasionsTabProps) {
    const queryClient = useQueryClient();
    const t = useTranslations("admin.occasions");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [activeRowMenuId, setActiveRowMenuId] = useState<string | null>(null);

    // Form state
    const [nameInput, setNameInput] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [currentImageUrl, setCurrentImageUrl] = useState("");

    // API hooks
    const { data: occasionsData, isLoading } = useOccasions({ page: currentPage, limit: 10 });
    const uploadMutation = useUpload();
    const createMutation = useCreateOccasion();
    const deleteMutation = useDeleteOccasion();
    const updateMutation = useMutation({
        mutationFn: ({ id, body }: { id: string; body: { name?: string; image?: string } }) =>
            updateOccasion(id, body),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["occasions"] }),
    });

    // Derived data — consume server data directly, no local mirror
    const occasions: OccasionWithCount[] = occasionsData?.data ?? [];
    const totalPages = occasionsData?.metadata?.totalPages ?? 1;

    const filteredOccasions = occasions.filter((occ) =>
        occ.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ── Upload helper ─────────────────────────────────────────────────────────

    const uploadImage = async (file: File | null, fallback = ""): Promise<string> => {
        if (!file) return fallback;
        try {
            const res = await uploadMutation.mutateAsync(file);
            return res.url;
        } catch {
            toast.warning(t("uploadError"));
            return fallback;
        }
    };

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleOpenAdd = () => {
        setNameInput("");
        setImageFile(null);
        setView("add");
    };

    const handleOpenEdit = (occ: Occasion) => {
        setEditingOccasion(occ);
        setNameInput(occ.title);
        setCurrentImageUrl(occ.image ?? "");
        setImageFile(null);
        setView("edit");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setImageFile(file);
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nameInput.trim()) return toast.error(t("nameRequired"));
        try {
            const imageUrl = await uploadImage(imageFile);
            await createMutation.mutateAsync({ title: nameInput.trim(), image: imageUrl || undefined });
            toast.success(t("successAdd"));
            setView("list");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t("addError"));
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingOccasion) return;
        if (!nameInput.trim()) return toast.error(t("nameRequired"));
        try {
            const imageUrl = await uploadImage(imageFile, currentImageUrl);
            await updateMutation.mutateAsync({
                id: editingOccasion.id,
                body: { name: nameInput.trim(), image: imageUrl },
            });
            toast.success(t("successUpdate"));
            setView("list");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t("updateError"));
        }
    };

    const handleDelete = async (occ: Occasion) => {
        if (!confirm(t("deleteConfirm", { name: occ.title }))) return;
        try {
            await deleteMutation.mutateAsync(occ.id);
            toast.success(t("successDelete"));
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t("deleteError"));
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    // ── Views ─────────────────────────────────────────────────────────────────

    if (view === "add") {
        return (
            <OccasionForm
                title={t("addNewOccasion")}
                submitLabel={t("addOccasion")}
                nameInput={nameInput}
                setNameInput={setNameInput}
                imageFile={imageFile}
                onFileChange={handleFileChange}
                onSubmit={handleAddSubmit}
                isPending={uploadMutation.isPending || createMutation.isPending}
            />
        );
    }

    if (view === "edit" && editingOccasion) {
        return (
            <OccasionForm
                title={t("updateOccasionTitle", { name: capitalize(editingOccasion.title) })}
                submitLabel={t("saveChanges")}
                nameInput={nameInput}
                setNameInput={setNameInput}
                imageFile={imageFile}
                onFileChange={handleFileChange}
                onSubmit={handleEditSubmit}
                isPending={uploadMutation.isPending || updateMutation.isPending}
                currentImageUrl={currentImageUrl}
            />
        );
    }

    return (
        <OccasionList
            occasions={filteredOccasions}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            currentPage={currentPage}
            totalPages={totalPages}
            isLoading={isLoading}
            activeRowMenuId={activeRowMenuId}
            setActiveRowMenuId={setActiveRowMenuId}
            onOpenAdd={handleOpenAdd}
            onOpenEdit={handleOpenEdit}
            onDelete={handleDelete}
            onPageChange={handlePageChange}
        />
    );
}

// ─── OccasionForm — shared for Add + Edit ─────────────────────────────────────

interface OccasionFormProps {
    title: string;
    submitLabel: string;
    nameInput: string;
    setNameInput: (v: string) => void;
    imageFile: File | null;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    isPending: boolean;
    currentImageUrl?: string;
}

function OccasionForm({
    title,
    submitLabel,
    nameInput,
    setNameInput,
    imageFile,
    onFileChange,
    onSubmit,
    isPending,
    currentImageUrl,
}: OccasionFormProps) {
    const t = useTranslations("admin.occasions");

    return (
        <div className="animate-fade-in w-full">
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-6 leading-none font-sans">
                {title}
            </h1>

            <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-2xl p-8 shadow-sm flex flex-col w-full md:min-h-0 min-h-[calc(100vh-270px)]">
                <form onSubmit={onSubmit} className="flex flex-col justify-between flex-1 gap-6">
                    <div className="flex flex-col gap-6">

                        {/* Name */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-300 font-sans">
                                {t("nameLabel")} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder={t("namePlaceholder")}
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                className="w-full px-4 h-12 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all font-sans"
                            />
                            {/* View current image link — edit mode only */}
                            {currentImageUrl && (
                                <div className="flex justify-start md:justify-end mt-2">
                                    <a
                                        href={resolveImageUrl(currentImageUrl)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex md:inline-flex items-center gap-2.5 md:gap-1.5 px-4 md:px-3 h-12 md:h-9 w-full md:w-auto border border-zinc-200 dark:border-zinc-700 rounded-xl md:rounded-lg text-sm md:text-xs font-semibold text-blue-500 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors font-sans"
                                    >
                                        <ImageIcon size={16} className="shrink-0" />
                                        {t("viewOccasionImage")}
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Image upload */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-300 font-sans">
                                {t("imageLabel")} <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center justify-between pl-4 pr-1.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 h-12">
                                <span className="text-sm text-zinc-400 dark:text-zinc-500 truncate mr-4 font-sans">
                                    {imageFile ? imageFile.name : t("noFileChosen")}
                                </span>
                                <label className="flex items-center gap-1.5 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-semibold cursor-pointer hover:bg-primary-100 transition-colors font-sans">
                                    <Upload size={16} />
                                    {t("uploadFile")}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={onFileChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white rounded-xl py-3.5 text-sm font-semibold transition-colors border-none cursor-pointer flex items-center justify-center gap-2 font-sans md:mt-12 mt-6"
                    >
                        {isPending && <Loader2 size={16} className="animate-spin" />}
                        {submitLabel}
                    </button>
                </form>
            </div>
        </div>
    );
}

// ─── OccasionList ─────────────────────────────────────────────────────────────

interface OccasionListProps {
    occasions: OccasionWithCount[];
    searchQuery: string;
    setSearchQuery: (v: string) => void;
    currentPage: number;
    totalPages: number;
    isLoading: boolean;
    activeRowMenuId: string | null;
    setActiveRowMenuId: (id: string | null) => void;
    onOpenAdd: () => void;
    onOpenEdit: (occ: Occasion) => void;
    onDelete: (occ: Occasion) => void;
    onPageChange: (page: number) => void;
}

function OccasionList({
    occasions, searchQuery, setSearchQuery,
    currentPage, totalPages, isLoading,
    activeRowMenuId, setActiveRowMenuId,
    onOpenAdd, onOpenEdit, onDelete, onPageChange,
}: OccasionListProps) {
    const t = useTranslations("admin.occasions");
    const pages = Array.from(
        { length: Math.min(totalPages, MAX_PAGES_SHOWN) },
        (_, i) => i + 1
    );

    return (
        <div className="animate-fade-in w-full">
            <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col">

                {/* Header */}
                <div className="flex justify-between items-center mb-6 h-10 gap-2">
                    <h1 className="text-xl md:text-2xl font-bold text-zinc-800 dark:text-zinc-200 font-sans">
                        {t("title")}
                    </h1>
                    <button
                        type="button"
                        onClick={onOpenAdd}
                        className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors border-none cursor-pointer shadow-sm shadow-primary-600/10 font-sans shrink-0"
                    >
                        <Plus size={18} />
                        <span className="hidden md:inline">{t("addNewOccasionBtn")}</span>
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        placeholder={t("searchPlaceholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all font-sans"
                    />
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                        <p className="text-sm text-zinc-500 font-sans">{t("loading")}</p>
                    </div>
                ) : (
                    <>
                        {/* Table */}
                        <div className="w-full overflow-x-auto border border-zinc-100 dark:border-zinc-800 rounded-xl mb-6 shadow-sm">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800 h-12">
                                        <th className="px-4 md:px-6 py-3 text-sm font-bold text-zinc-800 dark:text-zinc-300 font-sans w-2/5 md:w-60">{t("tableName")}</th>
                                        <th className="px-4 md:px-6 py-3 text-sm font-bold text-zinc-800 dark:text-zinc-300 font-sans w-2/5 md:w-60">{t("tableProductsCount")}</th>
                                        <th className="px-4 md:px-6 py-3 w-1/5 md:w-auto" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {occasions.map((occ) => (
                                        <tr
                                            key={occ.id}
                                            className="transition-colors h-13.5 bg-white dark:bg-zinc-900 hover:bg-zinc-50/40 dark:hover:bg-zinc-800/20"
                                        >
                                            <td className="px-4 md:px-6 py-3 text-sm font-bold text-zinc-800 dark:text-zinc-200 font-sans">
                                                {capitalize(occ.title)}
                                            </td>
                                            <td className="px-4 md:px-6 py-3 text-sm font-medium text-zinc-500 dark:text-zinc-400 font-sans">
                                                {t("productsCount", { count: occ.productsCount ?? 0 })}
                                            </td>
                                            <td className="px-4 md:px-6 py-3 text-sm text-right relative">
                                                {/* Desktop */}
                                                <div className="hidden md:flex justify-end gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => onOpenEdit(occ)}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors border-none cursor-pointer font-sans"
                                                    >
                                                        <Edit size={14} />
                                                        {t("actions.edit")}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onDelete(occ)}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors border-none cursor-pointer font-sans"
                                                    >
                                                        <Trash2 size={14} />
                                                        {t("actions.delete")}
                                                    </button>
                                                </div>

                                                {/* Mobile */}
                                                <div className="flex md:hidden justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setActiveRowMenuId(
                                                                activeRowMenuId === occ.id ? null : occ.id
                                                            )
                                                        }
                                                        className="p-1 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer border-none bg-transparent"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>
                                                    {activeRowMenuId === occ.id && (
                                                        <div className="absolute right-4 top-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-1 w-24 z-20 flex flex-col gap-0.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => { setActiveRowMenuId(null); onOpenEdit(occ); }}
                                                                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-left rounded-md text-xs text-blue-500 hover:bg-zinc-50 dark:hover:bg-zinc-700/60 transition-colors border-none bg-transparent cursor-pointer font-semibold"
                                                                >
                                                                    <Edit size={12} />
                                                                    {t("actions.edit")}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => { setActiveRowMenuId(null); onDelete(occ); }}
                                                                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-left rounded-md text-xs text-red-600 hover:bg-zinc-50 dark:hover:bg-zinc-700/60 transition-colors border-none bg-transparent cursor-pointer font-semibold"
                                                                >
                                                                    <Trash2 size={12} />
                                                                    {t("actions.delete")}
                                                                </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {occasions.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-10 text-center text-sm text-zinc-400 font-sans">
                                                {t("noSearchOccasions")}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={onPageChange}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}