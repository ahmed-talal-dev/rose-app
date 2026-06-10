"use client";

import { useTranslations } from "next-intl";
import {
    CreditCard,
    Gift,
    Flower,
    Cookie,
    Package,
    Tag,
    RotateCcw,
    Star,
    X
} from "lucide-react";
import Image from "next/image";
import { Category } from "@/features/categories/types";
import { Occasion } from "@/features/occasions/types";
import { useState, useEffect } from "react";

// Map category title to appropriate Lucide icon dynamically
const getCategoryIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("flower") || t.includes("rose") || t.includes("bouquet") || t.includes("plant")) return Flower;
    if (t.includes("chocolate")) return Cookie;
    if (t.includes("card")) return CreditCard;
    if (t.includes("gift") || t.includes("decor")) return Gift;
    return Tag;
};

type SidebarFiltersProps = {
    categories: Category[];
    occasions: Occasion[];
    activeCategoryId: string | null;
    activeOccasionId: string | null;
    activeRating: number | null;
    activeMinPrice: string;
    activeMaxPrice: string;
    onCategoryChange: (id: string | null) => void;
    onOccasionChange: (id: string | null) => void;
    onRatingChange: (rating: number | null) => void;
    onPriceChange: (min: string, max: string) => void;
    onResetAll: () => void;
};

