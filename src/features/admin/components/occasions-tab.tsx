"use client";

import { useState } from "react";
import {
    Plus, Search, Edit, Trash2, ImageIcon, Upload,
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    Loader2, MoreVertical,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useOccasions, useCreateOccasion, useDeleteOccasion } from "@/features/occasions/hooks";
import { updateOccasion } from "@/features/occasions/apis";
import { useUpload } from "@/shared/hooks/use-upload";
import { resolveImageUrl } from "@/shared/lib/utils/resolve-image-url";
import { Occasion } from "@/features/occasions/types";

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

function capitalize(str: string): string {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

// ─── OccasionsTab (main) ──────────────────────────────────────────────────────

export function OccasionsTab({
    view,
    setView,
    editingOccasion,
    setEditingOccasion,
}: OccasionsTabProps) {
    const queryClient = useQueryClient();
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
            toast.warning("Image upload failed. Using previous image.");
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
        if (!nameInput.trim()) return toast.error("Please enter an occasion name");
        try {
            const imageUrl = await uploadImage(imageFile);
            await createMutation.mutateAsync({ title: nameInput.trim(), image: imageUrl || undefined });
            toast.success("Occasion added successfully");
            setView("list");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to add occasion");
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingOccasion) return;
        if (!nameInput.trim()) return toast.error("Please enter an occasion name");
        try {
            const imageUrl = await uploadImage(imageFile, currentImageUrl);
            await updateMutation.mutateAsync({
                id: editingOccasion.id,
                body: { name: nameInput.trim(), image: imageUrl },
            });
            toast.success("Occasion updated successfully");
            setView("list");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update occasion");
        }
    };

    const handleDelete = async (occ: Occasion) => {
        if (!confirm(`Delete occasion "${occ.title}"?`)) return;
        try {
            await deleteMutation.mutateAsync(occ.id);
            toast.success("Occasion deleted successfully");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete occasion");
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    // ── Views ─────────────────────────────────────────────────────────────────

    if (view === "add") {
        return (
            <OccasionForm
                title="Add a New Occasion"
                submitLabel="Add Occasion"
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
                title={`Update Occasion: ${capitalize(editingOccasion.title)}`}
                submitLabel="Update Occasion"
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
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter occasion name"
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
                                        View occasion image
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Image upload */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-300 font-sans">
                                Occasion image <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center justify-between pl-4 pr-1.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 h-12">
                                <span className="text-sm text-zinc-400 dark:text-zinc-500 truncate mr-4 font-sans">
                                    {imageFile ? imageFile.name : "No file chosen"}
                                </span>
                                <label className="flex items-center gap-1.5 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-semibold cursor-pointer hover:bg-primary-100 transition-colors font-sans">
                                    <Upload size={16} />
                                    Upload file
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
                        All Occasions
                    </h1>
                    <button
                        type="button"
                        onClick={onOpenAdd}
                        className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors border-none cursor-pointer shadow-sm shadow-primary-600/10 font-sans shrink-0"
                    >
                        <Plus size={18} />
                        <span className="hidden md:inline">Add a new occasion</span>
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all font-sans"
                    />
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                        <p className="text-sm text-zinc-500 font-sans">Loading occasions...</p>
                    </div>
                ) : (
                    <>
                        {/* Table */}
                        <div className="w-full overflow-x-auto border border-zinc-100 dark:border-zinc-800 rounded-xl mb-6 shadow-sm">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800 h-12">
                                        <th className="px-4 md:px-6 py-3 text-sm font-bold text-zinc-800 dark:text-zinc-300 font-sans w-2/5 md:w-60">Name</th>
                                        <th className="px-4 md:px-6 py-3 text-sm font-bold text-zinc-800 dark:text-zinc-300 font-sans w-2/5 md:w-60">Products</th>
                                        <th className="px-4 md:px-6 py-3 w-1/5 md:w-auto" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {occasions.map((occ, index) => (
                                        <tr
                                            key={occ.id}
                                            className={`transition-colors h-13.5 ${index === 0
                                                    ? "bg-primary-50 dark:bg-primary-950/20"
                                                    : "bg-white dark:bg-zinc-900 hover:bg-zinc-50/40 dark:hover:bg-zinc-800/20"
                                                }`}
                                        >
                                            <td className="px-4 md:px-6 py-3 text-sm font-bold text-zinc-800 dark:text-zinc-200 font-sans">
                                                {capitalize(occ.title)}
                                            </td>
                                            <td className="px-4 md:px-6 py-3 text-sm font-medium text-zinc-500 dark:text-zinc-400 font-sans">
                                                {occ.productsCount ?? 0} products
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
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onDelete(occ)}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors border-none cursor-pointer font-sans"
                                                    >
                                                        <Trash2 size={14} />
                                                        Delete
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
                                                                Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => { setActiveRowMenuId(null); onDelete(occ); }}
                                                                className="flex items-center gap-1.5 px-2.5 py-1.5 text-left rounded-md text-xs text-red-600 hover:bg-zinc-50 dark:hover:bg-zinc-700/60 transition-colors border-none bg-transparent cursor-pointer font-semibold"
                                                            >
                                                                <Trash2 size={12} />
                                                                Delete
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
                                                No occasions match your search.
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
                                pages={pages}
                                maxPages={MAX_PAGES_SHOWN}
                                onPageChange={onPageChange}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    pages: number[];
    maxPages: number;
    onPageChange: (page: number) => void;
}

const PAGE_BTN = "w-8 h-8 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer";

function Pagination({ currentPage, totalPages, pages, maxPages, onPageChange }: PaginationProps) {
    return (
        <div className="flex justify-center mt-4">
            <div className="flex items-center gap-1.5 font-sans">
                <button type="button" onClick={() => onPageChange(1)} disabled={currentPage === 1} className={PAGE_BTN}>
                    <ChevronsLeft size={14} />
                </button>
                <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={PAGE_BTN}>
                    <ChevronLeft size={14} />
                </button>

                {pages.map((page) => (
                    <button
                        key={page}
                        type="button"
                        onClick={() => onPageChange(page)}
                        className={`w-8 h-8 rounded text-sm font-semibold flex items-center justify-center border cursor-pointer transition-colors ${currentPage === page
                                ? "bg-primary-600 border-primary-600 text-white"
                                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            }`}
                    >
                        {page}
                    </button>
                ))}

                {totalPages > maxPages && (
                    <>
                        <span className="w-8 h-8 flex items-center justify-center text-zinc-400 text-sm">...</span>
                        <button
                            type="button"
                            onClick={() => onPageChange(totalPages)}
                            className={`w-8 h-8 rounded text-sm font-semibold flex items-center justify-center border cursor-pointer transition-colors ${currentPage === totalPages
                                    ? "bg-primary-600 border-primary-600 text-white"
                                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                }`}
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                <button type="button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={PAGE_BTN}>
                    <ChevronRight size={14} />
                </button>
                <button type="button" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className={PAGE_BTN}>
                    <ChevronsRight size={14} />
                </button>
            </div>
        </div>
    );
}