"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Eye, LogOut, MoreVertical, User } from "lucide-react";
import { ElementType } from "react";

import { useRouter } from "@/i18n/navigation";
import { User as UserType } from "@/shared/types";
import { useTranslations } from "next-intl";
import { NAV_ITEMS } from "@/features/admin/constants/dashboard";
import { resolveImageUrl } from "@/shared/lib/utils/resolve-image-url";

// ─── NavButton ────────────────────────────────────────────────────────────────
interface NavButtonProps {
    label: string;
    icon: ElementType;
    active: boolean;
    onClick: () => void;
}

function NavButton({ label, icon: Icon, active, onClick }: NavButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-colors w-full text-left cursor-pointer border-none outline-none ${active
                    ? "bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-rose-300"
                    : "text-zinc-800 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                }`}
        >
            <Icon size={18} />
            {label}
        </button>
    );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
    onPreview?: () => void;
    user?: UserType;
}

export function Sidebar({ activeTab, setActiveTab, onLogout, onPreview, user }: SidebarProps) {
    const router = useRouter();
    const t = useTranslations("admin.sidebar");
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Close profile popover on outside click
    useEffect(() => {
        if (!isProfileOpen) return;
        const handler = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isProfileOpen]);

    return (
        <aside className="w-75.75 min-w-75.75 bg-white dark:bg-zinc-900 border-r border-black/5 dark:border-white/8 flex flex-col px-5 py-6 sticky top-0 h-screen z-20">

            {/* Logo */}
            <div className="flex flex-col items-center mb-8 mt-2">
                <Image
                    src="/images/logo.svg"
                    alt="Rose App Logo"
                    width={130}
                    height={130}
                    className="object-contain shrink-0"
                    priority
                />
            </div>

            {/* Preview button */}
            <button
                type="button"
                onClick={onPreview}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-1.5 mb-6 transition-colors border-none cursor-pointer shadow-sm shadow-primary-600/10"
            >
                <Eye size={16} />
                {t("preview")}
            </button>

            {/* Navigation */}
            <nav className="flex flex-col gap-1.5">
                {NAV_ITEMS.map((item) => (
                    <NavButton
                        key={item.id}
                        label={t(item.id)}
                        icon={item.icon}
                        active={activeTab === item.id}
                        onClick={() => setActiveTab(item.id)}
                    />
                ))}
            </nav>

            {/* User profile card */}
            <div
                className="mt-auto pt-4 border-t border-black/[0.07] dark:border-white/[0.07] relative"
                ref={popoverRef}
            >
                {/* Popover */}
                {isProfileOpen && (
                    <div className="absolute bottom-16 left-0 right-0 mx-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg p-1.5 flex flex-col gap-1 z-30 animate-fade-in">
                        <button
                            type="button"
                            className="flex items-center gap-2 px-3 py-2 w-full text-left rounded-lg text-sm text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/60 transition-colors border-none bg-transparent cursor-pointer font-medium"
                            onClick={() => { setIsProfileOpen(false); router.push("/profile"); }}
                        >
                            <User size={15} className="text-zinc-500" />
                            {t("account")}
                        </button>
                        <button
                            type="button"
                            className="flex items-center gap-2 px-3 py-2 w-full text-left rounded-lg text-sm text-primary-600 hover:bg-zinc-50 dark:hover:bg-zinc-700/60 transition-colors border-none bg-transparent cursor-pointer font-medium"
                            onClick={() => { setIsProfileOpen(false); onLogout(); }}
                        >
                            <LogOut size={15} />
                            {t("logout")}
                        </button>
                    </div>
                )}

                <div className="flex items-center gap-3 px-1 py-2 rounded-xl">
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 relative bg-zinc-100 border border-zinc-200/60">
                        <Image
                            src={resolveImageUrl(user?.photo ?? "")}
                            alt="User Avatar"
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200 truncate leading-none mb-1">
                            {user ? `${user.firstName} ${user.lastName}` : t("loading")}
                        </p>
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate leading-none">
                            {user?.email ?? ""}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsProfileOpen((prev) => !prev)}
                        aria-label="Profile options"
                        aria-expanded={isProfileOpen}
                        className="p-1 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer border-none bg-transparent"
                    >
                        <MoreVertical size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
}