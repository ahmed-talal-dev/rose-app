"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations, useLocale } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useLogin } from "../hooks";

export function LoginPopover() {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("auth.login.form");
    const tRegister = useTranslations("auth.register.form");
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");
    const [showPassword, setShowPassword] = useState(false);
    const { mutate: login, isPending } = useLogin();

    const loginSchema = useMemo(
        () =>
            z.object({
                username: z.string().min(1, t("validation.emailRequired")),
                password: z.string().min(8, t("validation.passwordMin")),
            }),
        [t]
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const [registerEmail, setRegisterEmail] = useState("");
    const [registerError, setRegisterError] = useState("");

    const onLoginSubmit = (data: any) => {
        login(data, {
            onSuccess: () => {
                toast.success(t("success"));
                router.refresh();
            },
            onError: (error: any) => {
                toast.error(error.message || t("invalidCredentials"));
            },
        });
    };

    const handleRegisterRedirect = (e: React.FormEvent) => {
        e.preventDefault();
        if (!registerEmail) {
            setRegisterError(tRegister("validation.emailRequired"));
            return;
        }
        if (!/\S+@\S+\.\S+/.test(registerEmail)) {
            setRegisterError(tRegister("validation.emailInvalid"));
            return;
        }
        setRegisterError("");
        router.push(`/register?email=${encodeURIComponent(registerEmail)}`);
    };

    return (
        <div className="w-[393px] h-[370px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden font-sarabun text-start select-none">
            {/* Tabs */}
            <div className="flex flex-row items-start w-[393px] h-[44px] shrink-0">
                {/* Login Tab */}
                <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className={`flex flex-row justify-center items-center px-4 py-3 gap-2.5 w-[196.5px] h-[44px] transition-colors cursor-pointer border-none outline-none ${
                        activeTab === "login"
                            ? "bg-[#A6252A] text-white"
                            : "bg-[#FAFAFA] dark:bg-zinc-800 text-[#27272A] dark:text-zinc-300 border-b border-zinc-300 dark:border-zinc-700"
                    }`}
                >
                    <span className="font-sarabun font-medium text-base leading-none">
                        {t("submit")}
                    </span>
                </button>

                {/* Register Tab */}
                <button
                    type="button"
                    onClick={() => setActiveTab("register")}
                    className={`flex flex-row justify-center items-center px-4 py-3 gap-2.5 w-[196.5px] h-[44px] transition-colors cursor-pointer border-none outline-none ${
                        activeTab === "register"
                            ? "bg-[#A6252A] text-white"
                            : "bg-[#FAFAFA] dark:bg-zinc-800 text-[#27272A] dark:text-zinc-300 border-b border-zinc-300 dark:border-zinc-700"
                    }`}
                >
                    <span className="font-sarabun font-medium text-base leading-none">
                        {locale === "ar" ? "حساب جديد" : "Register"}
                    </span>
                </button>
            </div>

            {/* Form */}
            {activeTab === "login" ? (
                <form
                    onSubmit={handleSubmit(onLoginSubmit)}
                    className="flex flex-col p-4 gap-4 w-[393px] h-[326px] bg-white dark:bg-zinc-900 rounded-b-xl"
                >
                    {/* Fields */}
                    <div className="flex flex-col gap-4 w-full">
                        {/* Email Field */}
                        <div className="flex flex-col items-start gap-1.5 w-full h-[72px] bg-white dark:bg-zinc-900 shrink-0">
                            <label className="h-[17px] text-sm font-medium text-zinc-800 dark:text-zinc-350 font-inter">
                                {t("emailLabel")}
                            </label>
                            <input
                                type="text"
                                placeholder={t("emailPlaceholder")}
                                {...register("username")}
                                className={`w-full h-[49px] bg-white dark:bg-zinc-800 border border-[#D4D4D8] dark:border-zinc-700 rounded-[10px] px-4 py-4 text-sm text-zinc-800 dark:text-zinc-100 font-inter placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-[#A6252A] dark:focus:border-rose-500 transition-colors ${
                                    errors.username ? "border-red-650" : ""
                                }`}
                            />
                        </div>

                        {/* Password Field */}
                        <div className="flex flex-col items-start gap-1.5 w-full h-[72px] bg-white dark:bg-zinc-900 shrink-0">
                            <label className="h-[17px] text-sm font-medium text-zinc-800 dark:text-zinc-350 font-inter">
                                {t("passwordLabel")}
                            </label>
                            <div className="relative w-full">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="********"
                                    {...register("password")}
                                    className={`w-full h-[49px] bg-white dark:bg-zinc-800 border border-[#D4D4D8] dark:border-zinc-700 rounded-[10px] px-4 py-4 text-sm text-zinc-800 dark:text-zinc-100 font-inter placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-[#A6252A] dark:focus:border-rose-500 transition-colors ${
                                        errors.password ? "border-red-650" : ""
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 end-4 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                                >
                                    {showPassword ? (
                                        <Eye className="size-5" />
                                    ) : (
                                        <EyeOff className="size-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="w-full h-[14px] text-end shrink-0">
                        <a
                            href={`/${locale}/forgot-password`}
                            className="text-sm font-semibold text-[#741C21] dark:text-[#FFA3B9] hover:underline font-sarabun"
                        >
                            {t("forgotPassword")}
                        </a>
                    </div>

                    {/* Checkbox and Login button */}
                    <div className="flex flex-col w-full gap-4 shrink-0">
                        {/* Checkbox (light) */}
                        <label className="flex flex-row items-center pt-5 gap-2.5 w-full h-[40px] cursor-pointer select-none">
                            <input
                                type="checkbox"
                                className="size-5 border border-[#741C21] dark:border-[#FFA3B9] rounded-[8px] accent-[#A6252A] cursor-pointer"
                            />
                            <span className="text-sm text-zinc-800 dark:text-zinc-300 font-inter leading-none">
                                {t("rememberMe")}
                            </span>
                        </label>

                        {/* Button (light) */}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex justify-center items-center w-full h-[41px] bg-[#A6252A] hover:bg-[#8B1E22] transition-colors rounded-[10px] text-white font-sarabun font-medium text-base disabled:opacity-75 cursor-pointer"
                        >
                            {isPending ? (
                                <Loader2 className="size-5 animate-spin text-white" />
                            ) : (
                                t("submit")
                            )}
                        </button>
                    </div>
                </form>
            ) : (
                <form
                    onSubmit={handleRegisterRedirect}
                    className="flex flex-col p-4 gap-4 w-[393px] h-[326px] bg-white dark:bg-zinc-900 rounded-b-xl"
                >
                    {/* Fields */}
                    <div className="flex flex-col gap-4 w-full">
                        {/* Email Field */}
                        <div className="flex flex-col items-start gap-1.5 w-full h-[72px] bg-white dark:bg-zinc-900 shrink-0">
                            <label className="h-[17px] text-sm font-medium text-zinc-800 dark:text-zinc-350 font-inter">
                                {tRegister("emailLabel")}
                            </label>
                            <input
                                type="email"
                                placeholder={tRegister("emailPlaceholder")}
                                value={registerEmail}
                                onChange={(e) => setRegisterEmail(e.target.value)}
                                className={`w-full h-[49px] bg-white dark:bg-zinc-800 border border-[#D4D4D8] dark:border-zinc-700 rounded-[10px] px-4 py-4 text-sm text-zinc-800 dark:text-zinc-100 font-inter placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-[#A6252A] dark:focus:border-rose-500 transition-colors ${
                                    registerError ? "border-red-650" : ""
                                }`}
                            />
                            {registerError && (
                                <span className="text-xs text-red-600 dark:text-red-400 mt-1 font-inter">
                                    {registerError}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex-1" />

                    {/* Button (light) */}
                    <button
                        type="submit"
                        className="flex justify-center items-center w-full h-[41px] bg-[#A6252A] hover:bg-[#8B1E22] transition-colors rounded-[10px] text-white font-sarabun font-medium text-base cursor-pointer"
                    >
                        {locale === "ar" ? "متابعة التسجيل" : "Continue to Register"}
                    </button>
                </form>
            )}
        </div>
    );
}
