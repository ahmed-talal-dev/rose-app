import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";

export default async function ForgotPasswordPage() {
    const locale = await getLocale();
    const t = await getTranslations("auth.forgotPassword");
    const isArabic = locale === "ar";
    const alternateLocale = isArabic ? "en" : "ar";

    return (
        <main className="min-h-screen bg-white overflow-hidden">
            <div className="grid min-h-screen grid-cols-1 min-[560px]:grid-cols-[minmax(340px,49%)_minmax(0,1fr)] lg:grid-cols-[700px_minmax(0,1fr)]">

                <section className="relative flex min-h-screen w-full flex-col items-center justify-between px-5 py-6 min-[560px]:px-6 lg:px-0 lg:py-0 overflow-y-auto no-scrollbar">

                    {/* Language Switch */}
                    <div className="flex w-full max-w-101.5 justify-end pt-4 lg:absolute lg:left-36.75 lg:top-15 lg:pt-0 z-10">
                        <Link
                            href="/forgot-password"
                            locale={alternateLocale}
                            className="text-base font-normal text-zinc-700 transition-colors hover:text-primary-700 font-zain"
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
                            className="h-11.5 w-70 object-contain"
                        />

                        <div className="flex w-full flex-col items-center gap-6">
                            <div className="flex w-full flex-col items-start justify-start border-b border-zinc-200 pb-3">
                                <h1 className="text-2xl lg:text-[28px] font-bold text-zinc-900 font-inter">
                                    {t("title")}
                                </h1>
                                <p className="text-sm text-zinc-500 font-inter mt-1">
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
                            className="h-11.5 w-70 scale-y-[-1] object-contain"
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