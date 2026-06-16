"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Link } from "@/i18n/navigation";
import { PhoneInput } from "@/shared/ui/phone-input";
import { GenderSelect } from "@/shared/ui/gender-select";
import { cn, formatPhone } from "@/shared/lib/utils";

import { type RegisterSchema } from "../schemas";
import { useRegister, ApiError } from "../hooks";

// ─── Input class helpers ────────────────────────────────────────────────────────

const baseInput =
    "h-10 lg:h-[49px] rounded-[10px] bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 px-4 text-sm font-inter text-zinc-800 dark:text-zinc-100 focus-visible:ring-1 focus-visible:ring-primary-700 dark:focus-visible:ring-rose-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-500";

const inputClass = (hasError: boolean) =>
    cn(baseInput, hasError && "border-red-500");

const passwordInputClass = (hasError: boolean) =>
    cn(
        baseInput,
        "pe-11 w-full [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden",
        hasError && "border-red-500"
    );

// ─── Shared sub-components ────────────────────────────────────────────────────

const FieldError = ({ message }: { message?: string }) =>
    message ? (
        <p className="text-xs text-red-600 dark:text-red-400 font-inter mt-0.5">{message}</p>
    ) : null;

const SubmitButton = ({
    isPending,
    label,
    loadingLabel,
}: {
    isPending: boolean;
    label: string;
    loadingLabel: string;
}) => (
    <button
        type="submit"
        disabled={isPending}
        className="w-full h-10 lg:h-[41px] bg-primary-700 dark:bg-rose-300 hover:bg-primary-800 dark:hover:bg-rose-400 text-white dark:text-zinc-900 font-semibold text-sm lg:text-base rounded-[10px] transition-colors font-sarabun disabled:opacity-70 flex items-center justify-center gap-2"
    >
        {isPending ? (
            <>
                <Loader2 className="size-4 animate-spin" />
                {loadingLabel}
            </>
        ) : (
            label
        )}
    </button>
);

const LoginLink = ({ prompt, label }: { prompt: string; label: string }) => (
    <div className="flex flex-col items-center gap-4">
        <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
        <p className="text-xs lg:text-sm font-medium text-zinc-800 dark:text-zinc-300 font-sarabun">
            {prompt}{" "}
            <Link
                href="/login"
                className="font-semibold text-primary-700 dark:text-rose-300 hover:underline transition-colors"
            >
                {label}
            </Link>
        </p>
    </div>
);

// ─── Schema builder ───────────────────────────────────────────────────────────

type TFunc = ReturnType<typeof useTranslations<"auth.register.form">>;

