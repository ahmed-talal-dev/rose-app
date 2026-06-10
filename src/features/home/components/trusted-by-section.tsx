"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

const companies = [
    { src: "/images/image 36.svg", alt: "Company 1" },
    { src: "/images/image 40.svg", alt: "Company 2" },
    { src: "/images/image 41.svg", alt: "Company 3" },
    { src: "/images/image 38.svg", alt: "Company 4" },
    { src: "/images/image 39.svg", alt: "Company 5" },
    { src: "/images/image 37.svg", alt: "Company 6" },
];

export function TrustedBySection() {
    const t = useTranslations("home.trusted");

    return (
        <section className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-10 bg-background dark:bg-zinc-800">
            {/* Main container with updated mockup layout background #3A3A3C */}
            <div className="mx-auto max-w-7xl bg-[#3A3A3C] dark:bg-zinc-900 rounded-[20px] flex flex-col items-center gap-10 px-6 py-10 shadow-sm">

                {/* Title with specialized color highlights from the mockup */}
                <h2 className="font-sarabun font-bold text-[24px] sm:text-[36px] leading-[120%] text-[#FDCFD4] text-center max-w-2xl select-none">
                    {t.rich("title", {
                        highlight: (chunks) => (
                            <span className="text-[#FF668B] font-extrabold mx-1">{chunks}</span>
                        ),
                    })}
                </h2>

                {/* Logos Responsive Flex Container */}
                <div className="flex flex-wrap lg:flex-nowrap items-center justify-center lg:justify-between gap-8 w-full max-w-6xl px-4">
                    {companies.map((company, i) => (
                        <div key={i} className="flex items-center justify-center w-[146px] h-[51px] shrink-0">
                            <Image
                                src={company.src}
                                alt={company.alt}
                                width={146}
                                height={51}
                                className="object-contain w-full h-full opacity-40 brightness-0 invert hover:opacity-100 transition-opacity duration-300 ease-in-out"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}