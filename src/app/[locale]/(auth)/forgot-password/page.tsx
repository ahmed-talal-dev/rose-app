import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { Link } from "@/i18n/navigation";
import ThemeToggle from "@/shared/components/theme-toggle";
import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";

export default async function ForgotPasswordPage() {
    const locale = await getLocale();
    const t = await getTranslations("auth.forgotPassword");
    const isArabic = locale === "ar";
    const alternateLocale = isArabic ? "en" : "ar";

    return (
        <main className="min-h-screen bg-white dark:bg-[#1c1d21] overflow-hidden transition-colors duration-300">
            <div className="grid min-h-screen grid-cols-1 min-[560px]:grid-cols-[minmax(340px,49%)_minmax(0,1fr)] lg:grid-cols-[700px_minmax(0,1fr)]">

                <section className="relative flex min-h-screen w-full flex-col items-center justify-between px-5 py-6 min-[560px]:px-6 lg:px-0 lg:py-0 overflow-y-auto no-scrollbar">

                    {/* Language Switch */}
                    <div className="flex w-full max-w-101.5 justify-between items-center pt-4 lg:absolute lg:left-36.75 lg:top-15 lg:pt-0 z-10">
                        <ThemeToggle />

                        <Link
                            href="/forgot-password"
                            locale={alternateLocale}
                            className="text-base font-normal text-zinc-700 dark:text-zinc-300 transition-colors hover:text-[#A6252A] dark:hover:text-[#FFA3B9] font-zain"
                        >
                            {t("languageSwitch")}
                        </Link>
                    </div>

                    {/* Form Section */}
                    <div className="flex flex-1 w-full max-w-101.5 flex-col items-center justify-center gap-6 my-auto lg:absolute lg:left-36.75 lg:top-[50%] lg:-translate-y-1/2">
                        <Image
                            src="/svgs/separator-2.svg"
                            alt=""
                            width={280}
                            height={45}
                            className="h-11.5 w-70 object-contain dark:opacity-90"
                        />

                        <div className="flex w-full flex-col items-center gap-6">
                            <div className="flex w-full flex-col items-start justify-start border-b border-zinc-200 dark:border-zinc-800 pb-3">
                                <h1 className="text-2xl lg:text-[28px] font-bold text-zinc-900 dark:text-white font-inter">
                                    {t("title")}
                                </h1>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-inter mt-1">
                                    {t("subtitle")}
                                </p>
                            </div>

                            <ForgotPasswordForm />
                        </div>

                        <Image
                            src="/svgs/separator-2.svg"
                            alt=""
                            width={280}
                            height={45}
                            className="h-11.5 w-70 scale-y-[-1] object-contain dark:opacity-90"
                        />
                    </div>
                </section>

                {/* Cover Image */}
                <section className="relative hidden h-screen overflow-hidden bg-[#212226] min-[560px]:block">
                    <Image
                        src="/images/Cover.svg"
                        alt={t("coverAlt")}
                        fill
                        sizes="(min-width: 1024px) 700px, 50vw"
                        className="object-cover object-center"
                        priority
                    />
                </section>
            </div>
        </main>
    );
}