import { auth } from "@/auth";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import { Session } from "next-auth";

const intlMiddleware = createIntlMiddleware(routing);

const protectedRoutes = ["/profile", "/cart", "/checkout", "/orders", "/wishlist"];
const adminRoutes = ["/dashboard", "/products/manage", "/categories", "/coupons", "/blogs", "/testimonials", "/audit-logs"];
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

export default auth(async (req: NextRequest & { auth: Session | null }) => {
    const { pathname } = req.nextUrl;
    const session = req.auth;

    // Strip locale from pathname
    const pathnameWithoutLocale = pathname.replace(/^\/(en|ar)/, "");
    const locale = pathname.split("/")[1] || "en";

    // Redirect root "/" to "/[locale]/login"
    if (pathnameWithoutLocale === "" || pathnameWithoutLocale === "/") {
        return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    }

    // If not logged in and trying to access protected route
    if (!session && protectedRoutes.some((r) => pathnameWithoutLocale.startsWith(r))) {
        return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    }

    // If not admin and trying to access admin route
    if (adminRoutes.some((r) => pathnameWithoutLocale.startsWith(r))) {
        if (!session) {
            return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
        }
        if (session.user.role === "USER") {
            return NextResponse.redirect(new URL(`/${locale}`, req.url));
        }
    }

    // If logged in and trying to access auth routes
    if (session && authRoutes.some((r) => pathnameWithoutLocale.startsWith(r))) {
        return NextResponse.redirect(new URL(`/${locale}`, req.url));
    }

    return intlMiddleware(req);
});

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
    ],
};