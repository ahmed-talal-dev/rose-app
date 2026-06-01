import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { QueryProvider } from "@/shared/providers/query-provider";
import { AuthProvider } from "@/shared/providers/session-provider";
import { Toaster } from "@/shared/ui/sonner";
import { Inter, Sarabun, Tajawal } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sarabun = Sarabun({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-sarabun",
});
const tajawal = Tajawal({
    subsets: ["arabic"],
    weight: ["300", "400", "700", "900"],
    variable: "--font-Tajawal",
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
            className={`${inter.variable} ${sarabun.variable} ${tajawal.variable}`}
        >
            <body className="font-[var(--font-inter)]">
                <NextIntlClientProvider messages={messages}>
                    <AuthProvider>
                        <QueryProvider>
                            {children}
                            <Toaster richColors position="top-right" />
                        </QueryProvider>
                    </AuthProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}