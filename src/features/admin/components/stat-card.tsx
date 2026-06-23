import { ElementType } from "react";
import { useTranslations } from "next-intl";
import { STAT_COLOR_CLASSES } from "../constants/dashboard";
import { StatColor } from "../types/dashboard";

interface StatCardProps {
    label: string;
    value: string;
    icon: ElementType;
    color: StatColor;
}

export function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
    const c = STAT_COLOR_CLASSES[color];
    const tCommon = useTranslations("common");

    const renderValue = () => {
        if (value.endsWith(" EGP")) {
            const num = value.replace(" EGP", "");
            return (
                <span className="flex items-baseline gap-0.5">
                    <span>{num}</span>
                    <span className="text-xs font-semibold opacity-80">{tCommon("currency")}</span>
                </span>
            );
        }
        return value;
    };

    return (
        <div className={`w-full h-32.25 rounded-2xl p-4 flex flex-col justify-between ${c.card}`}>
            <Icon size={35} className={c.icon} strokeWidth={2.08333} />
            <div className="flex flex-col gap-1 w-full">
                <p className={`text-lg xs:text-xl sm:text-2xl font-semibold leading-tight sm:leading-8 ${c.text}`}>{renderValue()}</p>
                <p className="text-xs sm:text-base font-medium text-zinc-800 dark:text-zinc-300 leading-snug sm:leading-5">{label}</p>
            </div>
        </div>
    );
}
