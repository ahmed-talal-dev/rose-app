"use client";

import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
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
                email: z
                    .string()
                    .min(1, t("validation.emailRequired"))
                    .email(t("validation.emailInvalid")),
                phone: z.string().optional(),
                gender: z.enum(["MALE", "FEMALE"]).optional(),
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
        control,
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

    const inputClass = (hasError: boolean) =>
        `h-[49px] rounded-[10px] border-zinc-300 px-4 text-sm font-inter ${hasError ? "border-red-500" : ""}`;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-9">
            {/* Fields */}
            <div className="flex flex-col gap-4 w-full">

                {/* First Name + Last Name */}
                <div className="flex w-full gap-5">
                    <div className="flex flex-1 flex-col gap-1.5">
                        <Label htmlFor="firstName" className="text-sm font-medium text-zinc-800 font-inter">
                            {t("firstNameLabel")}
                        </Label>
                        <Input
                            id="firstName"
                            type="text"
                            placeholder={t("firstNamePlaceholder")}
                            {...registerField("firstName")}
                            className={inputClass(!!errors.firstName)}
                        />
                        {errors.firstName && (
                            <p className="text-sm text-red-600 font-inter">{errors.firstName.message}</p>
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
                            className={inputClass(!!errors.lastName)}
                        />
                        {errors.lastName && (
                            <p className="text-sm text-red-600 font-inter">{errors.lastName.message}</p>
                        )}
                    </div>
                </div>

                {/* Username */}
                <div className="flex flex-col gap-1.5 w-full">
                    <Label htmlFor="username" className="text-sm font-medium text-zinc-800 font-inter">
                        {t("usernameLabel")}
                    </Label>
                    <Input
                        id="username"
                        type="text"
                        placeholder={t("usernamePlaceholder")}
                        {...registerField("username")}
                        className={inputClass(!!errors.username)}
                    />
                    {errors.username && (
                        <p className="text-sm text-red-600 font-inter">{errors.username.message}</p>
                    )}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5 w-full">
                    <Label htmlFor="email" className="text-sm font-medium text-zinc-800 font-inter">
                        {t("emailLabel")}
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        {...registerField("email")}
                        className={inputClass(!!errors.email)}
                    />
                    {errors.email && (
                        <p className="text-sm text-red-600 font-inter">{errors.email.message}</p>
                    )}
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5 w-full">
                    <Label htmlFor="phone" className="text-sm font-medium text-zinc-800 font-inter">
                        {t("phoneLabel")}
                    </Label>
                    <div className="relative flex items-center">
                        <div className="absolute start-3 flex items-center gap-2 border-e border-zinc-200 pe-3 h-6">
                            <Image
                                src="/svgs/eg-flag.svg"
                                alt="EG"
                                width={23}
                                height={16}
                                className="rounded-sm"
                            />
                            <span className="text-sm font-medium text-[#323639] font-inter">+20</span>
                        </div>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder={t("phonePlaceholder")}
                            {...registerField("phone")}
                            className={`h-[53px] rounded-[10px] border-zinc-300 ps-[5.5rem] pe-4 text-sm font-inter ${errors.phone ? "border-red-500" : ""}`}
                        />
                    </div>
                    {errors.phone && (
                        <p className="text-sm text-red-600 font-inter">{errors.phone.message}</p>
                    )}
                </div>

                {/* Gender */}
                <div className="flex flex-col gap-1.5 w-full">
                    <Label htmlFor="gender" className="text-sm font-medium text-zinc-800 font-inter">
                        {t("genderLabel")}
                    </Label>
                    <Controller
                        name="gender"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger
                                    className={`h-[49px] rounded-[10px] border-zinc-300 px-4 text-sm font-inter ${errors.gender ? "border-red-500" : ""}`}
                                >
                                    <SelectValue placeholder={t("genderPlaceholder")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MALE">{t("genderMale")}</SelectItem>
                                    <SelectItem value="FEMALE">{t("genderFemale")}</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.gender && (
                        <p className="text-sm text-red-600 font-inter">{errors.gender.message}</p>
                    )}
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5 w-full">
                    <Label htmlFor="password" className="text-sm font-medium text-zinc-800 font-inter">
                        {t("passwordLabel")}
                    </Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder={t("passwordPlaceholder")}
                            {...registerField("password")}
                            className={`h-[49px] rounded-[10px] border-zinc-300 px-4 pe-11 text-sm font-inter ${errors.password ? "border-red-500" : ""}`}
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
                        <p className="text-sm text-red-600 font-inter">{errors.password.message}</p>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1.5 w-full">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-800 font-inter">
                        {t("confirmPasswordLabel")}
                    </Label>
                    <div className="relative">
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder={t("confirmPasswordPlaceholder")}
                            {...registerField("confirmPassword")}
                            className={`h-[49px] rounded-[10px] border-zinc-300 px-4 pe-11 text-sm font-inter ${errors.confirmPassword ? "border-red-500" : ""}`}
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
                        <p className="text-sm text-red-600 font-inter">{errors.confirmPassword.message}</p>
                    )}
                </div>

            </div>

            {/* Submit + Login link */}
            <div className="flex flex-col gap-5 w-full">
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-[41px] bg-[#A6252A] hover:bg-[#741C21] text-white font-medium text-base rounded-[10px] transition-colors font-sarabun disabled:opacity-70 flex items-center justify-center gap-2"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            {t("submitting")}
                        </>
                    ) : (
                        t("submit")
                    )}
                </button>

                <div className="flex flex-col items-center gap-5 w-full">
                    <div className="w-full border-t border-zinc-200" />
                    <p className="text-sm font-medium text-zinc-800 font-sarabun">
                        {t("hasAccount")}{" "}
                        <Link
                            href="/login"
                            className="font-semibold text-[#741C21] hover:underline font-sarabun"
                        >
                            {t("login")}
                        </Link>
                    </p>
                </div>
            </div>
        </form>
    );
}