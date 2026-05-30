export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";
export type Gender = "MALE" | "FEMALE";

export type User = {
    id: string;
    username: string;
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
    gender?: Gender;
    photo?: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
};