export function SidebarFilters({
    categories,
    occasions,
    activeCategoryId,
    activeOccasionId,
    activeRating,
    activeMinPrice,
    activeMaxPrice,
    onCategoryChange,
    onOccasionChange,
    onRatingChange,
    onPriceChange,
    onResetAll
}: SidebarFiltersProps) {
    const t = useTranslations("products");
    const tCommon = useTranslations("common");

    const [minPrice, setMinPrice] = useState(activeMinPrice);
    const [maxPrice, setMaxPrice] = useState(activeMaxPrice);

    // Sync state when props change
    useEffect(() => {
        setMinPrice(activeMinPrice);
    }, [activeMinPrice]);

    useEffect(() => {
        setMaxPrice(activeMaxPrice);
    }, [activeMaxPrice]);

    const handlePriceSubmit = () => {
        onPriceChange(minPrice, maxPrice);
    };

    const handlePriceKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handlePriceSubmit();
        }
    };

    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://rose-app.elevate-bootcamp.cloud";

    return (
        <aside className="w-full lg:w-[300px] flex flex-col gap-6 p-4 lg:p-0 lg:pe-6 border-zinc-200 dark:border-zinc-800 lg:border-e rtl:lg:border-e-0 rtl:lg:border-s text-start">

            {/* ── Category Section ── */}
            <div className="flex flex-col items-start pt-[10px] pb-[20px] gap-[10px] w-full border-b border-[#F4F4F5] dark:border-zinc-800 shrink-0 text-start">
                {/* Headline */}
                <div className="flex flex-row justify-between items-center w-full">
                    <h3 className="font-sarabun font-semibold text-[18px] leading-none text-[#27272A] dark:text-zinc-100">
                        {t("category")}
                    </h3>
                    {activeCategoryId && (
                        <button
                            onClick={() => onCategoryChange(null)}
                            className="flex flex-row items-center gap-1 font-inter font-normal text-[14px] leading-none text-[#DC2626] hover:opacity-80 transition-opacity cursor-pointer outline-none border-none bg-transparent p-0"
                        >
                            <X className="w-[15px] h-[15px] shrink-0" strokeWidth={2} />
                            <span>{t("reset")}</span>
                        </button>
                    )}
                </div>

                {/* Categories Scroll Area (height: 199px, gap: 4px) */}
                <div className="flex flex-col gap-[4px] w-full h-[199px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                    {categories.map((category) => {
                        const Icon = getCategoryIcon(category.title);
                        const isActive = activeCategoryId === category.id;

                        return (
                            <button
                                key={category.id}
                                onClick={() => onCategoryChange(isActive ? null : category.id)}
                                className={`flex flex-row items-center gap-[10px] w-full h-[28px] rounded-[4px] overflow-hidden text-start border-none cursor-pointer focus:outline-none p-0 shrink-0 transition-colors ${isActive ? "bg-[#FBEAEA]" : "bg-[#E4E4E7] dark:bg-zinc-800 hover:opacity-90"
                                    }`}
                            >
                                {/* Left: Icon Box */}
                                <div
                                    className={`w-[36px] h-full flex items-center justify-center shrink-0 transition-colors ${isActive ? "bg-[#A6252A] text-white" : "bg-[#71717A] text-white"
                                        }`}
                                >
                                    <Icon className="w-[20px] h-[20px]" strokeWidth={1.5} />
                                </div>

                                {/* Right: Text Box */}
                                <div
                                    className={`flex-1 h-full flex items-center transition-colors font-sarabun text-[14px] font-medium leading-none ${isActive ? "text-[#741C21]" : "text-[#27272A] dark:text-zinc-200"
                                        }`}
                                >
                                    {category.title}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Occasion Section (Matches CSS specs) ── */}
            <div className="flex flex-col items-start gap-2.5 pt-2.5 pb-5 border-b border-[#F4F4F5] dark:border-zinc-800 w-[277px] h-[300px] shrink-0 text-start">
                {/* Headline */}
                <div className="flex flex-row justify-between items-center w-full h-[18px]">
                    <h3 className="font-sarabun font-semibold text-[18px] leading-none text-[#27272A] dark:text-zinc-150 flex items-center">
                        {t("occasion")}
                    </h3>
                    {activeOccasionId && (
                        <button
                            onClick={() => onOccasionChange(null)}
                            className="flex flex-row items-center gap-1 cursor-pointer border-none bg-transparent p-0 text-xs text-[#DC2626] font-inter font-normal"
                        >
                            <X className="size-[15px] text-[#DC2626]" strokeWidth={1.5} />
                            <span className="leading-[17px]">{t("reset")}</span>
                        </button>
                    )}
                </div>

                {/* Occasions Grid (height: 242px) */}
                <div className="flex flex-row flex-wrap gap-[10px] w-full h-[242px] overflow-hidden">
                    {occasions.slice(0, 6).map((occasion) => {
                        const isActive = activeOccasionId === occasion.id;
                        const imageUrl = occasion.image?.startsWith("http")
                            ? occasion.image
                            : `${BASE_URL}${occasion.image}`;

                        // Active and Inactive gradients from the CSS specs
                        const overlayGradient = isActive
                            ? "linear-gradient(180deg, rgba(0, 0, 0, 0.1375) 0%, rgba(166, 37, 42, 0.55) 100%)"
                            : "linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.8) 100%)";

                        return (
                            <button
                                key={occasion.id}
                                onClick={() => onOccasionChange(isActive ? null : occasion.id)}
                                className={`relative w-[133px] h-[74px] rounded-[8px] overflow-hidden border-2 text-start transition-all cursor-pointer focus:outline-none p-0 shrink-0 ${isActive ? "border-[#FFC2D0]" : "border-transparent"
                                    }`}
                            >
                                {occasion.image ? (
                                    <Image
                                        src={imageUrl}
                                        alt={occasion.title}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "/images/placeholder.svg";
                                        }}
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-[#741C21]" />
                                )}

                                {/* Overlay with dynamic gradient */}
                                <div
                                    className="absolute inset-0 transition-colors"
                                    style={{ backgroundImage: overlayGradient }}
                                />

                                {/* Label (16px, medium, white/zinc-50) */}
                                <span className="absolute inset-0 flex items-center justify-center text-center text-[#FAFAFA] text-[16px] font-medium font-sarabun px-2 leading-tight select-none z-10">
                                    {occasion.title}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Rating Section ── */}
            <div className="flex flex-col items-start py-2.5 pb-5 gap-2.5 w-full border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between items-center w-full">
                    <h3 className="font-sarabun font-semibold text-[18px] leading-none text-[#27272A] dark:text-zinc-100">
                        {t("rating")}
                    </h3>
                    {activeRating !== null && (
                        <button
                            onClick={() => onRatingChange(null)}
                            className="flex flex-row items-center gap-1 font-inter font-normal text-[14px] leading-none text-[#DC2626] hover:opacity-80 transition-opacity cursor-pointer outline-none border-none bg-transparent"
                        >
                            <X className="w-[15px] h-[15px] shrink-0" strokeWidth={2} />
                            <span>{t("reset")}</span>
                        </button>
                    )}
                </div>

                {/* 5 Stars row */}
                <div className="flex flex-row items-start gap-2 py-1">
                    {Array.from({ length: 5 }).map((_, index) => {
                        const starVal = index + 1;
                        const isHighlighted = activeRating !== null && starVal <= activeRating;
                        return (
                            <button
                                key={index}
                                onClick={() => onRatingChange(activeRating === starVal ? null : starVal)}
                                className="focus:outline-none cursor-pointer border-none bg-transparent p-0 hover:scale-110 transition-transform"
                                aria-label={`${starVal} stars`}
                            >
                                <Star
                                    className={`w-[25px] h-[25px] transition-colors ${isHighlighted
                                        ? "fill-[#FFA508] text-[#FFA508]"
                                        : "text-[#FFA508] fill-transparent"
                                        }`}
                                    strokeWidth={1.5}
                                />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Price Section ── */}
            <div className="flex flex-col items-start py-2.5 pb-5 gap-2.5 w-full border-b border-zinc-100 dark:border-zinc-800">
                {/* Headline */}
                <div className="flex flex-row justify-between items-center w-full">
                    <h3 className="font-sarabun font-semibold text-[18px] leading-none text-[#27272A] dark:text-zinc-100">
                        {t("price")}
                    </h3>
                    {(activeMinPrice || activeMaxPrice) && (
                        <button
                            onClick={() => {
                                setMinPrice("");
                                setMaxPrice("");
                                onPriceChange("", "");
                            }}
                            className="flex flex-row items-center gap-1 font-inter font-normal text-[14px] leading-none text-[#DC2626] hover:opacity-80 transition-opacity cursor-pointer outline-none border-none bg-transparent"
                        >
                            <X className="w-[15px] h-[15px] shrink-0" strokeWidth={2} />
                            <span>{t("reset")}</span>
                        </button>
                    )}
                </div>

                {/* Inputs Row */}
                <div className="flex flex-row items-start gap-2 w-full mt-1">
                    {/* From */}
                    <div className="flex flex-col items-start gap-1.5 flex-1">
                        <label className="font-inter font-medium text-[14px] leading-none text-[#27272A] dark:text-zinc-300">
                            {t("from")}
                        </label>
                        <div className="w-full flex items-center px-4 h-[49px] bg-white dark:bg-zinc-800 border border-[#D4D4D8] dark:border-zinc-700 rounded-[10px] focus-within:border-[#741C21] transition-colors">
                            <input
                                type="number"
                                placeholder="0"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                onBlur={handlePriceSubmit}
                                onKeyDown={handlePriceKeyDown}
                                className="w-full bg-transparent outline-none font-inter font-normal text-[14px] text-[#27272A] dark:text-zinc-100 placeholder:text-[#A1A1AA] text-start"
                            />
                        </div>
                    </div>

                    {/* To */}
                    <div className="flex flex-col items-start gap-1.5 flex-1">
                        <label className="font-inter font-medium text-[14px] leading-none text-[#27272A] dark:text-zinc-300">
                            {t("to")}
                        </label>
                        <div className="w-full flex items-center px-4 h-[49px] bg-white dark:bg-zinc-800 border border-[#D4D4D8] dark:border-zinc-700 rounded-[10px] focus-within:border-[#741C21] transition-colors">
                            <input
                                type="number"
                                placeholder="1000000"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                onBlur={handlePriceSubmit}
                                onKeyDown={handlePriceKeyDown}
                                className="w-full bg-transparent outline-none font-inter font-normal text-[14px] text-[#27272A] dark:text-zinc-100 placeholder:text-[#A1A1AA] text-start"
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/* ── Reset All Button ── */}
            <div className="w-full py-4">
                <button
                    onClick={onResetAll}
                    className="flex flex-row items-center justify-center gap-[10px] w-full h-[41px] px-4 bg-[#FBEAEA] hover:opacity-80 text-[#A6252A] rounded-[10px] transition-opacity outline-none border-none cursor-pointer"
                >
                    <RotateCcw className="w-[18px] h-[18px] shrink-0" strokeWidth={1.5} />
                    <span className="font-mulish font-semibold text-[14px] leading-[1.5]">
                        {t("resetAll")}
                    </span>
                </button>
            </div>
        </aside>
    );
}
