"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Link } from "@/i18n/navigation";
import { type ForgotPasswordSchema } from "../schemas";
import { useForgotPassword } from "../hooks";

export function ForgotPasswordForm() {
    const t = useTranslations("auth.forgotPassword.form");
    const locale = useLocale();
    const { mutate: forgotPassword, isPending, isSuccess } = useForgotPassword();

    const forgotPasswordSchema = useMemo(
        () =>
            z.object({
                email: z
                    .string()
                    .min(1, t("validation.emailRequired"))
                    .email(t("validation.emailInvalid")),
            }),
        [t]
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordSchema>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = (data: ForgotPasswordSchema) => {
        forgotPassword(
            {
                email: data.email,
                redirectUrl: `${window.location.origin}/${locale}/reset-password`,
            },
            {
                onSuccess: () => toast.success(t("success")),
                onError: (err) => toast.error(err.message),
            }
        );
    };

    // ── Success state ──
    if (isSuccess) {
        return (
            <div className="flex w-full flex-col items-center gap-4 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-primary-50 dark:bg-[#A6252A]/10">
                    <svg className="size-7 text-[#A6252A] dark:text-[#FFA3B9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 font-inter">{t("checkEmail")}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-inter">{t("checkEmailSubtitle")}</p>
                </div>
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800 mt-2" />
                <p className="text-xs lg:text-sm font-medium text-zinc-800 dark:text-zinc-300 font-sarabun">
                    {t("noAccount")}{" "}
                    <Link href="/register" className="font-semibold text-[#A6252A] dark:text-[#FFA3B9] hover:underline font-sarabun">
                        {t("createAccount")}
                    </Link>
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-5 lg:gap-9">
            <div className="flex flex-col gap-2 lg:gap-2.5">
                <div className="flex flex-col gap-1">
                    <Label htmlFor="email" className="text-xs lg:text-sm font-medium text-zinc-800 dark:text-zinc-300 font-inter">
                        {t("emailLabel")}
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        {...register("email")}
                        className={`h-10 lg:h-12.25 rounded-[10px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#2a2b2f] px-4 text-sm font-inter text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:ring-[#FFA3B9] ${errors.email ? "border-red-500 dark:border-red-500" : ""}`}
                    />
                    {errors.email && (
                        <p className="text-xs text-red-600 dark:text-red-400 font-inter">{errors.email.message}</p>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-4 lg:gap-5">
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-10 lg:h-12.25 bg-[#A6252A] dark:bg-[#FFA3B9] hover:bg-[#821d20] dark:hover:bg-[#ff85a2] text-white dark:text-[#1c1d21] font-semibold text-sm lg:text-base rounded-[10px] transition-colors font-sarabun disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm"
                >
                    {isPending ? (
                        <><Loader2 className="size-4 animate-spin" />{t("submitting")}</>
                    ) : t("submit")}
                </button>

                <div className="flex flex-col items-center gap-4">
                    <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                    <p className="text-xs lg:text-sm font-medium text-zinc-800 dark:text-zinc-300 font-sarabun">
                        {t("noAccount")}{" "}
                        <Link href="/register" className="font-semibold text-[#A6252A] dark:text-[#FFA3B9] hover:underline font-sarabun">
                            {t("createAccount")}
                        </Link>
                    </p>
                </div>
            </div>
        </form>
    );
}