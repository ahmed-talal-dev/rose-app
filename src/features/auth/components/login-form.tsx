"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
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
    const t = useTranslations("auth.login.form");
    const [showPassword, setShowPassword] = useState(false);
    const { mutate: login, isPending } = useLogin();

    const loginSchema = useMemo(
        () =>
            z.object({
                username: z.string().min(1, t("validation.usernameRequired")),
                password: z.string().min(8, t("validation.passwordMin")),
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
                    <Label htmlFor="username" className="text-sm font-medium text-zinc-800 dark:text-zinc-300 font-inter">
                        {t("usernameLabel")}
                    </Label>
                    <Input
                        id="username"
                        type="text"
                        placeholder={t("usernamePlaceholder")}
                        {...register("username")}
                        className={`h-12.25 rounded-[10px] px-4 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-[#3A3B3F] border-zinc-200 dark:border-zinc-700 text-sm font-inter focus-visible:ring-1 focus-visible:ring-primary-700 dark:focus-visible:ring-[#FFA3B9] placeholder:text-zinc-400 dark:placeholder:text-zinc-500 ${errors.username ? "border-red-500" : ""}`}
                    />
                    {errors.username && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-0.5 font-inter">{errors.username.message}</p>
                    )}
                </div>

                {/* Password */}
                <div className="flex w-full flex-col gap-1.5">
                    <Label htmlFor="password" className="text-sm font-medium text-zinc-800 dark:text-zinc-300 font-inter">
                        {t("passwordLabel")}
                    </Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder={t("passwordPlaceholder")}
                            {...register("password")}
                            className={`h-12.25 rounded-[10px] px-4 pe-11 text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-[#3A3B3F] border-zinc-200 dark:border-zinc-700 font-inter focus-visible:ring-1 focus-visible:ring-primary-700 dark:focus-visible:ring-[#FFA3B9] placeholder:text-zinc-400 dark:placeholder:text-zinc-500 ${errors.password ? "border-red-500" : ""}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                            className="absolute inset-e-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
                        >
                            {showPassword ? (
                                <Eye className="size-5" />
                            ) : (
                                <EyeOff className="size-5" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-0.5 font-inter">{errors.password.message}</p>
                    )}

                    {/* Forgot Password  */}
                    <Link
                        href="/forgot-password"
                        className="self-end text-sm font-semibold text-primary-700 dark:text-[#FFA3B9] hover:underline font-sarabun transition-colors"
                    >
                        {t("forgotPassword")}
                    </Link>
                </div>

            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2.5">
                <Checkbox
                    id="remember"
                    className="size-5 rounded-[6px] border-primary-700 dark:border-[#FFA3B9] data-[state=checked]:bg-primary-700 dark:data-[state=checked]:bg-[#FFA3B9] dark:data-[state=checked]:text-zinc-900"
                />
                <Label
                    htmlFor="remember"
                    className="text-sm font-normal text-zinc-800 dark:text-zinc-300 cursor-pointer select-none font-inter"
                >
                    {t("rememberMe")}
                </Label>
            </div>

            <div className="flex w-full flex-col gap-4 pt-2">
                <Button
                    type="submit"
                    disabled={isPending}
                    className="h-10.25 w-full rounded-[10px] bg-primary-700 dark:bg-[#FFA3B9] text-base font-semibold text-white dark:text-[#212226] hover:bg-primary-800 dark:hover:bg-[#ffbccc] transition-colors font-sarabun"
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
                    <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-300 font-sarabun">
                        {t("noAccount")}{" "}
                        <Link
                            href="/register"
                            className="font-semibold text-primary-700 dark:text-[#FFA3B9] hover:underline font-sarabun transition-colors"
                        >
                            {t("createAccount")}
                        </Link>
                    </p>
                </div>
            </div>
        </form>
    );
}