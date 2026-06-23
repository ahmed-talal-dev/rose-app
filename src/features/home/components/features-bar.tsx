import { useTranslations } from "next-intl";
import { Truck, RefreshCw, ShieldCheck, Headphones } from "lucide-react";

const features = [
    { key: "delivery", icon: Truck },
    { key: "refund", icon: RefreshCw },
    { key: "payment", icon: ShieldCheck },
    { key: "support", icon: Headphones },
] as const;

export function FeaturesBar() {
    const t = useTranslations("home.features");

    return (
        <section className="w-full">
            <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-stretch gap-6 sm:gap-8 px-6 sm:px-8 lg:px-10 py-8 sm:py-10 bg-primary-50 dark:bg-zinc-800 rounded-2xl">
                    {features.map(({ key, icon: Icon }) => (
                        <div
                            key={key}
                            className="flex flex-row justify-center items-center gap-3 sm:gap-4 w-full sm:w-auto sm:flex-1 lg:w-[299.75px] h-[65px]"
                        >
                            <div className="flex flex-col justify-center items-center shrink-0 w-[50px] h-[50px] sm:w-[65px] sm:h-[65px] bg-primary-600 dark:bg-rose-200 rounded-[32.5px]">
                                <Icon
                                    className="w-8 h-8 sm:w-10 sm:h-10 text-white dark:text-zinc-800"
                                    strokeWidth={1.45833}
                                />
                            </div>
                            <div className="flex flex-col justify-center items-start gap-1 sm:gap-[5px]">
                                <p className="text-base sm:text-lg lg:text-xl font-semibold leading-[100%] text-primary-600 dark:text-rose-200 font-sarabun">
                                    {t(`${key}.title`)}
                                </p>
                                <p className="text-xs sm:text-sm font-normal leading-[100%] text-muted-foreground dark:text-zinc-300 font-sarabun">
                                    {t(`${key}.subtitle`)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}