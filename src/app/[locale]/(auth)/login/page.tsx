import { LoginForm } from "@/features/auth/components/login-form";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

export default function LoginPage() {
    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* Left — Form */}
            <div className="flex flex-col items-center justify-center px-8 py-12 bg-white relative">
                {/* Language switcher */}
                <div className="absolute top-6 right-6">
                    <Link
                        href="/login"
                        locale="ar"
                        className="text-sm text-zinc-600 hover:text-primary-500 transition-colors"
                    >
                        العربية
                    </Link>
                </div>

                <div className="w-full max-w-sm">
                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="text-primary-500 mb-2">
                            {/* Ornament */}
                            <svg width="160" height="40" viewBox="0 0 160 40" fill="none">
                                <path d="M80 20 Q60 5 40 15 Q20 25 10 20" stroke="#CD2E33" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                                <circle cx="80" cy="20" r="4" fill="#CD2E33" />
                                <path d="M80 20 Q100 5 120 15 Q140 25 150 20" stroke="#CD2E33" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                                <circle cx="40" cy="15" r="3" fill="none" stroke="#CD2E33" strokeWidth="1" />
                                <circle cx="120" cy="15" r="3" fill="none" stroke="#CD2E33" strokeWidth="1" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-primary-500 font-serif italic">
                            Welcome back!
                        </h1>
                    </div>

                    <LoginForm />
                </div>

                {/* Bottom ornament */}
                <div className="absolute bottom-8">
                    <svg width="120" height="30" viewBox="0 0 120 30" fill="none">
                        <path d="M60 15 Q45 5 30 10 Q15 15 10 12" stroke="#CD2E33" strokeWidth="1" fill="none" strokeLinecap="round" />
                        <circle cx="60" cy="15" r="3" fill="#CD2E33" />
                        <path d="M60 15 Q75 5 90 10 Q105 15 110 12" stroke="#CD2E33" strokeWidth="1" fill="none" strokeLinecap="round" />
                    </svg>
                </div>
            </div>

            {/* Right — Image */}
            <div className="hidden lg:block relative bg-primary-900">
                <Image
                    src="/assets/images/login-bg.jpg"
                    alt="Rose App"
                    fill
                    className="object-cover"
                    priority
                />
            </div>
        </div>
    );
}