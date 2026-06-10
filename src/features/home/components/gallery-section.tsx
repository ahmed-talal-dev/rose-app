"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export function GallerySection() {
    const t = useTranslations("home.gallery");

    // Exact layout style parameters matching the mockup's CSS coordinates
    const images = [
        {
            src: "/images/cover.svg",
            style: { left: "0px", top: "0px", width: "418px", height: "617px" },
            alt: "Wedding Gift Box Set"
        },
        {
            src: "/images/product-8.svg",
            style: { left: "431px", top: "0px", width: "419px", height: "411px" },
            alt: "Red Roses Gift Box"
        },
        {
            src: "/images/product-5.svg",
            style: { left: "863px", top: "0px", width: "418px", height: "411px" },
            alt: "Engagement Ring Box with Flowers"
        },
        {
            src: "/images/product-11.svg",
            style: { left: "431px", top: "426px", width: "419px", height: "611px" },
            alt: "Engagement Ring Close Up"
        },
        {
            src: "/images/product-9.svg",
            style: { left: "863px", top: "426px", width: "418px", height: "611px" },
            alt: "Engagement Card and Ring Box"
        },
        {
            src: "/images/product-10.svg",
            style: { left: "0px", top: "631px", width: "418px", height: "406px" },
            alt: "Heart Chocolates Box and Roses"
        }
    ];

    return (
        <section className="py-16 lg:py-24 bg-background dark:bg-zinc-800 overflow-hidden">
            {/* Gallery Wrapper: flex flex-col items-center gap-10, w: 1281px */}
            <div className="mx-auto max-w-[1281px] px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-10">

                {/* Header: w: 534px, h: 70px */}
                <div className="w-full max-w-[534px] h-[70px] relative flex flex-col items-center select-none">
                    {/* GALLERY Eyebrow */}
                    <span className="text-[#FF668B] font-sarabun font-bold text-base leading-[21px] tracking-[0.25em] uppercase text-center w-full">
                        {t("eyebrow")}
                    </span>

                    {/* Heading Box */}
                    <div className="w-full h-[41px] relative mt-2 flex justify-center lg:justify-start">
                        {/* Rectangle 1 Highlight */}
                        <div className="absolute w-[402px] h-[17px] inset-s-0 top-[24px] bg-[#FDCFD4]/50 dark:bg-[#4A1519]/40 rounded-e-[20px]" />

                        {/* Rectangle 2 Accent Line */}
                        <div className="absolute w-[157px] h-[2px] inset-s-0 top-[39px] bg-[#A6252A] dark:bg-[#FF668B]" />

                        {/* Text */}
                        <h2 className="absolute inset-x-0 top-0 font-sarabun font-bold text-[36px] leading-[36px] text-[#A6252A] dark:text-[#FDCFD4] z-10 whitespace-nowrap">
                            {t("title")}
                        </h2>
                    </div>
                </div>

                {/* Images grid/absolute box: w: 1281px, h: 1037px */}
                {/* Mobile View: Simple Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:hidden w-full">
                    {images.map((img, i) => (
                        <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-sm group">
                            <Image
                                src={img.src}
                                alt={img.alt}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                        </div>
                    ))}
                </div>

                {/* Desktop View: Exact absolute-positioned layout matching mockup */}
                <div className="hidden lg:block w-[1281px] h-[1037px] relative select-none shrink-0">
                    {images.map((img, i) => (
                        <div
                            key={i}
                            className="absolute overflow-hidden group bg-muted transition-all duration-300 hover:opacity-95 rounded-xl"
                            style={img.style}
                        >
                            <Image
                                src={img.src}
                                alt={img.alt}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes={img.style.width}
                                priority={i === 0 || i === 5}
                            />
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}