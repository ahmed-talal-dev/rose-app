"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Link } from "@/i18n/navigation";
import { useResetPassword } from "../hooks";

export function ResetPasswordForm() {
    const t = useTranslations("auth.resetPassword.form");
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { mutate: resetPassword, isPending } = useResetPassword();

    const schema = useMemo(
        () =>
            z.object({
                newPassword: z
                    .string()
                    .min(8, t("validation.passwordMin"))
                    .regex(/[A-Z]/, t("validation.passwordUppercase"))
                    .regex(/[0-9]/, t("validation.passwordNumber")),
                confirmPassword: z.string().min(1, t("validation.confirmRequired")),
            }).refine((d) => d.newPassword === d.confirmPassword, {
                message: t("validation.passwordsMismatch"),
                path: ["confirmPassword"],
            }),
        [t]
    );

    type FormData = z.infer<typeof schema>;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    const onSubmit = (data: FormData) => {
        if (!token) {
            toast.error(t("invalidToken"));
            return;
        }
        resetPassword(
            { token, newPassword: data.newPassword, confirmPassword: data.confirmPassword },
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
                            className={`h-12.25 rounded-[10px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#2a2b2f] text-zinc-800 dark:text-zinc-100 px-4 pe-11 text-sm focus-visible:ring-[#FFA3B9] ${errors.newPassword ? "border-red-500" : ""}`}
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
                            className={`h-12.25 rounded-[10px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#2a2b2f] text-zinc-800 dark:text-zinc-100 px-4 pe-11 text-sm focus-visible:ring-[#FFA3B9] ${errors.confirmPassword ? "border-red-500" : ""}`}
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
                    className="w-full h-[41px] bg-[#A6252A] dark:bg-[#FFA3B9] hover:bg-[#741C21] dark:hover:bg-[#ff85a2] text-white dark:text-[#1c1d21] font-semibold text-base rounded-[10px] transition-colors font-sarabun disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm"
                >
                    {isPending ? (
                        <><Loader2 className="size-4 animate-spin" />{t("submitting")}</>
                    ) : t("submit")}
                </button>

                <div className="flex flex-col items-center gap-4">
                    <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-300 font-sarabun">
                        {t("needHelp")}{" "}
                        <Link href="/contact" className="font-semibold text-[#A6252A] dark:text-[#FFA3B9] hover:underline">
                            {t("contactUs")}
                        </Link>
                    </p>
                </div>
            </div>
        </form>
    );
}