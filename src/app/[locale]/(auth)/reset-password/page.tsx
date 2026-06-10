import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { Link } from "@/i18n/navigation";
import ThemeToggle from "@/shared/components/theme-toggle";
import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";

export default async function ResetPasswordPage() {
    const locale = await getLocale();
    const t = await getTranslations("auth.resetPassword");
    const alternateLocale = locale === "ar" ? "en" : "ar";

    return (
        <main className="min-h-screen bg-white dark:bg-[#1c1d21] overflow-hidden transition-colors duration-300">
            <div className="grid min-h-screen grid-cols-1 min-[560px]:grid-cols-[minmax(340px,49%)_minmax(0,1fr)] lg:grid-cols-[700px_minmax(0,1fr)]">

                {/* Left — Form */}
                <section className="relative flex min-h-screen w-full flex-col items-center justify-between px-5 py-6 min-[560px]:px-6 lg:px-0 lg:py-0 overflow-y-auto">

                    {/* Language switcher & Theme Toggle */}
                    <div className="flex w-full max-w-101.5 justify-between items-center pt-4 lg:absolute lg:left-36.75 lg:top-15 lg:pt-0 z-10">
                        <ThemeToggle />

                        <Link
                            href="/reset-password"
                            locale={alternateLocale}
                            className="text-base font-normal text-zinc-700 dark:text-zinc-300 transition-colors hover:text-[#A6252A] dark:hover:text-[#FFA3B9] font-zain"
                        >
                            {t("languageSwitch")}
                        </Link>
                    </div>

                    <div className="flex flex-1 w-full max-w-101.5 flex-col items-center justify-center gap-6 my-auto lg:absolute lg:left-36.75 lg:top-[50%] lg:-translate-y-1/2">
                        {/* Top separator */}
                        <Image
                            src="/svgs/separator-2.svg"
                            alt=""
                            width={280}
                            height={45}
                            className="h-11.5 w-70 object-contain dark:opacity-80"
                        />

                        <div className="flex w-full flex-col gap-6">
                            {/* Header */}
                            <div className="flex flex-col gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                                <h1 className="text-2xl font-bold text-[#A6252A] dark:text-[#FFA3B9] transition-colors">
                                    {t("title")}
                                </h1>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    {t("subtitle")}
                                </p>
                            </div>

                            <ResetPasswordForm />
                        </div>

                        {/* Bottom separator */}
                        <Image
                            src="/svgs/separator-2.svg"
                            alt=""
                            width={280}
                            height={45}
                            className="h-11.5 w-70 scale-y-[-1] object-contain dark:opacity-80"
                        />
                    </div>
                </section>

                {/* Right — Cover */}
                <section className="relative hidden h-screen overflow-hidden bg-[#212226] min-[560px]:block">
                    <Image
                        src="/images/Cover.svg"
                        alt={t("coverAlt")}
                        fill
                        className="object-cover object-center"
                        priority
                    />
                </section>
            </div>
        </main>
    );
}