"use client";

import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import Image from "next/image";
import { useTestimonials } from "@/features/testimonials/hooks/use-testimonials";
import { Testimonial } from "@/features/testimonials/types";

export function TestimonialsSection() {
    const t = useTranslations("home.testimonials");

    // Fetch dynamic testimonials from the API (approved, limit 3)
    const { data } = useTestimonials({ isApproved: true, limit: 3 });
    const apiTestimonials = data?.data ?? [];

    // Static fallback testimonials matching the mockup design
    const staticTestimonials = [
        {
            id: "static-1",
            name: t("jakeName"),
            email: "jake@example.com",
            content: t("jakeReview"),
            rating: 4,
            image: "/images/jake-miller.png",
            createdAt: "2025-01-12T00:00:00Z",
            isStatic: true,
            dateKey: "jakeDate"
        },
        {
            id: "static-2",
            name: t("tylerName"),
            email: "tyler@example.com",
            content: t("tylerReview"),
            rating: 4,
            image: "/images/tyler-brooks.png",
            createdAt: "2025-01-12T00:00:00Z",
            isStatic: true,
            dateKey: "tylerDate"
        },
        {
            id: "static-3",
            name: t("maxName"),
            email: "max@example.com",
            content: t("maxReview"),
            rating: 4,
            image: "/images/max-turner.png",
            createdAt: "2025-01-12T00:00:00Z",
            isStatic: true,
            dateKey: "maxDate"
        }
    ];

    // Use API testimonials if available, otherwise fallback to static testimonials
    const testimonialsToDisplay = apiTestimonials.length > 0 ? apiTestimonials.slice(0, 3) : staticTestimonials;

    type StaticTestimonial = Testimonial & { isStatic?: boolean; dateKey?: string };
    const resolveAvatar = (item: StaticTestimonial, index: number) => {
        if (item.image) return item.image;
        if (index === 0) return "/images/jake-miller.png";
        if (index === 1) return "/images/tyler-brooks.png";
        if (index === 2) return "/images/max-turner.png";
        return "/images/placeholder.svg";
    };

    const formatDate = (item: StaticTestimonial) => {
        if (item.isStatic && item.dateKey) {
            return t(item.dateKey);
        }
        try {
            const date = new Date(item.createdAt);
            return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        } catch {
            return "January 12, 2025";
        }
    };

    return (
        <section className="w-full flex flex-col items-center justify-start gap-[40px] bg-background dark:bg-zinc-800 font-sarabun py-12 lg:h-[660px] lg:py-0">
            {/* Header: width 562px, height 70px on desktop */}
            <div className="w-full max-w-[562px] lg:h-[70px] flex flex-col items-center lg:justify-between relative px-4 sm:px-0 gap-2 lg:gap-0">
                {/* Eyebrow: height 21px */}
                <span className="w-full text-center text-[16px] font-bold tracking-[0.25em] uppercase text-[#FF668B] h-[21px] flex items-center justify-center">
                    {t("eyebrow")}
                </span>

                {/* Heading container: height 41px */}
                <div className="w-full h-[41px] relative mt-2 flex justify-center items-center">
                    {/* Rectangle 1 (underlying pink highlight): width 402px, height 17px, top 24px */}
                    <div
                        className="absolute w-[280px] sm:w-[402px] h-[17px] bg-[#FDCFD4]/50 dark:bg-[#4A1519]/40 rounded-full inset-x-0 mx-auto top-[24px]"
                    />

                    {/* Rectangle 2 (darker red accent line): width 157px, height 2px, top 39px */}
                    <div className="absolute w-[110px] sm:w-[157px] h-[2px] bg-[#A6252A] dark:bg-[#FF668B] inset-x-0 mx-auto top-[39px]" />

                    {/* Heading text: height 41px, font-size 36px, color #A6252A */}
                    <h2 className="relative font-sarabun font-bold text-[26px] sm:text-[36px] leading-[41px] text-[#A6252A] dark:text-[#FDCFD4] z-10 text-center select-none whitespace-nowrap">
                        {t("title")}
                    </h2>
                </div>
            </div>

            {/* Cards Area: full-width, background dark slate-gray #3A3A3C, height 550px on desktop */}
            <div className="w-full bg-[#3A3A3C] dark:bg-zinc-700 py-12 lg:py-0 lg:h-[550px] flex items-center justify-center">
                <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-[40px] px-4 max-w-7xl w-full">
                    {(testimonialsToDisplay as StaticTestimonial[]).map((item, index) => {
                        const avatarUrl = resolveAvatar(item, index);
                        const displayDate = formatDate(item);
                        const rating = item.rating || 4;

                        return (
                            <div
                                key={item.id || index}
                                className="w-full max-w-[404px] h-[433px] relative shrink-0"
                            >
                                {/* Avatar: size 120x120px, top: 44.5px, left: centered */}
                                <div className="absolute w-[120px] h-[120px] left-1/2 -translate-x-1/2 top-[44.5px] border-[3px] border-white rounded-full z-20 overflow-hidden bg-white shadow-md">
                                    <Image
                                        src={avatarUrl}
                                        alt={item.name}
                                        width={120}
                                        height={120}
                                        className="w-full h-full object-cover"
                                        priority
                                    />
                                </div>

                                {/* Card content container: size 343x250px, top: 119.5px, left: centered */}
                                <div className="absolute w-[343px] max-w-[90%] h-[250px] left-1/2 -translate-x-1/2 top-[119.5px] bg-white  rounded-[24px] shadow-lg pt-[55px] pb-5 px-5 flex flex-col items-center justify-between z-10">
                                    {/* Name: font-size 16px, dark color */}
                                    <h3 className="text-base font-semibold text-[#1C1C1E] dark:text-zinc-800 text-center w-full truncate h-5">
                                        {item.name}
                                    </h3>

                                    {/* Stars: height 15px, color #FBA707 */}
                                    <div className="flex items-center justify-center gap-1 w-full h-[15px]">
                                        {Array.from({ length: 5 }).map((_, j) => (
                                            <Star
                                                key={j}
                                                className={`size-[15px] ${j < rating
                                                    ? "fill-[#FBA707] text-[#FBA707]"
                                                    : "text-[#E5E5EA] dark:text-zinc-600"
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    {/* Review text: font-size 16px, dark gray text */}
                                    <p className="text-[14px] sm:text-base font-normal text-[#2C2C2E] dark:text-zinc-800 text-center leading-relaxed h-[72px] overflow-hidden text-ellipsis flex items-center justify-center w-full">
                                        {item.content}
                                    </p>

                                    {/* Date: font-size 12px, muted text */}
                                    <span className="text-xs font-medium text-[#8E8E93] dark:text-zinc-400 text-center w-full h-4 block">
                                        {displayDate}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}