import { LoginForm } from "@/features/auth/components/login-form";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left — Form */}
            <div className="flex flex-col items-center justify-center w-full lg:w-175 lg:min-h-screen bg-white px-6 py-12 gap-10">
                {/* Language switcher */}
                <div className="w-full max-w-101.5 flex justify-end">
                    <Link
                        href="/login"
                        locale="ar"
                        className="text-base text-zinc-700 hover:text-primary-500 transition-colors font-(--font-tajawal)"
                    >
                        العربية
                    </Link>
                </div>

                {/* Content */}
                <div className="flex flex-col items-center gap-10 w-full max-w-[406px]">
                    {/* Top separator */}
                    <Image
                        src="/svgs/separator-2.svg"
                        alt="ornament"
                        width={280}
                        height={45}
                    />

                    {/* Form */}
                    <div className="flex flex-col items-center gap-6 w-full">
                        {/* Header */}
                        <div className="flex justify-center items-center w-full pb-4 border-b border-zinc-200">
                            <h1
                                className="text-5xl text-[#741C21]"
                                style={{ fontFamily: "'Edwardian Script ITC', 'Great Vibes', cursive" }}
                            >
                                Welcome back!
                            </h1>
                        </div>

                        <LoginForm />
                    </div>

                    {/* Bottom separator (flipped) */}
                    <Image
                        src="/svgs/separator-2.svg"
                        alt="ornament"
                        width={280}
                        height={45}
                        className="scale-y-[-1]"
                    />
                </div>
            </div>

            {/* Right — Cover Image */}
            <div className="hidden lg:flex flex-1 relative min-h-screen bg-[#741C21]">
                <Image
                    src="/images/cover.svg"
                    alt="Rose App"
                    fill
                    className="object-cover"
                    priority
                />
            </div>
        </div>
    );
}