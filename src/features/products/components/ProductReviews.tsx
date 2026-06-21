"use client";

import { useLocale, useTranslations } from "next-intl";
import { Star, Loader2 } from "lucide-react";
import { Review } from "@/features/reviews/types";

type ReviewUser = {
    firstName?: string;
    lastName?: string;
    username?: string;
    name?: string;
};

export type ExtendedReview = Review & {
    user?: ReviewUser;
    userName?: string;
};

interface ProductReviewsProps {
    reviews: ExtendedReview[];
    isLoggedIn: boolean;
    rating: number;
    onSetRating: (rating: number) => void;
    reviewTitle: string;
    onSetReviewTitle: (title: string) => void;
    reviewBody: string;
    onSetReviewBody: (body: string) => void;
    onSubmitReview: (e: React.FormEvent) => void;
    isSubmitting: boolean;
    productRating: number;
    ratingsCount: number;
}

export function ProductReviews({
    reviews,
    isLoggedIn,
    rating,
    onSetRating,
    reviewTitle,
    onSetReviewTitle,
    reviewBody,
    onSetReviewBody,
    onSubmitReview,
    isSubmitting,
    productRating,
    ratingsCount,
}: ProductReviewsProps) {
    const locale = useLocale();
    const t = useTranslations("products");
    const tCommon = useTranslations("common");

    const parseComment = (comment: string = "") => {
        const parts = comment.split("\n");
        if (parts.length > 1) {
            const title = parts[0].replace(/^Title:\s*/i, "").trim();
            const body = parts.slice(1).join("\n").replace(/^Review:\s*/i, "").trim();
            return { title, body };
        }
        return { title: "", body: comment };
    };

    const getUserName = (reviewItem: ExtendedReview) => {
        if (reviewItem.user) {
            const first = reviewItem.user.firstName || "";
            const last = reviewItem.user.lastName || "";
            if (first || last) return `${first} ${last}`.trim();
            return reviewItem.user.username || reviewItem.user.name || "Anonymous User";
        }
        return reviewItem.userName || "Anonymous User";
    };

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div id="reviews-section" className="mx-auto flex w-full max-w-[1280px] flex-col items-start gap-4 bg-transparent pt-8 text-start">
            <div className="relative flex w-full shrink-0 flex-col items-start gap-2.5">
                <div className="relative h-10 w-[268px] shrink-0">
                    <div className="absolute top-6 left-0 h-4 w-[154px] rounded-r-2xl bg-rose-100 dark:bg-[#741C21]/40" />
                    <div className="absolute top-[39px] left-0 h-0.5 w-[60px] bg-rose-600" />
                    <h2 className="absolute top-0 left-0 m-0 flex h-9 w-[268px] items-center font-sarabun text-4xl font-bold leading-none text-primary-700 dark:text-rose-300 z-10">
                        {t("reviewsTitle")}
                    </h2>
                </div>

                <div className="mt-2 flex flex-col items-start gap-1 shrink-0">
                    <span className="font-sarabun text-xl font-semibold leading-none text-zinc-800 dark:text-zinc-200">
                        {t("generalRating")}
                    </span>

                    <div className="flex flex-col items-start gap-1 shrink-0">
                        <div className="flex flex-row items-baseline gap-1.5">
                            <span className="font-sarabun text-2xl font-bold leading-none text-zinc-800 dark:text-zinc-100">
                                {productRating.toFixed(1)}
                            </span>
                            <span className="font-sarabun text-sm font-medium leading-none text-zinc-400 dark:text-zinc-500 hover:underline">
                                ({ratingsCount} {t("ratings")})
                            </span>
                        </div>

                        <div className="flex h-5 w-full flex-row items-center p-0 shrink-0">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Star
                                    key={index}
                                    className={`h-5 w-5 shrink-0 ${
                                        index < Math.round(productRating)
                                            ? "fill-[#FFA508] text-[#FFA508]"
                                            : "fill-transparent text-[#FFA508]"
                                    }`}
                                    strokeWidth={1.5}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-px w-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />

            <div className="flex w-full flex-col gap-5 lg:flex-row items-start p-0">
                <div className="flex w-full flex-col gap-2.5 overflow-y-auto px-1.5 py-2 [scrollbar-width:thin] lg:w-[756px] shrink-0 max-h-[500px]">
                    {reviews.length === 0 ? (
                        <div className="mx-auto flex w-full flex-col items-center justify-center rounded-xl border border-zinc-100 bg-zinc-50 p-10 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
                            <span className="font-sarabun text-base text-zinc-500 dark:text-zinc-400">
                                {t("noReviews")}
                            </span>
                        </div>
                    ) : (
                        <div className="flex w-full flex-col">
                            {reviews.map((reviewItem) => {
                                const { title, body } = parseComment(reviewItem.comment);
                                const name = getUserName(reviewItem);
                                const initial = name.charAt(0).toUpperCase() || "U";

                                return (
                                    <div
                                        key={reviewItem.id}
                                        className="box-border flex w-full flex-col items-start gap-2.5 border-b border-zinc-100 pb-4 mb-4 dark:border-zinc-800 shrink-0 last:border-b-0 lg:w-[742px]"
                                    >
                                        <div className="flex flex-row items-center gap-2.5 px-0.5 shrink-0">
                                            <div className="flex h-11 w-11 select-none flex-row justify-center items-center rounded-full bg-primary-600 font-sarabun text-xl font-semibold leading-none text-white">
                                                {initial}
                                            </div>
                                            <div className="flex flex-col items-start justify-center gap-1 shrink-0">
                                                <span className="font-sarabun text-base font-semibold leading-none text-zinc-800 dark:text-zinc-200">
                                                    {name}
                                                </span>
                                                <span className="font-sarabun text-sm font-medium leading-none text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                                                    {formatDate(reviewItem.createdAt)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex h-5 w-full flex-row items-center gap-1.5 shrink-0">
                                            <div className="flex h-5 w-full flex-row items-center p-0 shrink-0">
                                                {Array.from({ length: 5 }).map((_, index) => (
                                                    <Star
                                                        key={index}
                                                        className={`h-5 w-5 shrink-0 ${
                                                            index < reviewItem.rating
                                                                ? "fill-[#FFA508] text-[#FFA508]"
                                                                : "fill-transparent text-[#FFA508]"
                                                        }`}
                                                        strokeWidth={1.5}
                                                    />
                                                ))}
                                            </div>
                                            <span className="flex items-center font-sarabun text-base font-semibold leading-none text-zinc-800 dark:text-zinc-200">
                                                ({reviewItem.rating.toFixed(1)})
                                            </span>
                                        </div>

                                        <div className="flex w-full flex-col items-start gap-1.5 px-0 py-1 shrink-0">
                                            {title && (
                                                <h4 className="font-sarabun text-base font-semibold leading-none text-[#000000] dark:text-white">
                                                    {title}
                                                </h4>
                                            )}
                                            <p className="m-0 w-full font-sarabun text-base font-normal leading-snug text-zinc-600 dark:text-zinc-400 lg:w-[742px]">
                                                {body}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="hidden h-[367px] w-px self-stretch bg-zinc-200 dark:bg-zinc-800 lg:block" />

                <form
                    onSubmit={onSubmitReview}
                    className="mx-auto flex w-full flex-col justify-start items-start gap-2.5 lg:mx-0 lg:w-[484px] shrink-0"
                >
                    <div className="flex h-11 w-full flex-row items-center gap-2.5 py-2.5 px-0 shrink-0">
                        <span className="select-none font-sarabun text-base font-medium leading-none text-zinc-800 dark:text-zinc-200">
                            {t("yourRating")}
                        </span>
                        <div className="flex h-6 w-full flex-row items-center gap-1 shrink-0">
                            {Array.from({ length: 5 }).map((_, index) => {
                                const starVal = index + 1;
                                const isActive = starVal <= rating;
                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => onSetRating(starVal)}
                                        className="flex cursor-pointer items-center justify-center border-none bg-transparent p-0 outline-none transition-transform hover:scale-105"
                                    >
                                        <Star
                                            className={`h-6 w-6 shrink-0 transition-colors ${
                                                isActive ? "fill-[#FFA508] text-[#FFA508]" : "fill-transparent text-[#FFA508]"
                                            }`}
                                            strokeWidth={1.5}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex w-full flex-col items-start gap-1.5 lg:w-[484px] shrink-0">
                        <label className="font-inter text-sm font-medium text-zinc-800 dark:text-zinc-300">
                            {t("reviewTitleLabel")}
                        </label>
                        <input
                            type="text"
                            placeholder={t("reviewTitlePlaceholder")}
                            value={reviewTitle}
                            onChange={(e) => onSetReviewTitle(e.target.value)}
                            className="box-border flex h-12 w-full flex-row items-center rounded-lg border border-zinc-300 bg-white px-4 font-inter text-sm text-zinc-800 placeholder-zinc-400 outline-none transition-colors focus:border-primary-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        />
                    </div>

                    <div className="flex w-full flex-col items-start gap-1.5 lg:w-[484px] shrink-0">
                        <label className="font-inter text-sm font-medium text-zinc-800 dark:text-zinc-300">
                            {t("reviewTextLabel")}
                        </label>
                        <textarea
                            placeholder={t("reviewTextPlaceholder")}
                            value={reviewBody}
                            onChange={(e) => onSetReviewBody(e.target.value)}
                            className="box-border flex min-h-[150px] h-[150px] w-full flex-row items-start rounded-lg border border-zinc-300 bg-white p-4 font-inter text-sm text-zinc-800 placeholder-zinc-400 outline-none transition-colors focus:border-primary-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 resize-y"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !isLoggedIn}
                        className="mt-2 flex h-11 w-full cursor-pointer flex-row justify-center items-center rounded-lg border-none bg-primary-600 px-4 shadow-sm transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:opacity-50 text-white font-sarabun text-base font-medium leading-none outline-none lg:w-[484px]"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-5 w-5 animate-spin text-white" />
                        ) : (
                            <span>{t("addReviewButton")}</span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
