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
export const forgotPassword = async (email: string, redirectUrl?: string): Promise<string> => {
    await fetchClient<void>("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
    });
    return email;
};

export async function resetPassword(
  email: string,
  token: string,
  newPassword: string
): Promise<void> {
  await fetchClient<void>("/api/auth/verifyResetCode", {
    method: "POST",
    body: JSON.stringify({ resetCode: token }),
  });

  await fetchClient<void>("/api/auth/resetPassword", {
    method: "PUT",
    body: JSON.stringify({ email, newPassword }),
  });
}

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