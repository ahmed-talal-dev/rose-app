"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { Button } from "@/shared/ui/button";
import { Link } from "@/i18n/navigation";
import { type LoginSchema } from "../schemas";
import { useLogin } from "../hooks";

export function LoginForm() {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("auth.login.form");
    const [showPassword, setShowPassword] = useState(false);
    const { mutate: login, isPending } = useLogin();

    const loginSchema = useMemo(
        () =>
            z.object({
                email: z
                    .string()
                    .min(1, t("validation.emailRequired"))
                    .email(t("validation.emailInvalid")),
                password: z
                    .string()
                    .min(8, t("validation.passwordMin")),
            }),
        [t]
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = (data: LoginSchema) => {
        login(data, {
            onSuccess: () => {
                toast.success(t("success"));
                router.push("/");
            },
            onError: (error) => {
                toast.error(error.message || t("invalidCredentials"));
            },
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-6">
            <div className="flex w-full flex-col gap-4">

                {/* Email */}
                <div className="flex w-full flex-col gap-1.5">
                    <Label htmlFor="email" className="text-sm font-medium text-zinc-800 font-inter">
                        {t("emailLabel")}
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        {...register("email")}
                        className={`h-[49px] rounded-[10px] px-4 text-sm font-inter ${errors.email ? "border-red-500" : ""
                            }`}
                    />
                    {errors.email && (
                        <p className="text-xs text-red-600 mt-0.5 font-inter">{errors.email.message}</p>
                    )}
                </div>

                {/* Password */}
                <div className="flex w-full flex-col gap-1.5">
                    <Label htmlFor="password" className="text-sm font-medium text-zinc-800 font-inter">
                        {t("passwordLabel")}
                    </Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder={t("passwordPlaceholder")}
                            {...register("password")}
                            className={`h-[49px] rounded-[10px] px-4 pe-11 text-sm text-zinc-900 font-inter ${errors.password ? "border-red-500" : ""
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                            className="absolute end-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600"
                        >
                            {showPassword ? (
                                <Eye className="size-5" />
                            ) : (
                                <EyeOff className="size-5" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-xs text-red-600 mt-0.5 font-inter">{errors.password.message}</p>
                    )}

                    {/* Forgot Password — تحت الـ password input */}
                    <Link
                        href="/forgot-password"
                        className="self-end text-sm font-semibold text-primary-700 hover:underline font-sarabun"
                    >
                        {t("forgotPassword")}
                    </Link>
                </div>

            </div>

            {/* Remember Me — لوحده */}
            <div className="flex items-center gap-2.5">
                <Checkbox
                    id="remember"
                    className="size-5 rounded-[6px] border-primary-700 data-[state=checked]:bg-primary-700"
                />
                <Label
                    htmlFor="remember"
                    className="text-sm font-normal text-zinc-800 cursor-pointer select-none font-inter"
                >
                    {t("rememberMe")}
                </Label>
            </div>

            <div className="flex w-full flex-col gap-4 pt-2">
                <Button
                    type="submit"
                    disabled={isPending}
                    className="h-[41px] w-full rounded-[10px] bg-primary-700 text-base font-semibold text-white hover:bg-primary-800 transition-colors font-sarabun"
                >
                    {isPending ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="size-4 animate-spin" />
                            {t("submitting")}
                        </div>
                    ) : (
                        t("submit")
                    )}
                </Button>

                <div className="flex w-full flex-col items-center gap-4 text-center mt-2">
                    <div className="w-full border-t border-zinc-200" />
                    <p className="text-sm font-medium text-zinc-800 font-sarabun">
                        {t("noAccount")}{" "}
                        <Link
                            href="/register"
                            className="font-semibold text-primary-700 hover:underline font-sarabun"
                        >
                            {t("createAccount")}
                        </Link>
                    </p>
                </div>
            </div>
        </form>
    );
}