const buildRegisterSchema = (t: TFunc) =>
    z
        .object({
            firstName: z.string().min(1, t("validation.firstNameRequired")),
            lastName: z.string().min(1, t("validation.lastNameRequired")),
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
                .regex(/[0-9]/, t("validation.passwordNumber"))
                .regex(/[!@#$%^&*]/, t("validation.passwordSpecial")),
            confirmPassword: z.string().min(1, t("validation.confirmPasswordRequired")),
        })
        .refine((d) => d.password === d.confirmPassword, {
            message: t("validation.passwordsMismatch"),
            path: ["confirmPassword"],
        });

// ─── Main Component ───────────────────────────────────────────────────────────

export function RegisterForm() {
    const router = useRouter();
    const t = useTranslations("auth.register.form");

    // ── UI State ──────────────────────────────────────────────────────────────
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [dialCode, setDialCode] = useState("+20");

    // ── API Mutations ─────────────────────────────────────────────────────────
    const { mutate: register, isPending: isRegistering } = useRegister();

    // ── Schemas ───────────────────────────────────────────────────────────────
    const registerSchema = useMemo(() => buildRegisterSchema(t), [t]);

    // ── Forms ─────────────────────────────────────────────────────────────────
    const registerForm = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            gender: "MALE",
            password: "",
            confirmPassword: "",
        }
    });

    // ── Handlers ──────────────────────────────────────────────────────────────

    const onRegisterSubmit = (data: RegisterSchema) => {
        register(
            {
                ...data,
                phone: data.phone ? formatPhone(data.phone, dialCode) : undefined,
            },
            {
                onSuccess: () => {
                    toast.success(t("success"));
                    router.push("/login");
                },
                onError: (err: ApiError) => {
                    if (err.errors?.length) {
                        err.errors.forEach(({ path, message }) => {
                            registerForm.setError(
                                path as keyof RegisterSchema,
                                { type: "server", message }
                            );
                        });
                        toast.error(t("validation.fixErrors"));
                    } else {
                        toast.error(err.message || t("validation.registrationFailed"));
                    }
                },
            }
        );
    };

    return (
        <div className="w-full flex flex-col">
            <form
                onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                className="flex flex-col gap-5 lg:gap-6"
            >
                <div className="flex flex-col gap-2 lg:gap-3.5">
                    {/* First + Last name */}
                    <div className="flex w-full gap-3 lg:gap-5">
                        {(["firstName", "lastName"] as const).map((field) => (
                            <div key={field} className="flex flex-1 flex-col gap-1">
                                <Label
                                    htmlFor={field}
                                    className="text-xs lg:text-sm font-medium text-zinc-800 dark:text-zinc-300 font-inter"
                                >
                                    {t(`${field}Label`)}
                                </Label>
                                <Input
                                    id={field}
                                    type="text"
                                    placeholder={t(`${field}Placeholder`)}
                                    {...registerForm.register(field)}
                                    className={inputClass(!!registerForm.formState.errors[field])}
                                />
                                <FieldError message={registerForm.formState.errors[field]?.message} />
                            </div>
                        ))}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1">
                        <Label
                            htmlFor="email"
                            className="text-xs lg:text-sm font-medium text-zinc-800 dark:text-zinc-300 font-inter"
                        >
                            {t("emailLabel")}
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder={t("emailPlaceholder")}
                            {...registerForm.register("email")}
                            className={inputClass(!!registerForm.formState.errors.email)}
                        />
                        <FieldError message={registerForm.formState.errors.email?.message} />
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1">
                        <Label
                            htmlFor="phone"
                            className="text-xs lg:text-sm font-medium text-zinc-800 dark:text-zinc-300 font-inter"
                        >
                            {t("phoneLabel")}
                        </Label>
                        <Controller
                            name="phone"
                            control={registerForm.control}
                            render={({ field }) => (
                                <PhoneInput
                                    id="phone"
                                    value={field.value ?? ""}
                                    onChange={field.onChange}
                                    onDialCodeChange={setDialCode}
                                    onBlur={field.onBlur}
                                    placeholder={t("phonePlaceholder")}
                                    hasError={!!registerForm.formState.errors.phone}
                                />
                            )}
                        />
                        <FieldError message={registerForm.formState.errors.phone?.message} />
                    </div>

                    {/* Gender */}
                    <div className="flex flex-col gap-1">
                        <Label className="text-xs lg:text-sm font-medium text-zinc-800 dark:text-zinc-300 font-inter">
                            {t("genderLabel")}
                        </Label>
                        <Controller
                            name="gender"
                            control={registerForm.control}
                            render={({ field }) => (
                                <GenderSelect
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder={t("genderPlaceholder")}
                                    maleLabel={t("genderMale")}
                                    femaleLabel={t("genderFemale")}
                                    hasError={!!registerForm.formState.errors.gender}
                                />
                            )}
                        />
                    </div>

                    {/* Password + Confirm Password */}
                    {(
                        [
                            { name: "password", show: showPassword, toggle: () => setShowPassword((v) => !v) },
                            { name: "confirmPassword", show: showConfirmPassword, toggle: () => setShowConfirmPassword((v) => !v) },
                        ] as const
                    ).map(({ name, show, toggle }) => (
                        <div key={name} className="flex flex-col gap-1">
                            <Label
                                htmlFor={name}
                                className="text-xs lg:text-sm font-medium text-zinc-800 dark:text-zinc-300 font-inter"
                            >
                                {t(`${name}Label`)}
                            </Label>
                            <div className="relative">
                                <Input
                                    id={name}
                                    type={show ? "text" : "password"}
                                    placeholder={t(`${name}Placeholder`)}
                                    {...registerForm.register(name)}
                                    className={passwordInputClass(!!registerForm.formState.errors[name])}
                                />
                                <button
                                    type="button"
                                    onClick={toggle}
                                    className="absolute inset-e-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                                    aria-label={show ? t("hidePassword") : t("showPassword")}
                                >
                                    {show
                                        ? <Eye className="size-4 lg:size-5" />
                                        : <EyeOff className="size-4 lg:size-5" />
                                    }
                                </button>
                            </div>
                            <FieldError message={registerForm.formState.errors[name]?.message} />
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-4 lg:gap-5 mt-2">
                    <SubmitButton
                        isPending={isRegistering}
                        label={t("submit")}
                        loadingLabel={t("submitting")}
                    />
                    <LoginLink prompt={t("hasAccount")} label={t("login")} />
                </div>
            </form>
        </div>
    );
}