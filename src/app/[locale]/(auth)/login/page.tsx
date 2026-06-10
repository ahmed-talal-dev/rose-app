import { LoginForm } from "@/features/auth/components/login-form";
import { Link } from "@/i18n/navigation";
import ThemeToggle from "@/shared/components/theme-toggle";
import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";

export default async function LoginPage() {
    const locale = await getLocale();
    const t = await getTranslations("auth.login");
    const isArabic = locale === "ar";
    const alternateLocale = isArabic ? "en" : "ar";

    return (
        <main className="min-h-screen bg-white dark:bg-[#212226] overflow-hidden transition-colors duration-300">
            <div className="grid min-h-screen grid-cols-1 min-[560px]:grid-cols-[minmax(340px,49%)_minmax(0,1fr)] lg:grid-cols-[700px_minmax(0,1fr)]">

                <section className="relative flex min-h-screen w-full flex-col items-center justify-between px-5 py-6 min-[560px]:px-6 lg:px-0 lg:py-8 overflow-y-auto no-scrollbar">

                    <div className="w-full max-w-101.5 flex justify-between items-center pt-2 pb-4 shrink-0">
                        <ThemeToggle />
                        <Link
                            href="/login"
                            locale={alternateLocale}
                            className="text-base font-normal text-zinc-700 dark:text-zinc-300 transition-colors hover:text-primary-700 dark:hover:text-[#FFA3B9] font-zain"
                        >
                            {t("languageSwitch")}
                        </Link>
                    </div>

                    <div className="flex flex-1 w-full max-w-101.5 flex-col items-center justify-center gap-6 my-auto lg:absolute lg:left-36.75 lg:top-[50%] lg:-translate-y-1/2">
                        <Image
                            src="/svgs/separator-2.svg"
                            alt=""
                            width={280}
                            height={45}
                            className="h-11.5 w-70 object-contain dark:invert-[40%] dark:sepia-[100%] dark:saturate-[500%] dark:hue-rotate-[320deg]"
                        />

                        <div className="flex w-full flex-col items-center gap-6">
                            <div className="flex w-full flex-col items-center justify-start border-b border-zinc-200 dark:border-zinc-700 pb-3 text-center">
                                <h1
                                    className="text-[40px] sm:text-[48px] leading-[1.08] text-primary-700 dark:text-[#FFA3B9] pb-1 transition-colors"
                                    style={
                                        isArabic
                                            ? undefined
                                            : { fontFamily: "'Edwardian Script ITC', 'Great Vibes', cursive" }
                                    }
                                >
                                    {t("title")}
                                </h1>
                            </div>

                            <LoginForm />
                        </div>

                        <Image
                            src="/svgs/separator-2.svg"
                            alt=""
                            width={280}
                            height={45}
                            className="h-11.5 w-70 scale-y-[-1] object-contain dark:invert-[40%] dark:sepia-[100%] dark:saturate-[500%] dark:hue-rotate-[320deg]"
                        />
                    </div>
                </section>
                {/* Cover Image */}
                <section className="relative hidden h-screen overflow-hidden bg-primary-900 min-[560px]:block">
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