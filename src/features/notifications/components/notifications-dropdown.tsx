"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import {
    Bell,
    BellOff,
    CheckCheck,
    BrushCleaning,
    Loader2,
    Check,
    EllipsisVertical,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from "@/shared/ui/dropdown-menu";
import {
    useNotifications,
    useMarkAllAsRead,
    useDeleteNotification,
    useMarkAsRead
} from "../hooks";
import { cn } from "@/shared/lib/utils/index";
import { toast } from "sonner";

export function NotificationsDropdown() {
    const t = useTranslations();
    const locale = useLocale();
    const { data: session } = useSession();
    const router = useRouter();

    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const { data, isLoading, refetch } = useNotifications(undefined);
    const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();
    const { mutate: markAsRead } = useMarkAsRead();
    const { mutate: deleteNotification } = useDeleteNotification();

    // Check notifications list
    const notifications = data?.data || [];
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const hasData = notifications.length > 0;
    const fontClass = locale === "ar" ? "font-tajawal" : "font-sarabun";

    const handleBellClick = (e: React.MouseEvent) => {
        if (!session) {
            e.preventDefault();
            router.push("/login");
        }
    };

    const handleClearAll = async () => {
        if (notifications.length === 0) return;
        try {
            for (const notif of notifications) {
                deleteNotification(notif.id);
            }
            toast.success(t("common.save"));
            refetch();
        } catch {
            toast.error(t("common.error"));
        }
    };

    const handleMarkAllAsRead = () => {
        if (unreadCount === 0) return;
        markAllAsRead(undefined, {
            onSuccess: () => {
                toast.success(t("common.save"));
                refetch();
            },
            onError: () => {
                toast.error(t("common.error"));
            }
        });
    };

    const handleSingleMarkAsRead = (id: string) => {
        markAsRead(id, {
            onSuccess: () => {
                toast.success(t("common.save"));
                refetch();
            },
            onError: () => {
                toast.error(t("common.error"));
            }
        });
    };

    const handleSingleDelete = (id: string) => {
        deleteNotification(id, {
            onSuccess: () => {
                toast.success(t("common.save"));
                refetch();
            },
            onError: () => {
                toast.error(t("common.error"));
            }
        });
    };

    return (
        <DropdownMenu dir={locale === "ar" ? "rtl" : "ltr"}>
            <DropdownMenuTrigger asChild>
                <button
                    onClick={handleBellClick}
                    className="relative p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer shrink-0 outline-none border-none bg-transparent"
                    aria-label="Notifications"
                >
                    <Bell className="w-5 lg:w-6 h-5 lg:h-6 text-zinc-700 dark:text-zinc-200" strokeWidth={1.5} />
                    {session && unreadCount > 0 && (
                        <span className={cn(
                            "absolute top-0.5 inset-e-0.5 flex justify-center items-center min-w-4 h-4 px-1 bg-red-600 rounded-full text-[10px] font-bold leading-none text-white shadow-sm",
                            fontClass
                        )}>
                            {unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>

            {session && (
                <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    className={cn(
                        "w-[336px] p-0 overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-[12px] shadow-[0px_4px_9px_rgba(0,0,0,0.15)] z-[100] flex flex-col transition-all",
                        hasData ? "h-[690px]" : "h-[314px]",
                        fontClass
                    )}
                >
                    {/* Header */}
                    <div className="bg-[#741C21] h-[52px] w-[336px] px-4 py-3 flex items-center justify-between shrink-0">
                        <h3 className="font-bold text-[20px] leading-none text-white">
                            {hasData ? t("notifications.title", { count: notifications.length }) : t("notifications.titleEmpty")}
                        </h3>
                        {isLoading && (
                            <Loader2 className="h-4 w-4 text-white animate-spin" />
                        )}
                    </div>

                    {/* Actions Bar */}
                    <div className="bg-white dark:bg-zinc-900 h-[38px] w-[336px] px-2.5 py-2 flex items-center justify-between shrink-0 select-none">
                        <button
                            onClick={handleClearAll}
                            disabled={notifications.length === 0}
                            className="flex items-center gap-1.5 bg-transparent border-none outline-none cursor-pointer disabled:opacity-50 transition-colors group"
                        >
                            {/* lucide/brush-cleaning */}
                            <BrushCleaning className="w-[18px] h-[18px] text-[#A1A1AA] group-hover:text-red-800 dark:group-hover:text-rose-400 transition-colors" strokeWidth={1.25} />
                            <span className="font-semibold text-[12px] leading-none text-[#A1A1AA] group-hover:text-red-800 dark:group-hover:text-rose-400 transition-colors">
                                {t("notifications.clearAll")}
                            </span>
                        </button>
                        <button
                            onClick={handleMarkAllAsRead}
                            disabled={unreadCount === 0 || isMarkingAll}
                            className="flex items-center gap-1.5 bg-transparent border-none outline-none cursor-pointer disabled:opacity-50 transition-colors group"
                        >
                            {/* lucide/check-check */}
                            <CheckCheck className="w-[15px] h-[15px] text-[#A1A1AA] group-hover:text-red-800 dark:group-hover:text-rose-400 transition-colors" strokeWidth={1.25} />
                            <span className="font-semibold text-[12px] leading-none text-[#A1A1AA] group-hover:text-red-800 dark:group-hover:text-rose-400 transition-colors">
                                {t("notifications.markAllRead")}
                            </span>
                        </button>
                    </div>

                    {/* List / Empty Body */}
                    <div className={cn(
                        "w-[336px] bg-white dark:bg-zinc-900 border-t border-[#D4D4D8] dark:border-zinc-800 shrink-0 overflow-y-auto",
                        hasData ? "h-[600px]" : "h-[224px]"
                    )}>
                        {notifications.length === 0 ? (
                            /* Empty State matches design exactly */
                            <div className="flex flex-col items-center justify-center h-full w-full select-none gap-2.5">
                                {/* lucide/bell-off */}
                                <BellOff className="w-[50px] h-[50px] text-[#71717A]" strokeWidth={1.75} />
                                {/* Text */}
                                <p className="font-medium text-[14px] leading-none text-[#71717A]">
                                    {t("notifications.empty")}
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-start p-0 w-[336px] bg-white dark:bg-zinc-900">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={cn(
                                            "box-sizing-border-box flex flex-col items-start p-4 gap-1.5 w-[336px] h-[100px] border-t border-[#D4D4D8] dark:border-zinc-800 shrink-0 relative",
                                            notif.isRead ? "bg-white dark:bg-zinc-900" : "bg-[#E4E4E7] dark:bg-zinc-800"
                                        )}
                                    >
                                        {/* Header */}
                                        <div className="flex flex-row justify-between items-center p-0 gap-2.5 w-[304px] h-[20px] shrink-0">
                                            <h4 className="font-semibold text-[16px] leading-none text-[#27272A] dark:text-zinc-100 truncate max-w-[208px] text-start">
                                                {notif.title}
                                            </h4>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === notif.id ? null : notif.id);
                                                }}
                                                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors cursor-pointer outline-none border-none bg-transparent shrink-0"
                                            >
                                                <EllipsisVertical className="w-5 h-5 text-[#A1A1AA]" strokeWidth={1.5} />
                                            </button>
                                        </div>

                                        {/* Message Body */}
                                        <p className="w-[304px] h-[42px] font-normal text-[14px] leading-[1.2] text-[#71717A] dark:text-zinc-400 text-start line-clamp-3 overflow-hidden shrink-0">
                                            {notif.message}
                                        </p>

                                        {/* Context Menu Popup */}
                                        {openMenuId === notif.id && (
                                            <>
                                                {/* Click overlay to close menu */}
                                                <div
                                                    className="fixed inset-0 z-10"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenuId(null);
                                                    }}
                                                />
                                                {/* Menu Content */}
                                                <div className="absolute end-4 top-10 w-[160px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-md py-1 z-20 flex flex-col text-start">
                                                    <button
                                                        disabled={notif.isRead}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSingleMarkAsRead(notif.id);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className={cn(
                                                            "flex items-center gap-2 px-3 py-2 text-xs font-semibold w-full transition-colors border-none outline-none bg-transparent cursor-pointer",
                                                            notif.isRead
                                                                ? "text-[#A1A1AA] cursor-not-allowed"
                                                                : "text-[#27272A] dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                                        )}
                                                    >
                                                        <Check className={cn("w-[15px] h-[15px]", notif.isRead ? "text-[#A1A1AA]" : "text-[#71717A] dark:text-zinc-400")} strokeWidth={1.5} />
                                                        <span>{t("notifications.markAsRead")}</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSingleDelete(notif.id);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#27272A] dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 w-full transition-colors border-none outline-none bg-transparent cursor-pointer"
                                                    >
                                                        <Check className="w-[15px] h-[15px] text-transparent" strokeWidth={1.5} />
                                                        <span>{t("notifications.deleteNotification")}</span>
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DropdownMenuContent>
            )}
        </DropdownMenu>
    );
}
