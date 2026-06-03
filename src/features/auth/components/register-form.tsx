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
import { Link } from "@/i18n/navigation";
import { type RegisterSchema } from "../schemas";
import { useRegister } from "../hooks";
import { useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { PhoneInput } from "@/shared/ui/phone-input";

// ── Custom Gender Select ──────────────────────────────────────────────────────
interface GenderSelectProps {
    value?: "MALE" | "FEMALE";
    onChange: (val: "MALE" | "FEMALE") => void;
    placeholder: string;
    maleLabel: string;
    femaleLabel: string;
    hasError?: boolean;
}

function GenderSelect({ value, onChange, placeholder, maleLabel, femaleLabel, hasError }: GenderSelectProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const options = [
        { value: "MALE" as const, label: maleLabel, icon: "♂" },
        { value: "FEMALE" as const, label: femaleLabel, icon: "♀" },
    ];

    const selected = options.find((o) => o.value === value);

    return (
        <div className="relative w-full" ref={ref}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`
                    w-full h-10 lg:h-[49px] flex items-center justify-between
                    rounded-[10px] border bg-white px-4 text-sm font-inter
                    transition-colors outline-none
                    ${open ? "border-primary-700 ring-2 ring-primary-700/20" : hasError ? "border-red-500" : "border-zinc-300"}
                    ${selected ? "text-zinc-800" : "text-zinc-400"}
                `}
            >
                <span className="flex items-center gap-2">
                    {selected ? (
                        <>
                            <span className="text-base leading-none">{selected.icon}</span>
                            {selected.label}
                        </>
                    ) : (
                        placeholder
                    )}
                </span>
                <ChevronDown className={`size-4 text-zinc-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute top-full start-0 mt-1.5 w-full bg-white border border-zinc-200 rounded-xl shadow-lg z-[200] p-1 overflow-hidden">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => { onChange(opt.value); setOpen(false); }}
                            className={`
                                w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-inter
                                transition-colors text-start
                                ${value === opt.value
                                    ? "bg-primary-50 text-primary-700 font-medium"
                                    : "text-zinc-700 hover:bg-zinc-50"
                                }
                            `}
                        >
                            <span className="text-base leading-none">{opt.icon}</span>
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
// ─────────────────────────────────────────────────────────────────────────────

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
        `h-10 lg:h-[49px] rounded-[10px] border-zinc-300 px-4 text-sm font-inter text-zinc-800 placeholder:text-zinc-400 ${hasError ? "border-red-500" : ""}`;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-5 lg:gap-9">

            {/* Fields */}
            <div className="flex flex-col gap-2 lg:gap-2.5 w-full">

                {/* First Name + Last Name */}
                <div className="flex w-full gap-3 lg:gap-5">
                    <div className="flex flex-1 flex-col gap-1">
                        <Label htmlFor="firstName" className="text-xs lg:text-sm font-medium text-zinc-800 font-inter">
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
                            <p className="text-xs text-red-600 font-inter">{errors.firstName.message}</p>
                        )}
                    </div>

                    <div className="flex flex-1 flex-col gap-1">
                        <Label htmlFor="lastName" className="text-xs lg:text-sm font-medium text-zinc-800 font-inter">
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
                            <p className="text-xs text-red-600 font-inter">{errors.lastName.message}</p>
                        )}
                    </div>
                </div>

                {/* Username */}
                <div className="flex flex-col gap-1 w-full">
                    <Label htmlFor="username" className="text-xs lg:text-sm font-medium text-zinc-800 font-inter">
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
                        <p className="text-xs text-red-600 font-inter">{errors.username.message}</p>
                    )}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1 w-full">
                    <Label htmlFor="email" className="text-xs lg:text-sm font-medium text-zinc-800 font-inter">
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
                        <p className="text-xs text-red-600 font-inter">{errors.email.message}</p>
                    )}
                </div>

                {/* Phone + Gender side by side on small screens */}
                {/* Phone */}
                <div className="flex flex-col gap-1 w-full">
                    <Label htmlFor="phone" className="text-xs lg:text-sm font-medium text-zinc-800 font-inter">
                        {t("phoneLabel")}
                    </Label>
                    <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                            <PhoneInput
                                id="phone"
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                placeholder={t("phonePlaceholder")}
                                hasError={!!errors.phone}
                            />
                        )}
                    />
                    {errors.phone && (
                        <p className="text-xs text-red-600 font-inter">{errors.phone.message}</p>
                    )}
                </div>

                {/* Gender */}
                <div className="flex flex-col gap-1 w-full">
                    <Label className="text-xs lg:text-sm font-medium text-zinc-800 font-inter">
                        {t("genderLabel")}
                    </Label>
                    <Controller
                        name="gender"
                        control={control}
                        render={({ field }) => (
                            <GenderSelect
                                value={field.value}
                                onChange={field.onChange}
                                placeholder={t("genderPlaceholder")}
                                maleLabel={t("genderMale")}
                                femaleLabel={t("genderFemale")}
                                hasError={!!errors.gender}
                            />
                        )}
                    />
                    {errors.gender && (
                        <p className="text-xs text-red-600 font-inter">{errors.gender.message}</p>
                    )}
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1 w-full">
                    <Label htmlFor="password" className="text-xs lg:text-sm font-medium text-zinc-800 font-inter">
                        {t("passwordLabel")}
                    </Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder={t("passwordPlaceholder")}
                            {...registerField("password")}
                            className={`h-10 lg:h-[49px] rounded-[10px] border-zinc-300 px-4 pe-11 text-sm font-inter text-zinc-800 placeholder:text-zinc-400 w-full [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden ${errors.password ? "border-red-500" : ""}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                            className="absolute end-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600"
                        >
                            {showPassword ? <Eye className="size-4 lg:size-5" /> : <EyeOff className="size-4 lg:size-5" />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-xs text-red-600 font-inter">{errors.password.message}</p>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1 w-full">
                    <Label htmlFor="confirmPassword" className="text-xs lg:text-sm font-medium text-zinc-800 font-inter">
                        {t("confirmPasswordLabel")}
                    </Label>
                    <div className="relative">
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder={t("confirmPasswordPlaceholder")}
                            {...registerField("confirmPassword")}
                            className={`h-10 lg:h-[49px] rounded-[10px] border-zinc-300 px-4 pe-11 text-sm font-inter text-zinc-800 placeholder:text-zinc-400 w-full [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden ${errors.confirmPassword ? "border-red-500" : ""}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? t("hidePassword") : t("showPassword")}
                            className="absolute end-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600"
                        >
                            {showConfirmPassword ? <Eye className="size-4 lg:size-5" /> : <EyeOff className="size-4 lg:size-5" />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-xs text-red-600 font-inter">{errors.confirmPassword.message}</p>
                    )}
                </div>

            </div>

            {/* Submit + Login link */}
            <div className="flex flex-col gap-4 lg:gap-5 w-full">
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-10 lg:h-[41px] bg-[#A6252A] hover:bg-[#741C21] text-white font-medium text-sm lg:text-base rounded-[10px] transition-colors font-sarabun disabled:opacity-70 flex items-center justify-center gap-2"
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

                <div className="flex flex-col items-center gap-4 w-full">
                    <div className="w-full border-t border-zinc-200" />
                    <p className="text-xs lg:text-sm font-medium text-zinc-800 font-sarabun">
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