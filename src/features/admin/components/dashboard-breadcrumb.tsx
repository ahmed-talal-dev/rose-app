"use client";

import { Category } from "@/features/categories/types";
import { Occasion } from "@/features/occasions/types";
import { Product } from "@/features/products/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BreadcrumbProps {
    activeTab: string;
    categoriesView: "list" | "add" | "edit";
    occasionsView: "list" | "add" | "edit";
    productsView: "list" | "add" | "edit";
    editingCategory: Category | null;
    editingOccasion: Occasion | null;
    editingProduct: Product | null;
    onTabChange: (tab: string) => void;
    /** "header" → xs text for mobile top bar | "subheader" → sm text for desktop inner bar */
    variant?: "header" | "subheader";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SEPARATOR = (
    <span className="text-slate-400 dark:text-zinc-500 font-normal select-none">{"›"}</span>
);

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface CrumbLinkProps {
    label: string;
    active: boolean;
    onClick: () => void;
}

function CrumbLink({ label, active, onClick }: CrumbLinkProps) {
    return (
        <span
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => e.key === "Enter" && onClick()}
            className={`cursor-pointer hover:underline underline-offset-2 ${active
                ? "text-primary-600 dark:text-rose-400 font-semibold"
                : "text-slate-500 dark:text-zinc-400"
                }`}
        >
            {label}
        </span>
    );
}

function CrumbStatic({ label }: { label: string }) {
    return (
        <span className="text-primary-600 dark:text-rose-400 font-semibold">{label}</span>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DashboardBreadcrumb({
    activeTab,
    categoriesView,
    occasionsView,
    productsView,
    editingCategory,
    editingOccasion,
    editingProduct,
    onTabChange,
    variant = "subheader",
}: BreadcrumbProps) {
    const isHeader = variant === "header";
    const textSize = isHeader ? "text-xs" : "text-sm";

    const renderCrumbs = () => {
        if (activeTab === "categories") {
            return (
                <>
                    {SEPARATOR}
                    <CrumbLink
                        label="Categories"
                        active={categoriesView === "list"}
                        onClick={() => onTabChange("categories")}
                    />
                    {categoriesView === "add" && <>{SEPARATOR}<CrumbStatic label="Add Category" /></>}
                    {categoriesView === "edit" && editingCategory && (
                        <>{SEPARATOR}<CrumbStatic label={`Edit: ${capitalize(editingCategory.title)}`} /></>
                    )}
                </>
            );
        }

        if (activeTab === "occasions") {
            return (
                <>
                    {SEPARATOR}
                    <CrumbLink
                        label="Occasions"
                        active={occasionsView === "list"}
                        onClick={() => onTabChange("occasions")}
                    />
                    {occasionsView === "add" && <>{SEPARATOR}<CrumbStatic label="Add Occasion" /></>}
                    {occasionsView === "edit" && editingOccasion && (
                        <>{SEPARATOR}<CrumbStatic label={`Edit: ${capitalize(editingOccasion.title)}`} /></>
                    )}
                </>
            );
        }

        if (activeTab === "products") {
            return (
                <>
                    {SEPARATOR}
                    <CrumbLink
                        label="Products"
                        active={productsView === "list"}
                        onClick={() => onTabChange("products")}
                    />
                    {productsView === "add" && <>{SEPARATOR}<CrumbStatic label="Add Product" /></>}
                    {productsView === "edit" && editingProduct && (
                        <>{SEPARATOR}<CrumbStatic label={`Edit: ${editingProduct.title}`} /></>
                    )}
                </>
            );
        }

        return null;
    };

    return (
        <nav
            aria-label="Breadcrumb"
            className={`flex items-center gap-1.5 flex-wrap font-sans ${textSize} text-slate-500 dark:text-zinc-400`}
        >
            <span
                role="button"
                tabIndex={0}
                onClick={() => onTabChange("overview")}
                onKeyDown={(e) => e.key === "Enter" && onTabChange("overview")}
                className="cursor-pointer hover:underline underline-offset-2"
            >
                Dashboard
            </span>
            {renderCrumbs()}
        </nav>
    );
}