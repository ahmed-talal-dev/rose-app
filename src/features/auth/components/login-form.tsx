"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { Link } from "@/i18n/navigation";
import { loginSchema, type LoginSchema } from "../schemas";
import { useLogin } from "../hooks";

export function LoginForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const { mutate: login, isPending } = useLogin();

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
                toast.success("Logged in successfully!");
                router.push("/");
            },
            onError: (error) => {
                toast.error(error.message || "Invalid email or password");
            },
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-9 w-full">
            {/* Fields */}
            <div className="flex flex-col gap-4 w-full">
                {/* Inputs */}
                <div className="flex flex-col gap-4 w-full">
                    {/* Email */}
                    <div className="flex flex-col gap-1.5 w-full">
                        <Label htmlFor="email" className="text-sm font-medium text-zinc-800">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="user@example.com"
                            {...register("email")}
                            className={`h-[49px] rounded-[10px] border-zinc-300 px-4 text-sm ${errors.email ? "border-red-500" : ""
                                }`}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5 w-full">
                        <Label htmlFor="password" className="text-sm font-medium text-zinc-800">
                            Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...register("password")}
                                className={`h-[49px] rounded-[10px] border-zinc-300 px-4 pr-10 text-sm ${errors.password ? "border-red-500" : ""
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="size-5" />
                                ) : (
                                    <Eye className="size-5" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-red-600">{errors.password.message}</p>
                        )}
                    </div>
                </div>

                {/* Forgot password */}
                <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-right text-[#741C21] hover:underline font-[var(--font-sarabun)] w-full"
                >
                    Forgot your password?
                </Link>

                {/* Remember me */}
                <div className="flex items-center gap-2.5 pt-5">
                    <Checkbox
                        id="remember"
                        className="size-5 rounded-[8px] border-[#741C21]"
                    />
                    <Label
                        htmlFor="remember"
                        className="text-sm font-normal text-zinc-800 cursor-pointer"
                    >
                        Remember me
                    </Label>
                </div>
            </div>

            {/* Button */}
            <div className="flex flex-col gap-5 w-full">
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-[41px] bg-[#A6252A] hover:bg-[#741C21] text-white font-medium text-base rounded-[10px] transition-colors font-[var(--font-sarabun)] disabled:opacity-70 flex items-center justify-center gap-2"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            Logging in...
                        </>
                    ) : (
                        "Login"
                    )}
                </button>

                {/* Create Account */}
                <div className="flex flex-col items-center gap-5 w-full">
                    <div className="w-full border-t border-zinc-200" />
                    <p className="text-sm font-medium text-zinc-800 font-[var(--font-sarabun)]">
                        Don&apos;t have an account yet?{" "}
                        <Link
                            href="/register"
                            className="text-[#741C21] hover:underline font-semibold"
                        >
                            Create one now!
                        </Link>
                    </p>
                </div>
            </div>
        </form>
    );
}