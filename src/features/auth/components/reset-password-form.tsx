"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Link } from "@/i18n/navigation";
import { useResetPassword } from "../hooks";

const buildResetPasswordSchema = (t: ReturnType<typeof useTranslations<"auth.resetPassword.form">>) =>
  z.object({
    resetCode: z.string().min(6, t("validation.resetCodeMin")),
    newPassword: z
      .string()
      .min(8, t("validation.passwordMin"))
      .regex(/[A-Z]/, t("validation.passwordUppercase"))
      .regex(/[0-9]/, t("validation.passwordNumber")),
    confirmPassword: z.string().min(1, t("validation.confirmRequired")),
  }).refine((d) => d.newPassword === d.confirmPassword, {
    message: t("validation.passwordsMismatch"),
    path: ["confirmPassword"],
  });

interface ResetPasswordFormProps {
  email?: string;
}

export function ResetPasswordForm({ email: emailProp }: ResetPasswordFormProps) {
    const t = useTranslations("auth.resetPassword.form");
    const locale = useLocale();
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = emailProp || searchParams.get("email") || "";
    const tokenFromUrl = searchParams.get("token") ?? "";
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { mutate: resetPassword, isPending } = useResetPassword();

    const schema = buildResetPasswordSchema(t);
    type FormData = z.infer<typeof schema>;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            resetCode: tokenFromUrl,
            newPassword: "",
            confirmPassword: ""
        }
    });

    const onSubmit = (data: FormData) => {
        resetPassword(
            { email, token: data.resetCode, newPassword: data.newPassword },
            {
                onSuccess: () => {
                    toast.success(t("success"));
                    router.push("/login");
                },
                onError: (err) => toast.error(err.message),
            }
        );
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-9">
            <div className="flex flex-col gap-4 w-full">

                {/* Reset Code */}
                <div className="flex flex-col gap-1.5 w-full">
                    <Label htmlFor="resetCode" className="text-sm font-medium text-zinc-800 dark:text-zinc-300">
                        {t("resetCodeLabel")}
                    </Label>
                    <Input
                        id="resetCode"
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        {...register("resetCode")}
                        className={`h-12.25 rounded-[10px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 px-4 text-sm focus-visible:ring-rose-300 ${errors.resetCode ? "border-red-500" : ""}` }
                    />
                    {errors.resetCode && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.resetCode.message}</p>
                    )}
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5 w-full">
                    <Label htmlFor="newPassword" className="text-sm font-medium text-zinc-800 dark:text-zinc-300">
                        {t("passwordLabel")}
                    </Label>
                    <div className="relative">
                        <Input
                            id="newPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...register("newPassword")}
                            className={`h-12.25 rounded-[10px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 px-4 pe-11 text-sm focus-visible:ring-rose-300 ${errors.newPassword ? "border-red-500" : ""}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-e-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                        >
                            {showPassword ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
                        </button>
                    </div>
                    {errors.newPassword && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.newPassword.message}</p>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1.5 w-full">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-800 dark:text-zinc-300">
                        {t("confirmLabel")}
                    </Label>
                    <div className="relative">
                        <Input
                            id="confirmPassword"
                            type={showConfirm ? "text" : "password"}
                            placeholder="••••••••"
                            {...register("confirmPassword")}
                            className={`h-12.25 rounded-[10px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 px-4 pe-11 text-sm focus-visible:ring-rose-300 ${errors.confirmPassword ? "border-red-500" : ""}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute inset-e-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                        >
                            {showConfirm ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>
                    )}
                </div>
            </div>

            {/* Submit */}
            <div className="flex flex-col gap-5 w-full">
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-[41px] bg-primary-600 dark:bg-rose-300 hover:bg-primary-700 dark:hover:bg-rose-400 text-white dark:text-zinc-900 font-semibold text-base rounded-[10px] transition-colors font-sarabun disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm"
                >
                    {isPending ? (
                        <><Loader2 className="size-4 animate-spin" />{t("submitting")}</>
                    ) : t("submit")}
                </button>

                <div className="flex flex-col items-center gap-4">
                    <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-300 font-sarabun">
                        {t("needHelp")}{" "}
                        <Link href="/contact" className="font-semibold text-primary-600 dark:text-rose-300 hover:underline">
                            {t("contactUs")}
                        </Link>
                    </p>
                </div>
            </div>
        </form>
    );
}