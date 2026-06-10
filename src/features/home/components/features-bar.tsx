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
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-stretch gap-6 sm:gap-8 px-6 sm:px-8 lg:px-10 py-8 sm:py-10 bg-primary-50 dark:bg-[#3A393E] rounded-2xl">
                    {features.map(({ key, icon: Icon }) => (
                        <div
                            key={key}
                            className="flex flex-row justify-center items-center gap-3 sm:gap-4 w-full sm:w-auto sm:flex-1 lg:w-[299.75px] h-[65px]"
                        >
                            <div className="flex flex-col justify-center items-center shrink-0 w-[50px] h-[50px] sm:w-[65px] sm:h-[65px] bg-[#A6252A] dark:bg-[#FDCFD4] rounded-[32.5px]">
                                <Icon
                                    className="w-8 h-8 sm:w-10 sm:h-10 text-white dark:text-[#3A393E]"
                                    strokeWidth={1.45833}
                                />
                            </div>
                            <div className="flex flex-col justify-center items-start gap-1 sm:gap-[5px]">
                                <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-semibold leading-[100%] text-[#A6252A] dark:text-[#FDCFD4] font-sarabun">
                                    {t(`${key}.title`)}
                                </p>
                                <p className="text-[12px] sm:text-[14px] font-normal leading-[100%] text-muted-foreground dark:text-[#D1D1D6] font-sarabun">
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