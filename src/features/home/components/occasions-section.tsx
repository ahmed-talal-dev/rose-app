import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface Occasion {
    image: string;
    badge: string;
    title: string;
    href: string;
}

export function OccasionsSection() {
    const t = useTranslations("home.occasions");

    const occasions: Occasion[] = [
        {
            image: "/images/product-5.svg",
            badge: t("occasion1.badge"),
            title: t("occasion1.title"),
            href: "/products?occasion=wedding",
        },
        {
            image: "/images/product-6.svg",
            badge: t("occasion2.badge"),
            title: t("occasion2.title"),
            href: "/products?occasion=engagement",
        },
        {
            image: "/images/product-7.svg",
            badge: t("occasion3.badge"),
            title: t("occasion3.title"),
            href: "/products?occasion=anniversary",
        },
    ];

    return (
        <section className="w-full">
            <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 py-4 sm:py-6">
                    {occasions.map((occ, index) => (
                        <Link
                            key={index}
                            href={occ.href}
                            className="group relative flex flex-col justify-end items-start p-4 sm:p-5 lg:p-6 gap-2 lg:gap-2.5 w-full sm:flex-1 lg:w-[410px] h-[200px] sm:h-[240px] lg:h-[271px] rounded-2xl overflow-hidden shrink-0"
                        >
                            <Image
                                src={occ.image}
                                alt={occ.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="relative z-10 flex flex-col gap-2 lg:gap-2.5">
                                <div className="flex justify-center items-center px-2 py-0.5 w-fit h-4 bg-primary-50 dark:bg-[#FDF0F1] rounded-[999px]">
                                    <span className="text-[10px] sm:text-[12px] font-medium leading-[100%] text-primary-600 dark:text-[#A6252A] font-sarabun whitespace-nowrap">
                                        {occ.badge}
                                    </span>
                                </div>
                                <h3 className="max-w-[280px] sm:max-w-[340px] lg:max-w-[362px] text-[16px] sm:text-[20px] lg:text-[24px] font-semibold leading-[110%] lg:leading-[100%] text-white font-sarabun">
                                    {occ.title}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}