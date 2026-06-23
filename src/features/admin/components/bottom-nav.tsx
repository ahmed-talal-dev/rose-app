import { useTranslations } from "next-intl";
import { Flower } from "lucide-react";
import { NAV_ITEMS } from "../constants/dashboard";

interface BottomNavProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onPreview?: () => void;
}

export function BottomNav({ activeTab, setActiveTab, onPreview }: BottomNavProps) {
    const t = useTranslations("admin.sidebar");

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-23 bg-white dark:bg-zinc-900 border-t border-zinc-50 dark:border-zinc-800 z-50 shadow-lg flex justify-center md:hidden">
            <div className="w-full max-w-107.5 h-full relative flex flex-row items-start p-4 gap-4">
                {/* Navigation Items */}
                {NAV_ITEMS.map((item) => {
                    const active = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setActiveTab(item.id)}
                            className={`flex flex-col items-center justify-center flex-1 shrink-0 w-[87.5px] h-15 p-1.5 gap-1 rounded-[10px] cursor-pointer border-none transition-colors ${active
                                    ? "bg-primary-50 dark:bg-primary-950/30"
                                    : "bg-transparent hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50"
                                }`}
                        >
                            <item.icon
                                size={25}
                                strokeWidth={1.5}
                                className={active ? "text-primary-600" : "text-zinc-800 dark:text-zinc-300"}
                            />
                            <span
                                className={`font-sans font-bold text-sm leading-4.75 ${active ? "text-primary-600" : "text-zinc-800 dark:text-zinc-300"
                                    }`}
                            >
                                {t(item.id)}
                            </span>
                        </button>
                    );
                })}

                {/* Preview website floating action button */}
                <button
                    type="button"
                    onClick={onPreview}
                    className="absolute w-15 h-15 left-1/2 -translate-x-1/2 -top-6.25 bg-primary-600 border-[5px] border-white dark:border-zinc-900 rounded-full flex items-center justify-center cursor-pointer z-10 shadow-lg active:scale-95 transition-transform"
                    aria-label="Preview website"
                >
                    <Flower size={30} strokeWidth={2.08333} className="text-white" />
                </button>
            </div>
        </nav>
    );
}
