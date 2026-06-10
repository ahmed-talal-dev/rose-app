"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

export function Footer() {
    const t = useTranslations("footer");
    const year = new Date().getFullYear();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        setTimeout(() => setLoading(false), 1500);
    };

    const links = [
        { label: t("home"), href: "/" },
        { label: t("products"), href: "/products" },
        { label: t("categories"), href: "/categories" },
        { label: t("occasions"), href: "/occasions" },
        { label: t("contact"), href: "/contact" },
        { label: t("about"), href: "/about" },
        { label: t("terms"), href: "/terms" },
        { label: t("privacy"), href: "/privacy" },
        { label: t("faq"), href: "/faq" },
    ];

    return (
        /* mt-16 lg:mt-24 تضيف مسافة أمان علوية فخمة تفصل الـ Footer تماماً عن السكشن السابق له */
        <footer className="bg-[#18181B] mt-16 lg:mt-36 border-t border-zinc-800/50">
            <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-10 lg:gap-16">

                    {/* Logo Column */}
                    <div className="flex flex-col justify-center items-center gap-[6px] w-full sm:w-auto lg:w-[250px]">
                        <Image
                            src="/images/logo.svg"
                            alt="Rose"
                            width={240}
                            height={225}
                            className="w-32 sm:w-48 lg:w-[240px] h-auto object-contain"
                            priority
                        />
                        <p className="text-[18px] font-semibold leading-[100%] text-center text-[#FFA3B9] font-sarabun mt-2">
                            Rose E-Commerce App
                        </p>
                        <p className="text-[14px] font-normal leading-[100%] text-center text-[#F4F4F5] font-sarabun">
                            All rights reserved | {year}
                        </p>
                    </div>

                    {/* Navigation Column */}
                    <div className="flex flex-col items-center lg:items-start gap-[6px] px-0 lg:pl-4 flex-1 w-full sm:w-auto">
                        <h3 className="text-[18px] font-semibold leading-[100%] text-[#FFA3B9] font-sarabun mb-1">
                            {t("discoverTitle")}
                        </h3>
                        <div className="flex flex-col justify-center items-center lg:items-start gap-[6px] w-[137px]">
                            {links.map(({ label, href }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className="text-[16px] font-medium leading-[100%] text-[#F4F4F5] font-sarabun hover:text-[#FFA3B9] transition-colors whitespace-nowrap"
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Discount/Newsletter Column */}
                    <div className="flex flex-col items-center lg:items-start gap-5 w-full sm:w-auto lg:w-[375px]">
                        {/* Title group */}
                        <div className="flex flex-col justify-center items-center lg:items-start w-full">
                            <p className="text-[20px] font-semibold leading-[100%] text-[#FFA3B9] font-sarabun text-center lg:text-left">
                                {t.rich("newsletterTitle", {
                                    pink: (chunks) => <span className="text-[#FFA3B9] font-bold">{chunks}</span>
                                })}
                            </p>
                            <p className="text-[14px] font-normal leading-[100%] text-[#71717A] font-sarabun mt-1 text-center lg:text-left">
                                {t("newsletterSubtitle")}
                            </p>
                        </div>

                        {/* Subscribe Form Input Container */}
                        <form onSubmit={handleSubscribe} className="w-full max-w-[375px]">
                            <div className="flex flex-row justify-between items-center pl-4 pr-1 gap-2 w-full h-[38px] bg-[#27272A] rounded-[30px] border border-zinc-800 focus-within:border-zinc-700 transition-all">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t("newsletterPlaceholder")}
                                    className="flex-1 bg-transparent text-[14px] font-medium text-white font-sarabun outline-none placeholder:text-[#A1A1AA] min-w-0"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex justify-center items-center px-4 py-2 gap-2 h-[34px] bg-[#FFA3B9] rounded-[999px] text-[14px] font-medium text-[#27272A] font-sarabun hover:bg-[#ffbccc] transition-colors disabled:opacity-70 shrink-0"
                                >
                                    {loading ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#27272A]" />
                                    ) : (
                                        <>
                                            <span className="hidden sm:inline">{t("subscribe")}</span>
                                            <ArrowRight className="w-3.5 h-3.5 text-[#27272A] stroke-[2.5]" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </footer>
    );
}