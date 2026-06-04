import { fetchClient } from "@/shared/lib/apis/fetch.client";
import { User } from "@/shared/types/user.d";
import { RegisterSchema } from "../schemas";

// Register
export const register = (data: RegisterSchema) =>
    fetchClient<{ user: User; token: string }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
    });

// Check email
export const checkEmail = (email: string) =>
    fetchClient<{ exists: boolean }>("/api/auth/check-email", {
        method: "POST",
        body: JSON.stringify({ email }),
    });

export const sendVerification = (email: string, redirectUrl?: string) =>
    fetchClient<null>("/api/auth/send-email-verification", {
        method: "POST",
        body: JSON.stringify({ email, redirectUrl }),
    });

export const verifyEmail = (data: { email: string; code: string }) =>
    fetchClient<null>("/api/auth/confirm-email-verification", {
        method: "POST",
        body: JSON.stringify(data),
    });
// Forgot password
export const forgotPassword = (email: string, redirectUrl?: string) =>
    fetchClient<null>("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({
            email,
            redirectUrl: redirectUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/en/reset-password`,
        }),
    });

// Reset password
export const resetPassword = (data: {
    token: string;
    newPassword: string;
    confirmPassword: string;
}) =>
    fetchClient<null>("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(data),
    });

// Get profile
export const getProfile = () =>
    fetchClient<User>("/api/users/profile");

// Update profile
export const updateProfile = (data: FormData | object) =>
    fetchClient<User>("/api/users/profile", {
        method: "PATCH",
        body: data instanceof FormData ? data : JSON.stringify(data),
    });

// Change password
export const changePassword = (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}) =>
    fetchClient<null>("/api/users/change-password", {
        method: "POST",
        body: JSON.stringify(data),
    });

// Delete account
export const deleteAccount = () =>
    fetchClient<null>("/api/users/account", { method: "DELETE" });