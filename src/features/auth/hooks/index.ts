// ─── Auth Hooks ───────────────────────────────────────────────────────────────
// React Query mutations and queries for all auth operations.
// All mutations expose the ApiError type for typed error handling in components.
// ─────────────────────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { signIn, signOut } from "next-auth/react";
import {
    checkEmail,
    sendVerification,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount,
    register,
} from "../apis";
import { type RegisterSchema } from "../schemas";
import { ApiError } from "@/shared/lib/apis/api-error";

// Re-export ApiError so components can import it from one place
export { ApiError };

// ── Query Keys ────────────────────────────────────────────────────────────────

export const authKeys = {
    profile: ["profile"] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

export const useProfile = () =>
    useQuery({
        queryKey: authKeys.profile,
        queryFn: getProfile,
    });

// ── Mutations ─────────────────────────────────────────────────────────────────

export const useRegister = () =>
    useMutation<unknown, ApiError, RegisterSchema>({
        mutationFn: (data) => register(data),
    });

export const useLogin = () =>
    useMutation({
        mutationFn: async (data: { email: string; password: string }) => {
            const res = await signIn("credentials", { ...data, redirect: false });
            if (res?.error) throw new Error("Invalid email or password");
            return res;
        },
    });

export const useLogout = () =>
    useMutation({
        mutationFn: () => signOut({ redirect: false }),
    });

export const useCheckEmail = () =>
    useMutation<unknown, ApiError, string>({
        mutationFn: (email) => checkEmail(email),
    });

export const useSendVerification = () =>
    useMutation<unknown, ApiError, { email: string; redirectUrl?: string }>({
        mutationFn: ({ email, redirectUrl }) => sendVerification(email, redirectUrl),
    });

export const useVerifyEmail = () =>
    useMutation<unknown, ApiError, { email: string; code: string }>({
        mutationFn: (data) => verifyEmail(data),
    });

export const useForgotPassword = () =>
    useMutation<unknown, ApiError, { email: string; redirectUrl?: string }>({
        mutationFn: ({ email, redirectUrl }) =>
            forgotPassword(
                email,
                redirectUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/en/reset-password`
            ),
    });

export const useResetPassword = () =>
    useMutation<
        unknown,
        ApiError,
        { token: string; newPassword: string; confirmPassword: string }
    >({
        mutationFn: (data) => resetPassword(data),
    });

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation<unknown, ApiError, FormData | object>({
        mutationFn: (data) => updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: authKeys.profile });
        },
    });
};

export const useChangePassword = () =>
    useMutation<
        unknown,
        ApiError,
        { currentPassword: string; newPassword: string; confirmPassword: string }
    >({
        mutationFn: (data) => changePassword(data),
    });

export const useDeleteAccount = () => {
    const queryClient = useQueryClient();
    return useMutation<unknown, ApiError, void>({
        mutationFn: deleteAccount,
        onSuccess: () => {
            queryClient.clear();
            signOut({ redirect: true, callbackUrl: "/login" });
        },
    });
};