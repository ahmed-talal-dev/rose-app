import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { QueryProvider } from "@/shared/providers/query-provider";
import { AuthProvider } from "@/shared/providers/session-provider";
import { Toaster } from "@/shared/ui/sonner";
import { Inter, Sarabun, Tajawal, Zain } from "next/font/google";
import { ThemeProvider } from "@/shared/providers/theme-provider";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter"
});
const sarabun = Sarabun({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-sarabun",
});
const tajawal = Tajawal({
    subsets: ["arabic"],
    weight: ["300", "400", "700", "900"],
    variable: "--font-tajawal",
});
const zain = Zain({
    subsets: ["arabic"],
    weight: ["300", "400", "700", "900"],
    variable: "--font-zain",
});

type Props = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
    const { locale } = await params;

    if (!routing.locales.includes(locale as "en" | "ar")) {
        notFound();
    }

    const messages = await getMessages();

    return (
        <html
            lang={locale}
            dir={locale === "ar" ? "rtl" : "ltr"}
            className={`${inter.variable} ${sarabun.variable} ${tajawal.variable} ${zain.variable}`}
            suppressHydrationWarning
        >
            <body className={locale === "ar" ? "font-tajawal" : "font-inter"}
                suppressHydrationWarning
            >
                <NextIntlClientProvider messages={messages}>
                    <ThemeProvider>
                        <AuthProvider>
                            <QueryProvider>
                                {children}
                                <Toaster richColors position="bottom-right" />
                            </QueryProvider>
                        </AuthProvider>
                    </ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}