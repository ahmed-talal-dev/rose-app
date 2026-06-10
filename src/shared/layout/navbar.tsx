"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import {
    Search,
    ShoppingCart,
    Heart,
    Bell,
    ChevronDown,
    MapPin,
    Menu,
    X,
    Home,
    Gift,
    ClipboardList,
    Headphones,
    Info,
    PartyPopper,
    User,
    Settings,
    LogOut,
} from "lucide-react";
import Image from "next/image";
import ThemeToggle from "@/shared/components/theme-toggle";
import { useSession, signOut } from "next-auth/react";
import { NotificationsDropdown } from "@/features/notifications/components/notifications-dropdown";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";
import { LoginPopover } from "@/features/auth/components/login-popover";

export function Navbar() {
    const t = useTranslations("navbar");
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const userName = session?.user?.name || "Jonathan Adrian";

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const toggleLocale = () => {
        const nextLocale = locale === "en" ? "ar" : "en";
        router.replace(pathname, { locale: nextLocale });
    };

    const navLinks = [
        { href: "/", label: t("home"), icon: Home },
        { href: "/products", label: t("products"), icon: Gift },
        { href: "/categories", label: t("categories"), icon: ClipboardList },
        { href: "/occasions", label: t("occasions"), icon: PartyPopper },
        { href: "/contact", label: t("contact"), icon: Headphones },
        { href: "/about", label: t("about"), icon: Info },
    ];

    return (
        <header className="sticky top-0 z-50 w-full bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 transition-colors duration-300">
            {/* Main Header */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-row items-center justify-between py-3 sm:py-4 lg:py-5 gap-3 sm:gap-4 h-auto min-h-16 sm:min-h-24">
                    {/* Logo */}
                    <Link href="/" className="shrink-0">
                        <Image
                            src="/images/logo.svg"
                            alt="Rose"
                            width={85}
                            height={80}
                            className="w-12 sm:w-16 lg:w-20 h-auto object-contain"
                            priority
                        />
                    </Link>

                    {/* Address - Deliver to (hidden on mobile) */}
                    <div className="hidden sm:flex flex-col justify-center items-start px-1 lg:px-2 gap-1 shrink-0 text-start">
                        <span className="text-xs lg:text-sm font-normal leading-none text-zinc-500 dark:text-zinc-400 font-sarabun">
                            {t("deliverTo")}
                        </span>
                        <div className="flex flex-row items-center gap-1.5">
                            <MapPin className="w-4 lg:w-5 h-4 lg:h-5 text-red-800 dark:text-rose-400 shrink-0" strokeWidth={1.5} />
                            <span className="text-sm lg:text-base font-medium leading-none text-red-800 dark:text-rose-200 font-sarabun whitespace-nowrap">
                                {t("cairo")}
                            </span>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="flex-1 min-w-0 max-w-xl mx-1 sm:mx-2 lg:mx-4">
                        <div className="flex flex-row items-center px-3 lg:px-4 gap-2 w-full h-10 sm:h-12 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl focus-within:border-red-800 dark:focus-within:border-rose-400 transition-all">
                            <Search className="w-4 lg:w-4.5 h-4 lg:h-4.5 text-zinc-400 shrink-0" strokeWidth={1.5} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
                                    }
                                }}
                                placeholder={t("searchPlaceholder")}
                                className="flex-1 bg-transparent text-sm lg:text-base font-normal text-zinc-800 dark:text-zinc-100 font-inter outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500 min-w-0 text-start"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row items-center h-10 sm:h-12 shrink-0 gap-1 sm:gap-0">
                        {/* Authentication (hidden on tablet/mobile) */}
                        {session ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="hidden lg:flex flex-row items-center px-3 gap-2 self-stretch hover:opacity-80 transition-opacity text-start cursor-pointer outline-none border-none bg-transparent">
                                        <div className="flex flex-row items-end gap-1">
                                            <div className="flex flex-col justify-center items-start">
                                                <span className="text-xs font-normal leading-none text-zinc-500 font-sarabun">
                                                    {t("hello")}
                                                </span>
                                                <span className="text-sm lg:text-base font-medium leading-none text-red-800 dark:text-rose-200 font-sarabun mt-1 whitespace-nowrap">
                                                    {session.user?.name ? session.user.name.split(" ")[0] : "Jonathan"}
                                                </span>
                                            </div>
                                            <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0 rtl:rotate-180 transition-transform" strokeWidth={1.5} />
                                        </div>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[240px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-[0px_10px_30px_rgba(0,0,0,0.08)] p-1.5 font-sarabun z-[100]" align="end" sideOffset={8}>
                                    <div className="px-3 py-2.5">
                                        <span className="font-bold text-base text-red-800 dark:text-rose-300 block truncate leading-none">
                                            {userName}
                                        </span>
                                    </div>
                                    <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
                                    <DropdownMenuItem asChild className="flex items-center gap-2.5 px-3 py-2 text-[15px] font-medium text-zinc-700 dark:text-zinc-300 rounded-xl focus:bg-zinc-50 focus:text-zinc-900 dark:focus:bg-zinc-800 dark:focus:text-white transition-colors cursor-pointer outline-none w-full">
                                        <Link href="/profile">
                                            <User className="w-5 h-5 text-zinc-500 shrink-0" strokeWidth={1.5} />
                                            <span>{t("account")}</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="flex items-center gap-2.5 px-3 py-2 text-[15px] font-medium text-zinc-700 dark:text-zinc-300 rounded-xl focus:bg-zinc-50 focus:text-zinc-900 dark:focus:bg-zinc-800 dark:focus:text-white transition-colors cursor-pointer outline-none w-full">
                                        <Link href="/profile/addresses">
                                            <MapPin className="w-5 h-5 text-zinc-500 shrink-0" strokeWidth={1.5} />
                                            <span>{t("addresses")}</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="flex items-center gap-2.5 px-3 py-2 text-[15px] font-medium text-zinc-700 dark:text-zinc-300 rounded-xl focus:bg-zinc-50 focus:text-zinc-900 dark:focus:bg-zinc-800 dark:focus:text-white transition-colors cursor-pointer outline-none w-full">
                                        <Link href="/profile/orders">
                                            <ClipboardList className="w-5 h-5 text-zinc-500 shrink-0" strokeWidth={1.5} />
                                            <span>{t("orders")}</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
                                    <DropdownMenuItem asChild className="flex items-center gap-2.5 px-3 py-2 text-[15px] font-medium text-zinc-700 dark:text-zinc-300 rounded-xl focus:bg-zinc-50 focus:text-zinc-900 dark:focus:bg-zinc-800 dark:focus:text-white transition-colors cursor-pointer outline-none w-full">
                                        <Link href="/dashboard">
                                            <Settings className="w-5 h-5 text-zinc-500 shrink-0" strokeWidth={1.5} />
                                            <span>{t("dashboard")}</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
                                    <DropdownMenuItem
                                        onClick={() => signOut()}
                                        className="flex items-center gap-2.5 px-3 py-2 text-[15px] font-medium text-zinc-700 dark:text-zinc-300 rounded-xl focus:bg-zinc-50 focus:text-zinc-900 dark:focus:bg-zinc-800 dark:focus:text-white transition-colors cursor-pointer outline-none w-full"
                                    >
                                        <LogOut className="w-5 h-5 text-zinc-500 shrink-0" strokeWidth={1.5} />
                                        <span>{t("logout")}</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="relative group hidden lg:flex items-center self-stretch">
                                <Link href="/login" className="flex flex-row items-center px-3 gap-2 self-stretch hover:opacity-85 transition-opacity text-start">
                                    <User className="w-5 h-5 text-zinc-750 dark:text-zinc-300" strokeWidth={1.5} />
                                    <span className="text-sm lg:text-base font-medium leading-none text-zinc-750 dark:text-zinc-300 font-sarabun">
                                        {t("login")}
                                    </span>
                                </Link>
                                <div className="absolute top-full end-0 pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-[100]">
                                    <LoginPopover />
                                </div>
                            </div>
                        )}

                        {/* Separator (hidden on tablet/mobile) */}
                        <div className="hidden lg:block w-px h-8 bg-zinc-200 dark:bg-zinc-700" />

                        {/* User Data - Wishlist, Cart, Notifications */}
                        <div className="flex flex-row items-center px-1 sm:px-3 gap-1 sm:gap-2 self-stretch sm:border-s sm:border-zinc-200 dark:sm:border-zinc-700">
                            <Link href="/wishlist" className="hidden sm:block relative p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-full transition-colors shrink-0">
                                <Heart className="w-5 lg:w-6 h-5 lg:h-6 text-zinc-700 dark:text-zinc-200" strokeWidth={1.5} />
                            </Link>

                            <Link href="/cart" className="relative p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-full transition-colors shrink-0">
                                <ShoppingCart className="w-5 lg:w-6 h-5 lg:h-6 text-zinc-700 dark:text-zinc-200" strokeWidth={1.5} />
                                <span className="absolute top-0.5 inset-e-0.5 flex justify-center items-center min-w-4 h-4 px-1 bg-red-600 rounded-full text-[10px] font-bold leading-none text-white font-sarabun shadow-sm">
                                    8
                                </span>
                            </Link>

                            <NotificationsDropdown />
                        </div>

                        {/* Separator (hidden on mobile) */}
                        <div className="hidden sm:block w-px h-8 bg-zinc-200 dark:bg-zinc-700" />

                        {/* Language Switcher (hidden on small mobile) */}
                        <button
                            onClick={toggleLocale}
                            className="hidden sm:flex flex-row items-center px-3 self-stretch text-sm lg:text-base font-medium text-zinc-700 dark:text-zinc-200 hover:text-red-800 dark:hover:text-rose-400 transition-colors whitespace-nowrap"
                        >
                            {locale === "en" ? "العربية" : "English"}
                        </button>

                        <div className="flex items-center justify-center px-1">
                            <ThemeToggle />
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-1.5 sm:p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300 ms-1 shrink-0"
                            aria-label="Menu"
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:block bg-[#741C21] dark:bg-zinc-900 border-t border-transparent dark:border-zinc-800 transition-colors duration-300">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-row justify-center items-center gap-2 lg:gap-4 h-12">
                        {navLinks.map((link) => {
                            const LinkIcon = link.icon;
                            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`relative flex flex-row justify-center items-center px-3 gap-2 h-full transition-all ${isActive
                                        ? "text-[#FFC2D0]"
                                        : "text-zinc-50 dark:text-zinc-300 hover:text-[#FFC2D0] dark:hover:text-white"
                                        }`}
                                    data-active={isActive}
                                >
                                    <LinkIcon
                                        className={`w-4 lg:w-5 h-4 lg:h-5 shrink-0 transition-colors ${isActive
                                            ? "text-[#FFC2D0]"
                                            : "text-zinc-50 dark:text-zinc-300"
                                            }`}
                                        strokeWidth={isActive ? 2 : 1.5}
                                    />
                                    <span
                                        className={`text-sm lg:text-base font-sarabun whitespace-nowrap transition-colors ${isActive ? "font-bold text-[#FFC2D0]" : "font-medium"
                                            }`}
                                    >
                                        {link.label}
                                    </span>

                                    {isActive && (
                                        <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#FFC2D0] rounded-t-sm" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 shadow-lg absolute w-full left-0 z-50 transition-colors duration-300 text-start">
                    <div className="mx-auto max-w-7xl px-4 py-4 space-y-4">
                        {/* Mobile Search */}
                        <div className="relative sm:hidden pb-1">
                            <Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
                                        setMobileMenuOpen(false);
                                    }
                                }}
                                placeholder={t("searchPlaceholder")}
                                className="w-full ps-10 pe-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm outline-none text-zinc-800 dark:text-zinc-100 text-start"
                            />
                        </div>

                        {/* Mobile Language Switcher */}
                        <button
                            onClick={() => {
                                toggleLocale();
                                setMobileMenuOpen(false);
                            }}
                            className="sm:hidden flex items-center gap-2 px-2 py-2.5 text-sm font-medium text-red-800 dark:text-rose-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl w-full transition-colors text-start"
                        >
                            {locale === "en" ? "العربية" : "English"}
                        </button>

                        {/* Nav Links - Mobile */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {navLinks.map((link) => {
                                const LinkIcon = link.icon;
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-xl text-sm font-medium transition-all text-start ${isActive
                                            ? "bg-rose-50 dark:bg-rose-200 text-red-800 dark:text-zinc-900 font-semibold"
                                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                            }`}
                                        data-active={isActive}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <LinkIcon className="h-4 sm:h-4.5 w-4 sm:w-4.5 shrink-0" strokeWidth={1.5} />
                                        <span className="text-xs sm:text-sm truncate">{link.label}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Mobile Location & Profile */}
                        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-3">
                            <div className="flex items-center gap-2.5 px-2 text-start">
                                <MapPin className="h-5 w-5 text-red-800 dark:text-rose-400 shrink-0" />
                                <div className="flex flex-col">
                                    <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">{t("deliverTo")}</span>
                                    <span className="text-xs font-bold text-red-800 dark:text-rose-300">{t("cairo")}</span>
                                </div>
                            </div>

                            <Link
                                href="/profile"
                                className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors text-start"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <div className="h-8 w-8 rounded-full bg-rose-50 dark:bg-zinc-800 flex items-center justify-center text-red-800 dark:text-rose-400 font-bold text-sm border dark:border-zinc-700 shrink-0">
                                    J
                                </div>
                                <div className="flex flex-col leading-tight">
                                    <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">{t("hello")}</span>
                                    <span className="text-xs font-bold text-red-800 dark:text-rose-300">Jonathan</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}