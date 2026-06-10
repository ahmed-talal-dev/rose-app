import { RegisterForm } from "@/features/auth/components/register-form";
import { Link } from "@/i18n/navigation";
import ThemeToggle from "@/shared/components/theme-toggle";
import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";

export default async function RegisterPage() {
    const locale = await getLocale();
    const t = await getTranslations("auth.register");
    const isArabic = locale === "ar";
    const alternateLocale = isArabic ? "en" : "ar";

    return (
        <main className="min-h-screen bg-white dark:bg-[#121214] overflow-hidden transition-colors duration-300">
            <div className="grid min-h-screen grid-cols-1 min-[560px]:grid-cols-[minmax(340px,49%)_minmax(0,1fr)] lg:grid-cols-[700px_minmax(0,1fr)]">

                {/* Left — Form Side */}
                <section className="relative h-screen overflow-y-auto no-scrollbar flex flex-col items-center px-5 py-6 min-[560px]:px-8 lg:px-0">

                    {/* Language switcher — sticky top */}
                    <div className="w-full max-w-101.5 flex justify-between items-center pt-2 pb-4 shrink-0">
                        <ThemeToggle />

                        <Link
                            href="/register"
                            locale={alternateLocale}
                            className="text-base font-normal text-zinc-700 dark:text-zinc-300 transition-colors hover:text-[#A6252A] dark:hover:text-[#FFA3B9] font-zain"
                        >
                            {t("languageSwitch")}
                        </Link>
                    </div>

                    {/* Content */}
                    <div className="flex w-full max-w-101.5 flex-col items-center gap-6 lg:gap-10 pb-6 my-auto">

                        {/* Top separator — hidden on small screens */}
                        <Image
                            src="/svgs/separator-2.svg"
                            alt=""
                            width={280}
                            height={45}
                            className="hidden sm:block h-11.5 w-70 object-contain shrink-0"
                        />

                        {/* Form wrapper */}
                        <div className="flex w-full flex-col items-center gap-6">

                            {/* Title */}
                            <div className="flex w-full flex-col items-center justify-center border-b border-zinc-200 dark:border-zinc-800 pb-4 text-center shrink-0 transition-colors">
                                <h1
                                    className="text-[36px] sm:text-[48px] leading-tight sm:leading-14.25 text-[#A6252A] dark:text-[#FFA3B9] transition-colors"
                                    style={
                                        isArabic
                                            ? undefined
                                            : { fontFamily: "'Edwardian Script ITC', 'Great Vibes', cursive" }
                                    }
                                >
                                    {t("title")}
                                </h1>
                            </div>

                            {/* Register Form */}
                            <RegisterForm />
                        </div>

                        {/* Bottom separator — hidden on small screens */}
                        <Image
                            src="/svgs/separator-2.svg"
                            alt=""
                            width={280}
                            height={45}
                            className="hidden sm:block h-11.5 w-70 scale-y-[-1] object-contain shrink-0"
                        />
                    </div>
                </section>

                {/* Right — Cover Image */}
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