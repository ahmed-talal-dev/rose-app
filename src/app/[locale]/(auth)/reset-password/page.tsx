import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";

export default async function ResetPasswordPage() {
    const locale = await getLocale();
    const t = await getTranslations("auth.resetPassword");
    const alternateLocale = locale === "ar" ? "en" : "ar";

    return (
        <main className="min-h-screen bg-white overflow-hidden">
            <div className="grid min-h-screen grid-cols-1 min-[560px]:grid-cols-[minmax(340px,49%)_minmax(0,1fr)] lg:grid-cols-[700px_minmax(0,1fr)]">

                {/* Left — Form */}
                <section className="relative flex min-h-screen w-full flex-col items-center justify-between px-5 py-6 min-[560px]:px-6 lg:px-0 lg:py-0 overflow-y-auto">

                    {/* Language switcher */}
                    <div className="flex w-full max-w-101.5 justify-end pt-4 lg:absolute lg:left-36.75 lg:top-15 lg:pt-0 z-10">
                        <Link
                            href="/reset-password"
                            locale={alternateLocale}
                            className="text-base font-normal text-zinc-700 transition-colors hover:text-primary-700 font-zain"
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
                            className="h-11.5 w-70 object-contain"
                        />

                        <div className="flex w-full flex-col gap-6">
                            {/* Header */}
                            <div className="flex flex-col gap-1 border-b border-zinc-200 pb-4">
                                <h1 className="text-2xl font-bold text-zinc-900">
                                    {t("title")}
                                </h1>
                                <p className="text-sm text-zinc-500">
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
                            className="h-11.5 w-70 scale-y-[-1] object-contain"
                        />
                    </div>
                </section>

                {/* Right — Cover */}
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