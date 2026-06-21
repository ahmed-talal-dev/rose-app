"use client";

import { useTranslations } from "next-intl";
import {
    CreditCard,
    Gift,
    Flower,
    Cookie,
    Tag,
    RotateCcw,
    Star,
    X
} from "lucide-react";
import Image from "next/image";
import { Category } from "@/features/categories/types";
import { Occasion } from "@/features/occasions/types";
import { useState, useEffect } from "react";

const getCategoryIcon = (title: string) => {
    const term = title.toLowerCase();
    if (term.includes("flower") || term.includes("rose") || term.includes("bouquet") || term.includes("plant")) return Flower;
    if (term.includes("chocolate")) return Cookie;
    if (term.includes("card")) return CreditCard;
    if (term.includes("gift") || term.includes("decor")) return Gift;
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
        <aside className="w-full lg:w-75 flex flex-col gap-6 p-4 lg:p-0 lg:pe-6 border-zinc-200 dark:border-zinc-800 lg:border-e rtl:lg:border-e-0 rtl:lg:border-s text-start">
            <div className="flex flex-col items-start pt-2.5 pb-5 gap-2.5 w-full border-b border-zinc-100 dark:border-zinc-800 shrink-0 text-start">
                <div className="flex flex-row justify-between items-center w-full">
                    <h3 className="font-sarabun font-semibold text-lg leading-none text-zinc-800 dark:text-zinc-100">
                        {t("category")}
                    </h3>
                    {activeCategoryId && (
                        <button
                            onClick={() => onCategoryChange(null)}
                            className="flex flex-row items-center gap-1 font-inter font-normal text-sm leading-none text-red-600 hover:opacity-80 transition-opacity cursor-pointer outline-none border-none bg-transparent p-0"
                        >
                            <X className="size-3.75 shrink-0" strokeWidth={2} />
                            <span>{t("reset")}</span>
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-1 w-full h-50 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                    {categories.map((category) => {
                        const Icon = getCategoryIcon(category.title);
                        const isActive = activeCategoryId === category.id;

                        return (
                            <button
                                key={category.id}
                                onClick={() => onCategoryChange(isActive ? null : category.id)}
                                className={`flex flex-row items-center gap-2.5 w-full h-7 rounded overflow-hidden text-start border-none cursor-pointer focus:outline-none p-0 shrink-0 transition-colors ${
                                    isActive ? "bg-primary-50" : "bg-zinc-200 dark:bg-zinc-800 hover:opacity-90"
                                }`}
                            >
                                <div
                                    className={`w-9 h-full flex items-center justify-center shrink-0 transition-colors ${
                                        isActive ? "bg-primary-600 text-white" : "bg-zinc-500 text-white"
                                    }`}
                                >
                                    <Icon className="size-5" strokeWidth={1.5} />
                                </div>

                                <div
                                    className={`flex-1 h-full flex items-center transition-colors font-sarabun text-sm font-medium leading-none ${
                                        isActive ? "text-primary-700" : "text-zinc-800 dark:text-zinc-200"
                                    }`}
                                >
                                    {category.title}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-col items-start gap-2.5 pt-2.5 pb-5 border-b border-zinc-100 dark:border-zinc-800 w-[277px] h-75 shrink-0 text-start">
                <div className="flex flex-row justify-between items-center w-full h-4.5">
                    <h3 className="font-sarabun font-semibold text-lg leading-none text-zinc-800 dark:text-zinc-150 flex items-center">
                        {t("occasion")}
                    </h3>
                    {activeOccasionId && (
                        <button
                            onClick={() => onOccasionChange(null)}
                            className="flex flex-row items-center gap-1 cursor-pointer border-none bg-transparent p-0 text-xs text-red-600 font-inter font-normal"
                        >
                            <X className="size-3.5 text-red-600" strokeWidth={1.5} />
                            <span className="leading-4.25">{t("reset")}</span>
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2.5 w-full h-[242px] overflow-hidden">
                    {occasions.slice(0, 6).map((occasion) => {
                        const isActive = activeOccasionId === occasion.id;
                        const imageUrl = occasion.image?.startsWith("http")
                            ? occasion.image
                            : `${BASE_URL}${occasion.image}`;

                        const overlayGradient = isActive
                            ? "linear-gradient(180deg, rgba(0, 0, 0, 0.1375) 0%, rgba(166, 37, 42, 0.55) 100%)"
                            : "linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.8) 100%)";

                        return (
                            <button
                                key={occasion.id}
                                onClick={() => onOccasionChange(isActive ? null : occasion.id)}
                                className={`relative w-full h-[74px] rounded-lg overflow-hidden border-2 text-start transition-all cursor-pointer focus:outline-none p-0 shrink-0 ${
                                    isActive ? "border-rose-200" : "border-transparent"
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
                                    <div className="absolute inset-0 bg-primary-700" />
                                )}

                                <div
                                    className="absolute inset-0 transition-colors"
                                    style={{ backgroundImage: overlayGradient }}
                                />

                                <span className="absolute inset-0 flex items-center justify-center text-center text-white text-base font-medium font-sarabun px-2 leading-tight select-none z-10">
                                    {occasion.title}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-col items-start py-2.5 pb-5 gap-2.5 w-full border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between items-center w-full">
                    <h3 className="font-sarabun font-semibold text-lg leading-none text-zinc-800 dark:text-zinc-100">
                        {t("rating")}
                    </h3>
                    {activeRating !== null && (
                        <button
                            onClick={() => onRatingChange(null)}
                            className="flex flex-row items-center gap-1 font-inter font-normal text-sm leading-none text-red-600 hover:opacity-80 transition-opacity cursor-pointer outline-none border-none bg-transparent"
                        >
                            <X className="size-3.75 shrink-0" strokeWidth={2} />
                            <span>{t("reset")}</span>
                        </button>
                    )}
                </div>

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
                                    className={`size-6 transition-colors ${
                                        isHighlighted
                                            ? "fill-amber-500 text-amber-500"
                                            : "text-amber-500 fill-transparent"
                                    }`}
                                    strokeWidth={1.5}
                                />
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-col items-start py-2.5 pb-5 gap-2.5 w-full border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex flex-row justify-between items-center w-full">
                    <h3 className="font-sarabun font-semibold text-lg leading-none text-zinc-800 dark:text-zinc-100">
                        {t("price")}
                    </h3>
                    {(activeMinPrice || activeMaxPrice) && (
                        <button
                            onClick={() => {
                                setMinPrice("");
                                setMaxPrice("");
                                onPriceChange("", "");
                            }}
                            className="flex flex-row items-center gap-1 font-inter font-normal text-sm leading-none text-red-600 hover:opacity-80 transition-opacity cursor-pointer outline-none border-none bg-transparent"
                        >
                            <X className="size-3.75 shrink-0" strokeWidth={2} />
                            <span>{t("reset")}</span>
                        </button>
                    )}
                </div>

                <div className="flex flex-row items-start gap-2 w-full mt-1">
                    <div className="flex flex-col items-start gap-1.5 flex-1">
                        <label className="font-inter font-medium text-sm leading-none text-zinc-800 dark:text-zinc-300">
                            {t("from")}
                        </label>
                        <div className="w-full flex items-center px-4 h-12 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl focus-within:border-primary-700 transition-colors">
                            <input
                                type="number"
                                placeholder="0"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                onBlur={handlePriceSubmit}
                                onKeyDown={handlePriceKeyDown}
                                className="w-full bg-transparent outline-none font-inter font-normal text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 text-start"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col items-start gap-1.5 flex-1">
                        <label className="font-inter font-medium text-sm leading-none text-zinc-800 dark:text-zinc-300">
                            {t("to")}
                        </label>
                        <div className="w-full flex items-center px-4 h-12 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl focus-within:border-primary-700 transition-colors">
                            <input
                                type="number"
                                placeholder="1000000"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                onBlur={handlePriceSubmit}
                                onKeyDown={handlePriceKeyDown}
                                className="w-full bg-transparent outline-none font-inter font-normal text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 text-start"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full py-4">
                <button
                    onClick={onResetAll}
                    className="flex flex-row items-center justify-center gap-2.5 w-full h-10 px-4 bg-primary-50 hover:opacity-80 text-primary-600 rounded-xl transition-opacity outline-none border-none cursor-pointer"
                >
                    <RotateCcw className="size-4.5 shrink-0" strokeWidth={1.5} />
                    <span className="font-mulish font-semibold text-sm leading-normal">
                        {t("resetAll")}
                    </span>
                </button>
            </div>
        </aside>
    );
}
