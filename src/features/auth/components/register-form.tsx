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
import { Button } from "@/shared/ui/button";
import { Link } from "@/i18n/navigation";
import { type RegisterSchema } from "../schemas";
import { useRegister } from "../hooks";
import Image from "next/image";

export function RegisterForm() {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("auth.register.form");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { mutate: register, isPending } = useRegister();

    const registerSchema = useMemo(
        () =>
            z.object({
                firstName: z.string().min(1, t("validation.firstNameRequired")),
                lastName: z.string().min(1, t("validation.lastNameRequired")),
                username: z
                    .string()
                    .min(3, t("validation.usernameMin"))
                    .max(30, t("validation.usernameMax")),
                phone: z.string().optional(),
                email: z
                    .string()
                    .min(1, t("validation.emailRequired"))
                    .email(t("validation.emailInvalid")),
                password: z
                    .string()
                    .min(8, t("validation.passwordMin"))
                    .regex(/[A-Z]/, t("validation.passwordUppercase"))
                    .regex(/[0-9]/, t("validation.passwordNumber")),
                confirmPassword: z.string().min(1, t("validation.confirmPasswordRequired")),
            }).refine((data) => data.password === data.confirmPassword, {
                message: t("validation.passwordsMismatch"),
                path: ["confirmPassword"],
            }),
        [t]
    );

    const {
        register: registerField,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = (data: RegisterSchema) => {
        register(data, {
            onSuccess: () => {
                toast.success(t("success"));
                router.push("/login");
            },
            onError: (error) => {
                toast.error(error.message);
            },
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-6">
            <div className="flex w-full flex-col gap-4">

                {/* First Name + Last Name */}
                <div className="flex w-full gap-3">
                    <div className="flex flex-1 flex-col gap-1.5">
                        <Label htmlFor="firstName" className="text-sm font-medium text-zinc-800 font-inter">
                            {t("firstNameLabel")}
                        </Label>
                        <Input
                            id="firstName"
                            type="text"
                            placeholder={t("firstNamePlaceholder")}
                            {...registerField("firstName")}
                            className={`h-[49px] rounded-[10px] px-4 text-sm font-inter ${errors.firstName ? "border-red-500" : ""}`}
                        />
                        {errors.firstName && (
                            <p className="text-xs text-red-600 mt-0.5 font-inter">{errors.firstName.message}</p>
                        )}
                    </div>

                    <div className="flex flex-1 flex-col gap-1.5">
                        <Label htmlFor="lastName" className="text-sm font-medium text-zinc-800 font-inter">
                            {t("lastNameLabel")}
                        </Label>
                        <Input
                            id="lastName"
                            type="text"
                            placeholder={t("lastNamePlaceholder")}
                            {...registerField("lastName")}
                            className={`h-[49px] rounded-[10px] px-4 text-sm font-inter ${errors.lastName ? "border-red-500" : ""}`}
                        />
                        {errors.lastName && (
                            <p className="text-xs text-red-600 mt-0.5 font-inter">{errors.lastName.message}</p>
                        )}
                    </div>
                </div>

                {/* Username */}
                <div className="flex w-full flex-col gap-1.5">
                    <Label htmlFor="username" className="text-sm font-medium text-zinc-800 font-inter">
                        {t("usernameLabel")}
                    </Label>
                    <Input
                        id="username"
                        type="text"
                        placeholder={t("usernamePlaceholder")}
                        {...registerField("username")}
                        className={`h-[49px] rounded-[10px] px-4 text-sm font-inter ${errors.username ? "border-red-500" : ""}`}
                    />
                    {errors.username && (
                        <p className="text-xs text-red-600 mt-0.5 font-inter">{errors.username.message}</p>
                    )}
                </div>

                {/* Phone */}
                <div className="flex w-full flex-col gap-1.5">
                    <Label htmlFor="phone" className="text-sm font-medium text-zinc-800 font-inter">
                        {t("phoneLabel")}
                    </Label>
                    <div className="relative flex items-center">
                        <div className="absolute start-3 flex items-center gap-1.5 border-e border-zinc-200 pe-3">
                            <Image
                                src="/svgs/eg-flag.svg"
                                alt="EG"
                                width={23}
                                height={16}
                                className="rounded-sm"
                            />
                            <span className="text-sm text-zinc-700 font-inter">+20</span>
                        </div>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder={t("phonePlaceholder")}
                            {...registerField("phone")}
                            className={`h-[52px] rounded-[10px] ps-24 pe-4 text-sm font-inter ${errors.phone ? "border-red-500" : ""}`}
                        />
                    </div>
                    {errors.phone && (
                        <p className="text-xs text-red-600 mt-0.5 font-inter">{errors.phone.message}</p>
                    )}
                </div>

                {/* Email */}
                <div className="flex w-full flex-col gap-1.5">
                    <Label htmlFor="email" className="text-sm font-medium text-zinc-800 font-inter">
                        {t("emailLabel")}
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        {...registerField("email")}
                        className={`h-[49px] rounded-[10px] px-4 text-sm font-inter ${errors.email ? "border-red-500" : ""}`}
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
                            {...registerField("password")}
                            className={`h-[49px] rounded-[10px] px-4 pe-11 text-sm font-inter ${errors.password ? "border-red-500" : ""}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                            className="absolute end-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600"
                        >
                            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-xs text-red-600 mt-0.5 font-inter">{errors.password.message}</p>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="flex w-full flex-col gap-1.5">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-800 font-inter">
                        {t("confirmPasswordLabel")}
                    </Label>
                    <div className="relative">
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder={t("confirmPasswordPlaceholder")}
                            {...registerField("confirmPassword")}
                            className={`h-[49px] rounded-[10px] px-4 pe-11 text-sm font-inter ${errors.confirmPassword ? "border-red-500" : ""}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? t("hidePassword") : t("showPassword")}
                            className="absolute end-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600"
                        >
                            {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-xs text-red-600 mt-0.5 font-inter">{errors.confirmPassword.message}</p>
                    )}
                </div>

            </div>

            {/* Submit */}
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
                        {t("hasAccount")}{" "}
                        <Link
                            href="/login"
                            className="font-semibold text-primary-700 hover:underline font-sarabun"
                        >
                            {t("login")}
                        </Link>
                    </p>
                </div>
            </div>
        </form>
    );
}