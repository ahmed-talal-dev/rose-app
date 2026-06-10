"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import {
    Eye, EyeOff, Loader2, ChevronDown,
    Mail, ArrowLeft, CheckCircle2,
} from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Link } from "@/i18n/navigation";
import { PhoneInput } from "@/shared/ui/phone-input";
import { type RegisterSchema } from "../schemas";
import {
    useRegister,
    useSendVerification,
    useVerifyEmail,
} from "../hooks";

type Step = "email" | "verify" | "form";

interface GenderSelectProps {
    value?: "MALE" | "FEMALE";
    onChange: (val: "MALE" | "FEMALE") => void;
    placeholder: string;
    maleLabel: string;
    femaleLabel: string;
    hasError?: boolean;
}

function GenderSelect({
    value, onChange, placeholder, maleLabel, femaleLabel, hasError,
}: GenderSelectProps) {
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
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`
                    w-full h-10 lg:h-12.25 flex items-center justify-between
                    rounded-[10px] border px-4 text-sm font-inter transition-colors outline-none
                    ${open ? "border-primary-700 dark:border-[#FFA3B9] ring-2 ring-primary-700/20 dark:ring-[#FFA3B9]/20 bg-white dark:bg-[#3A3B3F]" : hasError ? "border-red-500 bg-white dark:bg-[#3A3B3F]" : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#3A3B3F]"}
                    ${selected ? "text-zinc-800 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-500"}
                `}
            >
                <span className="flex items-center gap-2">
                    {selected ? (
                        <><span className="text-base leading-none text-primary-700 dark:text-[#FFA3B9]">{selected.icon}</span>{selected.label}</>
                    ) : placeholder}
                </span>
                <ChevronDown className={`size-4 text-zinc-500 dark:text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="absolute top-full inset-s-0 mt-1.5 w-full bg-white dark:bg-[#3A3B3F] border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg z-200 p-1">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => { onChange(opt.value); setOpen(false); }}
                            className={`
                                w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-inter transition-colors text-start
                                ${value === opt.value ? "bg-primary-50 dark:bg-zinc-800 text-primary-700 dark:text-[#FFA3B9] font-medium" : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"}
                            `}
                        >
                            <span className="text-base leading-none text-primary-700 dark:text-[#FFA3B9]">{opt.icon}</span>
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

interface OtpInputProps {
    value: string;
    onChange: (val: string) => void;
    hasError?: boolean;
}

function OtpInput({ value, onChange, hasError }: OtpInputProps) {
    const inputs = useRef<(HTMLInputElement | null)[]>([]);
    const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

    const handleChange = (index: number, char: string) => {
        const digit = char.replace(/\D/g, "").slice(-1);
        const next = [...digits];
        next[index] = digit;
        onChange(next.join(""));
        if (digit && index < 5) inputs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !digits[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        onChange(pasted);
        const focusIndex = Math.min(pasted.length, 5);
        inputs.current[focusIndex]?.focus();
    };

    return (
        <div className="flex gap-2 lg:gap-3 justify-center" dir="ltr">
            {digits.map((digit, i) => (
                <input
                    key={i}
                    ref={(el) => { inputs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className={`
                        w-10 h-12 lg:w-12 lg:h-14 text-center text-lg font-semibold font-inter
                        rounded-[10px] border outline-none transition-all
                        ${hasError ? "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400" : digit ? "border-primary-600 dark:border-[#FFA3B9] bg-primary-50 dark:bg-zinc-800 text-primary-700 dark:text-[#FFA3B9]" : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#3A3B3F] text-zinc-800 dark:text-zinc-100"}
                        focus:border-primary-700 dark:focus:border-[#FFA3B9] focus:ring-2 focus:ring-primary-700/20 dark:focus:ring-[#FFA3B9]/20
                    `}
                />
            ))}
        </div>
    );
}

function StepIndicator({ step }: { step: Step }) {
    const steps: Step[] = ["email", "verify", "form"];
    const current = steps.indexOf(step);

    return (
        <div className="flex items-center gap-2 justify-center mb-6">
            {steps.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                    <div className={`
                        w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold font-inter transition-all
                        ${i < current ? "bg-primary-600 dark:bg-[#FFA3B9] text-white dark:text-[#212226]" : i === current ? "bg-primary-600 dark:bg-[#FFA3B9] text-white dark:text-[#212226] ring-4 ring-primary-100 dark:ring-[#FFA3B9]/20" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500"}
                    `}>
                        {i < current ? <CheckCircle2 className="size-4" /> : i + 1}
                    </div>
                    {i < 2 && (
                        <div className={`w-8 h-0.5 rounded-full transition-all ${i < current ? "bg-primary-600 dark:bg-[#FFA3B9]" : "bg-zinc-200 dark:bg-zinc-700"}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

export function RegisterForm() {
    const router = useRouter();
    const t = useTranslations("auth.register.form");

    const [step, setStep] = useState<Step>("email");
    const [verifiedEmail, setVerifiedEmail] = useState("");
    const [otpToken, setOtpToken] = useState("");
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { mutate: sendVerification, isPending: isSendingVerification } = useSendVerification();
    const { mutate: verifyEmail, isPending: isVerifying } = useVerifyEmail();
    const { mutate: register, isPending: isRegistering } = useRegister();

    const emailSchema = useMemo(() =>
        z.object({
            email: z.string().min(1, t("validation.emailRequired")).email(t("validation.emailInvalid")),
        }), [t]);

    const emailForm = useForm<{ email: string }>({
        resolver: zodResolver(emailSchema),
    });

    const registerSchema = useMemo(() =>
        z.object({
            firstName: z.string().min(1, t("validation.firstNameRequired")),
            lastName: z.string().min(1, t("validation.lastNameRequired")),
            username: z.string().min(3, t("validation.usernameMin")).max(30, t("validation.usernameMax")),
            phone: z.string().optional(),
            gender: z.enum(["MALE", "FEMALE"]).optional(),
            password: z
                .string()
                .min(8, t("validation.passwordMin"))
                .regex(/[A-Z]/, t("validation.passwordUppercase"))
                .regex(/[0-9]/, t("validation.passwordNumber"))
                .regex(/[!@#$%^&*]/, t("validation.passwordSpecial")),
            confirmPassword: z.string().min(1, t("validation.confirmPasswordRequired")),
        }).refine((d) => d.password === d.confirmPassword, {
            message: t("validation.passwordsMismatch"),
            path: ["confirmPassword"],
        }), [t]);

    const registerForm = useForm<Omit<RegisterSchema, "email">>({
        resolver: zodResolver(registerSchema),
    });

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const onEmailSubmit = (data: { email: string }) => {
        sendVerification(
            { email: data.email },
            {
                onSuccess: () => {
                    setVerifiedEmail(data.email);
                    setStep("verify");
                    setResendCooldown(60);
                    toast.success(t("verificationSent"));
                },
                onError: (err) => {
                    toast.error(err.message);
                },
            }
        );
    };

    const onVerifySubmit = () => {
        if (otp.length < 6) {
            setOtpError(t("validation.otpRequired"));
            return;
        }
        setOtpError("");
        verifyEmail({ email: verifiedEmail, code: otp }, {
            onSuccess: () => {
                setStep("form");
                toast.success(t("emailVerified"));
            },
            onError: (err) => {
                setOtpError(err.message || t("validation.otpInvalid"));
            },
        });
    };

    const onResend = () => {
        if (resendCooldown > 0) return;
        sendVerification(
            { email: verifiedEmail },
            {
                onSuccess: () => {
                    setResendCooldown(60);
                    setOtp("");
                    setOtpError("");
                    toast.success(t("verificationResent"));
                },
                onError: (err) => toast.error(err.message),
            }
        );
    };

    const onRegisterSubmit = (data: Omit<RegisterSchema, "email">) => {
        const { confirmPassword, ...rest } = data;
        register({ ...data, email: verifiedEmail, phone: data.phone ? `+2${data.phone}` : undefined, },
            {
                onSuccess: () => {
                    toast.success(t("success"));
                    router.push("/login");
                },
                onError: (err) => toast.error(err.message),
            }
        );
    };

    const inputClass = (hasError: boolean) =>
        `h-10 lg:h-[49px] rounded-[10px] bg-white dark:bg-[#3A3B3F] border-zinc-300 dark:border-zinc-700 px-4 text-sm font-inter text-zinc-800 dark:text-zinc-100 focus-visible:ring-1 focus-visible:ring-primary-700 dark:focus-visible:ring-[#FFA3B9] placeholder:text-zinc-400 dark:placeholder:text-zinc-500 ${hasError ? "border-red-500" : ""}`;

    const passwordInputClass = (hasError: boolean) =>
        `h-10 lg:h-[49px] rounded-[10px] bg-white dark:bg-[#3A3B3F] border-zinc-300 dark:border-zinc-700 px-4 pe-11 text-sm font-inter text-zinc-800 dark:text-zinc-100 focus-visible:ring-1 focus-visible:ring-primary-700 dark:focus-visible:ring-[#FFA3B9] placeholder:text-zinc-400 dark:placeholder:text-zinc-500 w-full [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden ${hasError ? "border-red-500" : ""}`;

    const isStep1Loading = isSendingVerification;

    return (
        <div className="w-full flex flex-col">
            <StepIndicator step={step} />

            {/* ── STEP 1: Email ── */}
            {step === "email" && (
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="flex flex-col gap-5 lg:gap-9">
                    <div className="flex flex-col gap-2 lg:gap-2.5">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="email" className="text-xs lg:text-sm font-medium text-zinc-800 dark:text-zinc-300 font-inter">
                                {t("emailLabel")}
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={t("emailPlaceholder")}
                                {...emailForm.register("email")}
                                className={inputClass(!!emailForm.formState.errors.email)}
                            />
                            {emailForm.formState.errors.email && (
                                <p className="text-xs text-red-600 dark:text-red-400 font-inter mt-0.5">
                                    {emailForm.formState.errors.email.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 lg:gap-5">
                        <button
                            type="submit"
                            disabled={isStep1Loading}
                            className="w-full h-10 lg:h-10.25 bg-primary-600 dark:bg-[#FFA3B9] hover:bg-primary-700 dark:hover:bg-[#ffbccc] text-white dark:text-[#212226] font-semibold text-sm lg:text-base rounded-[10px] transition-colors font-sarabun disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {isStep1Loading ? (
                                <><Loader2 className="size-4 animate-spin" />{t("submitting")}</>
                            ) : t("continue")}
                        </button>

                        <div className="flex flex-col items-center gap-4">
                            <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
                            <p className="text-xs lg:text-sm font-medium text-zinc-800 dark:text-zinc-300 font-sarabun">
                                {t("hasAccount")}{" "}
                                <Link href="/login" className="font-semibold text-primary-700 dark:text-[#FFA3B9] hover:underline font-sarabun transition-colors">
                                    {t("login")}
                                </Link>
                            </p>
                        </div>
                    </div>
                </form>
            )}

            {/* ── STEP 2: Verify Email ── */}
            {step === "verify" && (
                <div className="flex flex-col gap-5 lg:gap-9">
                    <div className="flex flex-col gap-5">
                        <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-[10px] border border-zinc-200 dark:border-zinc-700">
                            <Mail className="size-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                            <span className="text-sm text-zinc-600 dark:text-zinc-300 font-inter truncate">{verifiedEmail}</span>
                            <button
                                type="button"
                                onClick={() => { setStep("email"); setOtp(""); setOtpError(""); }}
                                className="ms-auto text-xs text-primary-700 dark:text-[#FFA3B9] hover:underline font-inter shrink-0 transition-colors"
                            >
                                {t("changeEmail")}
                            </button>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label className="text-xs lg:text-sm font-medium text-zinc-800 dark:text-zinc-300 font-inter text-center">
                                {t("otpLabel")}
                            </Label>
                            <OtpInput value={otp} onChange={setOtp} hasError={!!otpError} />
                            {otpError && (
                                <p className="text-xs text-red-600 dark:text-red-400 font-inter text-center mt-0.5">{otpError}</p>
                            )}
                        </div>

                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-inter text-center">
                            {t("didntReceive")}{" "}
                            <button
                                type="button"
                                onClick={onResend}
                                disabled={resendCooldown > 0 || isSendingVerification}
                                className="font-semibold text-primary-700 dark:text-[#FFA3B9] hover:underline disabled:opacity-50 disabled:no-underline transition-colors"
                            >
                                {resendCooldown > 0 ? `${t("resendIn")} ${resendCooldown}s` : t("resend")}
                            </button>
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={onVerifySubmit}
                            disabled={isVerifying || otp.length < 6}
                            className="w-full h-10 lg:h-10.25 bg-primary-600 dark:bg-[#FFA3B9] hover:bg-primary-700 dark:hover:bg-[#ffbccc] text-white dark:text-[#212226] font-semibold text-sm lg:text-base rounded-[10px] transition-colors font-sarabun disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {isVerifying ? (
                                <><Loader2 className="size-4 animate-spin" />{t("submitting")}</>
                            ) : t("verifyEmail")}
                        </button>

                        <button
                            type="button"
                            onClick={() => { setStep("email"); setOtp(""); setOtpError(""); }}
                            className="flex items-center justify-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 font-inter transition-colors"
                        >
                            <ArrowLeft className="size-4" />
                            {t("back")}
                        </button>
                    </div>
                </div>
            )}

            {/* ── STEP 3: Register Form ── */}
            {step === "form" && (
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="flex flex-col gap-5 lg:gap-9">
                    <div className="flex flex-col gap-2 lg:gap-2.5">

                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-[10px] border border-green-200 dark:border-green-900/50">
                            <CheckCircle2 className="size-4 text-green-600 dark:text-green-400 shrink-0" />
                            <span className="text-sm text-green-700 dark:text-green-400 font-inter truncate">{verifiedEmail}</span>
                        </div>

                        <div className="flex w-full gap-3 lg:gap-5">
                            <div className="flex flex-1 flex-col gap-1">
                                <Label htmlFor="firstName" className="text-xs lg:text-sm font-medium text-zinc-800 dark:text-zinc-300 font-inter">
                                    {t("firstNameLabel")}
                                </Label>
                                <Input
                                    id="firstName"
                                    type="text"
                                    placeholder={t("firstNamePlaceholder")}
                                    {...registerForm.register("firstName")}
                                    className={inputClass(!!registerForm.formState.errors.firstName)}
                                />
                                {registerForm.formState.errors.firstName && (
                                    <p className="text-xs text-red-600 dark:text-red-400 font-inter mt-0.5">{registerForm.formState.errors.firstName.message}</p>
                                )}
                            </div>
                            <div className="flex flex-1 flex-col gap-1">
                                <Label htmlFor="lastName" className="text-xs lg:text-sm font-medium text-zinc-800 dark:text-zinc-300 font-inter">
                                    {t("lastNameLabel")}
                                </Label>
                                <Input
                                    id="lastName"
                                    type="text"
                                    placeholder={t("lastNamePlaceholder")}
                                    {...registerForm.register("lastName")}
                                    className={inputClass(!!registerForm.formState.errors.lastName)}
                                />
                                {registerForm.formState.errors.lastName && (
                                    <p className="text-xs text-red-600 dark:text-red-400 font-inter mt-0.5">{registerForm.formState.errors.lastName.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="username" className="text-xs lg:text-sm font-medium text-zinc-800 dark:text-zinc-300 font-inter">
                                {t("usernameLabel")}
                            </Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder={t("usernamePlaceholder")}
                                {...registerForm.register("username")}
                                className={inputClass(!!registerForm.formState.errors.username)}
                            />
                            {registerForm.formState.errors.username && (
                                <p className="text-xs text-red-600 dark:text-red-400 font-inter mt-0.5">{registerForm.formState.errors.username.message}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="phone" className="text-xs lg:text-sm font-medium text-zinc-800 dark:text-zinc-300 font-inter">
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
                                        onBlur={field.onBlur}
                                        placeholder={t("phonePlaceholder")}
                                        hasError={!!registerForm.formState.errors.phone}
                                    />
                                )}
                            />
                            {registerForm.formState.errors.phone && (
                                <p className="text-xs text-red-600 dark:text-red-400 font-inter mt-0.5">{registerForm.formState.errors.phone.message}</p>
                            )}
                        </div>

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

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="password" className="text-xs lg:text-sm font-medium text-zinc-800 dark:text-zinc-300 font-inter">
                                {t("passwordLabel")}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t("passwordPlaceholder")}
                                    {...registerForm.register("password")}
                                    className={passwordInputClass(!!registerForm.formState.errors.password)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-e-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                                >
                                    {showPassword ? <Eye className="size-4 lg:size-5" /> : <EyeOff className="size-4 lg:size-5" />}
                                </button>
                            </div>
                            {registerForm.formState.errors.password && (
                                <p className="text-xs text-red-600 dark:text-red-400 font-inter mt-0.5">{registerForm.formState.errors.password.message}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="confirmPassword" className="text-xs lg:text-sm font-medium text-zinc-800 dark:text-zinc-300 font-inter">
                                {t("confirmPasswordLabel")}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder={t("confirmPasswordPlaceholder")}
                                    {...registerForm.register("confirmPassword")}
                                    className={passwordInputClass(!!registerForm.formState.errors.confirmPassword)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-e-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                                >
                                    {showConfirmPassword ? <Eye className="size-4 lg:size-5" /> : <EyeOff className="size-4 lg:size-5" />}
                                </button>
                            </div>
                            {registerForm.formState.errors.confirmPassword && (
                                <p className="text-xs text-red-600 dark:text-red-400 font-inter mt-0.5">{registerForm.formState.errors.confirmPassword.message}</p>
                            )}
                        </div>

                    </div>

                    <div className="flex flex-col gap-4 lg:gap-5">
                        <button
                            type="submit"
                            disabled={isRegistering}
                            className="w-full h-10 lg:h-10.25 bg-primary-600 dark:bg-[#FFA3B9] hover:bg-primary-700 dark:hover:bg-[#ffbccc] text-white dark:text-[#212226] font-semibold text-sm lg:text-base rounded-[10px] transition-colors font-sarabun disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {isRegistering ? (
                                <><Loader2 className="size-4 animate-spin" />{t("submitting")}</>
                            ) : t("submit")}
                        </button>

                        <div className="flex flex-col items-center gap-4">
                            <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
                            <p className="text-xs lg:text-sm font-medium text-zinc-800 dark:text-zinc-300 font-sarabun">
                                {t("hasAccount")}{" "}
                                <Link href="/login" className="font-semibold text-primary-700 dark:text-[#FFA3B9] hover:underline font-sarabun transition-colors">
                                    {t("login")}
                                </Link>
                            </p>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}