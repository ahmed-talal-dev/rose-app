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
import { RegisterSchema } from "../schemas";

// Get profile
export const useProfile = () =>
    useQuery({
        queryKey: ["profile"],
        queryFn: getProfile,
    });

// Register
export const useRegister = () =>
    useMutation({
        mutationFn: (data: RegisterSchema) => register(data),
    });

// Login
export const useLogin = () =>
    useMutation({
        mutationFn: async (data: { username: string; password: string }) => {
            const res = await signIn("credentials", { ...data, redirect: false });
            if (res?.error) throw new Error("Invalid email or password");
            return res;
        },
    });

// Logout
export const useLogout = () =>
    useMutation({
        mutationFn: () => signOut({ redirect: false }),
    });

// Check email
export const useCheckEmail = () =>
    useMutation({
        mutationFn: (email: string) => checkEmail(email),
    });

// Send verification
export const useSendVerification = () =>
    useMutation({
        mutationFn: ({ email, redirectUrl }: { email: string; redirectUrl?: string }) =>
            sendVerification(email, redirectUrl),
    });

// Verify email
export const useVerifyEmail = () =>
    useMutation({
        mutationFn: (data: { email: string; code: string }) => verifyEmail(data),
    });

// Forgot password
export const useForgotPassword = () =>
    useMutation({
        mutationFn: ({ email, redirectUrl }: { email: string; redirectUrl?: string }) =>
            forgotPassword(email, redirectUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/en/reset-password`),
    });

// Reset password
export const useResetPassword = () =>
    useMutation({
        mutationFn: (data: {
            token: string;
            newPassword: string;
            confirmPassword: string;
        }) => resetPassword(data),
    });

// Update profile
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: FormData | object) => updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });
};

// Change password
export const useChangePassword = () =>
    useMutation({
        mutationFn: (data: {
            currentPassword: string;
            newPassword: string;
            confirmPassword: string;
        }) => changePassword(data),
    });

// Delete account
export const useDeleteAccount = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteAccount,
        onSuccess: () => {
            queryClient.clear();
            signOut({ redirect: true, callbackUrl: "/login" });
        },
    });
};