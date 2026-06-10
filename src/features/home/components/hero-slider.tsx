"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

interface Slide {
    key: string;
    image: string;
    title: string;
    subtitle: string;
    cta: string;
    href: string;
}

export function HeroSlider() {
    const t = useTranslations("home.hero");
    const [current, setCurrent] = useState(0);

    const slides: Slide[] = [
        {
            key: "slide1",
            image: "/images/product-3.svg",
            title: t("slide1.title"),
            subtitle: t("slide1.subtitle"),
            cta: t("slide1.cta"),
            href: "/products",
        },
        {
            key: "slide2",
            image: "/images/product-4.svg",
            title: t("slide2.title"),
            subtitle: t("slide2.subtitle"),
            cta: t("slide2.cta"),
            href: "/products",
        },
        {
            key: "slide3",
            image: "/images/product-5.svg",
            title: t("slide3.title"),
            subtitle: t("slide3.subtitle"),
            cta: t("slide3.cta"),
            href: "/products",
        },
    ];

    const next = useCallback(() => setCurrent((prev) => (prev + 1) % slides.length), [slides.length]);
    const prev = useCallback(() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length), [slides.length]);

    useEffect(() => {
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, [next]);

    return (
        <section className="w-full dark:bg-zinc-800 text-rose-200">
            <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row justify-between items-stretch gap-4 lg:gap-9 py-4 lg:py-6">
                    {/* Left Card */}
                    <div className="group relative flex flex-col justify-end items-start p-4 sm:p-5 lg:p-6 gap-2 lg:gap-2.5 w-full lg:w-[301px] h-[200px] sm:h-[240px] lg:h-[439px] rounded-2xl overflow-hidden shrink-0">
                        <Image
                            src="/images/cover.svg"
                            alt="Special Gifts"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            priority
                        />
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="relative z-10 flex flex-col gap-2 lg:gap-2.5">
                            <div className="flex justify-center items-center px-2 py-0.5 w-fit h-4 bg-primary-50 dark:bg-[#FDF0F1] rounded-[999px]">
                                <span className="text-[10px] sm:text-[12px] font-medium leading-[100%] text-primary-600 dark:text-[#4A1519] font-sarabun whitespace-nowrap">
                                    {t("leftCard.badge")}
                                </span>
                            </div>
                            <h2 className="max-w-[250px] sm:max-w-[280px] lg:max-w-[253px] text-[16px] sm:text-[20px] lg:text-[24px] font-semibold leading-[110%] lg:leading-[100%] text-white font-sarabun">
                                {t("leftCard.title")}
                            </h2>
                            <Link
                                href="/products"
                                className="flex flex-row justify-center items-center px-3 sm:px-4 py-2 gap-1.5 w-fit min-w-[100px] sm:w-[130px] h-8 sm:h-9 bg-primary-50 dark:bg-[#FDF0F1] rounded-[10px] hover:bg-primary-100 dark:hover:bg-[#E6CEB5] transition-colors"
                            >
                                <span className="text-[13px] sm:text-[16px] font-normal leading-[100%] text-primary-700 dark:text-[#4A1519] font-sarabun">
                                    {t("leftCard.cta")}
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-700 dark:text-[#4A1519]" strokeWidth={1.45833} />
                            </Link>
                        </div>
                    </div>

                    {/* Right Carousel */}
                    <div className="flex flex-col items-start w-full lg:w-[955px] h-[250px] sm:h-[300px] lg:h-[440px] rounded-2xl relative overflow-hidden isolate">
                        {slides.map((slide, index) => (
                            <div
                                key={slide.key}
                                className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${index === current ? "opacity-100 z-10" : "opacity-0 z-0"
                                    }`}
                            >
                                <Image
                                    src={slide.image}
                                    alt={slide.title}
                                    fill
                                    className="object-cover"
                                    priority={index === 0}
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                                <div className="absolute inset-0 flex flex-col justify-end items-start p-4 sm:p-6 lg:p-9 gap-1 lg:gap-1.5">
                                    <h2 className="text-[20px] sm:text-[28px] lg:text-[36px] font-semibold leading-[110%] lg:leading-[100%] text-white font-sarabun max-w-[90%] lg:max-w-none">
                                        {slide.title}
                                    </h2>
                                    <p className="max-w-[200px] sm:max-w-[250px] lg:max-w-[270px] text-[13px] sm:text-[15px] lg:text-[16px] font-normal leading-[130%] lg:leading-[100%] text-white font-sarabun">
                                        {slide.subtitle}
                                    </p>
                                    <Link
                                        href={slide.href}
                                        className="flex flex-row justify-center items-center px-3 sm:px-4 py-2 gap-2 w-fit min-w-[80px] sm:w-[129px] h-8 sm:h-9 bg-primary-50 dark:bg-[#FDF0F1] rounded-[10px] mt-1 hover:bg-primary-100 dark:hover:bg-[#E6CEB5] transition-colors"
                                    >
                                        <span className="text-[13px] sm:text-[16px] font-normal leading-[100%] text-primary-700 dark:text-[#4A1519] font-sarabun">
                                            {slide.cta}
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {/* Navigation Arrows */}
                        <div className="absolute inset-e-3 sm:inset-e-6 lg:inset-e-8 bottom-3 sm:bottom-5 lg:bottom-[30.5px] flex flex-row justify-between items-center w-[55px] sm:w-[65px] lg:w-[74px] h-[28px] sm:h-[32px] lg:h-[35px] bg-primary-50 dark:bg-[#FDF0F1] rounded-[999px] z-20">
                            <button onClick={prev} className="flex justify-center items-center w-5 sm:w-6 lg:w-[30px] h-5 sm:h-6 lg:h-[30px]" aria-label={t("prev")}>
                                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-[15px] text-muted-foreground dark:text-[#4A1519]/60" strokeWidth={2} />
                            </button>
                            <button onClick={next} className="flex justify-center items-center w-5 sm:w-6 lg:w-[30px] h-5 sm:h-6 lg:h-[30px]" aria-label={t("next")}>
                                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-[15px] text-primary-700 dark:text-[#4A1519]" strokeWidth={2} />
                            </button>
                        </div>

                        {/* Pagination Dots */}
                        <div className="absolute right-3 sm:right-6 lg:right-8 top-3 sm:top-5 lg:top-[27.5px] flex flex-row items-center gap-1.5 sm:gap-2 z-20">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrent(index)}
                                    className={`rounded-[46.6px] transition-all duration-300 ${index === current
                                        ? "w-5 sm:w-7 lg:w-9 h-1.5 sm:h-2 lg:h-2.5 bg-primary dark:bg-[#E6CEB5]"
                                        : "w-1.5 sm:w-2 lg:w-2.5 h-1.5 sm:h-2 lg:h-2.5 bg-primary-50 dark:bg-[#FDF0F1]/40"
                                        }`}
                                    aria-label={t("goToSlide", { number: index + 1 })}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}