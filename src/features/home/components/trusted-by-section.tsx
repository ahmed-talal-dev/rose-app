"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

const companies = [
  { src: "/images/image 36.svg", alt: "Floral partner logo" },
  { src: "/images/image 40.svg", alt: "Gifting partner logo" },
  { src: "/images/image 41.svg", alt: "Delivery partner logo" },
  { src: "/images/image 38.svg", alt: "Packaging partner logo" },
  { src: "/images/image 39.svg", alt: "Retail partner logo" },
  { src: "/images/image 37.svg", alt: "Wholesale partner logo" },
];

export function TrustedBySection() {
  const t = useTranslations("home.trusted");

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-10 bg-background dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl bg-rose-50 dark:bg-zinc-800 rounded-[20px] flex flex-col items-center gap-10 px-6 py-10 shadow-sm">
        <h2 className="font-sarabun font-bold text-2xl sm:text-4xl leading-[120%] text-rose-950 dark:text-rose-200 text-center max-w-2xl select-none">
          {t.rich("title", {
            highlight: (chunks) => (
              <span className="text-rose-500 dark:text-rose-400 font-extrabold mx-1">
                {chunks}
              </span>
            ),
          })}
        </h2>

        <div className="flex flex-wrap lg:flex-nowrap items-center justify-center lg:justify-between gap-8 w-full max-w-6xl px-4">
          {companies.map((company) => (
            <div
              key={company.src}
              className="flex items-center justify-center w-[146px] h-[51px] shrink-0"
            >
              <Image
                src={company.src}
                alt={company.alt}
                width={146}
                height={51}
                className="object-contain w-full h-full opacity-60 hover:opacity-100 transition-opacity duration-300 ease-in-out"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
