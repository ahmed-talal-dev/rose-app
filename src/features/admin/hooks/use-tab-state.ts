"use client";

import { useState } from "react";
import { Category } from "@/features/categories/types";
import { Occasion } from "@/features/occasions/types";
import { Product } from "@/features/products/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SubView = "list" | "add" | "edit";

interface TabSubState<T> {
    view: SubView;
    editing: T | null;
}

interface TabStateReturn {
    activeTab: string;
    revenueFilter: "monthly" | "weekly";
    categories: TabSubState<Category>;
    occasions: TabSubState<Occasion>;
    products: TabSubState<Product>;
    setRevenueFilter: (f: "monthly" | "weekly") => void;
    handleTabChange: (tab: string) => void;
    handleCategoriesViewChange: (view: SubView, item?: Category | null) => void;
    handleOccasionsViewChange: (view: SubView, item?: Occasion | null) => void;
    handleProductsViewChange: (view: SubView, item?: Product | null) => void;
}

// ─── LocalStorage helpers ─────────────────────────────────────────────────────

const LS = {
    activeTab: "admin_active_tab",
} as const;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTabState(): TabStateReturn {
    const [activeTab, setActiveTab] = useState<string>(
        () => (typeof window !== "undefined" ? localStorage.getItem(LS.activeTab) ?? "overview" : "overview")
    );
    const [revenueFilter, setRevenueFilter] = useState<"monthly" | "weekly">("monthly");

    const [categories, setCategories] = useState<TabSubState<Category>>({
        view: "list",
        editing: null,
    });
    const [occasions, setOccasions] = useState<TabSubState<Occasion>>({
        view: "list",
        editing: null,
    });
    const [products, setProducts] = useState<TabSubState<Product>>({
        view: "list",
        editing: null,
    });

    // ── Handlers ──────────────────────────────────────────────────────────────

    const resetAllSubViews = () => {
        setCategories({ view: "list", editing: null });
        setOccasions({ view: "list", editing: null });
        setProducts({ view: "list", editing: null });
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        localStorage.setItem(LS.activeTab, tab);
        resetAllSubViews();
    };

    const handleCategoriesViewChange = (view: SubView, item?: Category | null) => {
        setCategories((prev) => ({
            view,
            editing: item !== undefined ? item : prev.editing,
        }));
    };

    const handleOccasionsViewChange = (view: SubView, item?: Occasion | null) => {
        setOccasions((prev) => ({
            view,
            editing: item !== undefined ? item : prev.editing,
        }));
    };

    const handleProductsViewChange = (view: SubView, item?: Product | null) => {
        setProducts((prev) => ({
            view,
            editing: item !== undefined ? item : prev.editing,
        }));
    };

    return {
        activeTab,
        revenueFilter,
        categories,
        occasions,
        products,
        setRevenueFilter,
        handleTabChange,
        handleCategoriesViewChange,
        handleOccasionsViewChange,
        handleProductsViewChange,
    };
}