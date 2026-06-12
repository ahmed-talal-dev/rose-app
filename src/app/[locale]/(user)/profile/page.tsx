"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
    useProfile,
    useUpdateProfile,
    useChangePassword,
    useDeleteAccount,
    useLogout,
} from "@/features/auth/hooks";
import { PhoneInput, COUNTRIES } from "@/shared/ui/phone-input";
import {
    User,
    Lock,
    LogOut,
    UploadCloud,
    Loader2,
    Eye,
    EyeOff,
    Trash2,
    X,
    ChevronDown,
} from "lucide-react";
import Image from "next/image";

export default function AccountSettingsPage() {
    const locale = useLocale();
    const router = useRouter();
    const t = useTranslations("profile");
    const tCommon = useTranslations("common");
    const { status, data: session } = useSession();

    const { data: profileData, isLoading: isProfileLoading } = useProfile();
    const updateProfileMutation = useUpdateProfile();
    const changePasswordMutation = useChangePassword();
    const deleteAccountMutation = useDeleteAccount();
    const logoutMutation = useLogout();

    const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [phoneDialCode, setPhoneDialCode] = useState("+20");
    const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (profileData) {
            setFirstName(profileData.firstName || "");
            setLastName(profileData.lastName || "");
            setEmail(profileData.email || "");
            setGender(profileData.gender === "FEMALE" ? "FEMALE" : "MALE");

            // Parse phone: extract dial code and number
            const rawPhone = profileData.phone || "";
            const matchedCountry = COUNTRIES.find((c) => rawPhone.startsWith(c.dialCode));
            if (matchedCountry) {
                setPhoneDialCode(matchedCountry.dialCode);
                setPhone(rawPhone.slice(matchedCountry.dialCode.length));
            } else {
                setPhone(rawPhone);
            }
        }
    }, [profileData]);

    if (status === "loading" || isProfileLoading) {
        return (
            <div className="mx-auto max-w-[1280px] px-4 py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-[40px] h-[40px] animate-spin text-[#A6252A]" />
                <span className="text-zinc-500 dark:text-zinc-400 font-sarabun text-[14px]">
                    {tCommon ? tCommon("loading") : "Loading..."}
                </span>
            </div>
        );
    }

    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://rose-app.elevate-bootcamp.cloud";
    const resolveImageUrl = (url?: string) => {
        if (!url) return null;
        return url.startsWith("http") ? url : `${BASE_URL}${url}`;
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(t("uploadError") || "File too large");
                return;
            }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (activeTab === "profile") {
            if (!firstName.trim() || !lastName.trim() || !phone.trim() || !email.trim()) {
                toast.error(t("fillError") || "Fill required fields");
                return;
            }

            const toastId = toast.loading(locale === "ar" ? "جاري حفظ التغييرات..." : "Saving changes...");

            // Send JSON when no photo, FormData when there's a photo
            const fullPhone = phone.trim() ? `${phoneDialCode}${phone.trim()}` : "";
            const payload = selectedFile
                ? (() => {
                    const formData = new FormData();
                    formData.append("firstName", firstName.trim());
                    formData.append("lastName", lastName.trim());
                    formData.append("phone", fullPhone);
                    formData.append("photo", selectedFile);
                    return formData;
                })()
                : {
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    phone: fullPhone,
                };

            updateProfileMutation.mutate(payload, {
                onSuccess: () => {
                    toast.dismiss(toastId);
                    toast.success(t("updateSuccess") || "Updated successfully");
                    setSelectedFile(null);
                },
                onError: (err: any) => {
                    toast.dismiss(toastId);
                    toast.error(err.message || "Failed to update profile");
                },
            });
        } else {
            if (!currentPassword || !newPassword || !confirmPassword) {
                toast.error(t("fillError") || "Fill required fields");
                return;
            }
            if (newPassword !== confirmPassword) {
                toast.error(t("passwordMatchError") || "Passwords don't match");
                return;
            }

            const toastId = toast.loading(locale === "ar" ? "جاري تغيير كلمة المرور..." : "Changing password...");

            changePasswordMutation.mutate(
                {
                    currentPassword,
                    newPassword,
                    confirmPassword,
                },
                {
                    onSuccess: () => {
                        toast.dismiss(toastId);
                        toast.success(t("passwordSuccess") || "Password changed");
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                    },
                    onError: (err: any) => {
                        toast.dismiss(toastId);
                        toast.error(err.message || "Failed to change password");
                    },
                }
            );
        }
    };

    const handleDeleteAccount = () => {
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        setIsDeleteModalOpen(false);
        const toastId = toast.loading(locale === "ar" ? "جاري حذف الحساب..." : "Deleting account...");
        deleteAccountMutation.mutate(undefined, {
            onSuccess: () => {
                toast.dismiss(toastId);
                toast.success(locale === "ar" ? "تم حذف الحساب بنجاح" : "Account deleted successfully");
                router.push("/login");
            },
            onError: (err: any) => {
                toast.dismiss(toastId);
                toast.error(err.message || "Failed to delete account");
            },
        });
    };

    const handleLogout = () => {
        const toastId = toast.loading(locale === "ar" ? "جاري تسجيل الخروج..." : "Logging out...");
        logoutMutation.mutate(undefined, {
            onSuccess: () => {
                toast.dismiss(toastId);
                router.push("/login");
            },
            onError: (err: any) => {
                toast.dismiss(toastId);
                toast.error(err.message || "Logout failed");
            },
        });
    };

    const currentPhotoUrl = previewUrl || resolveImageUrl(profileData?.photo) || "/images/jake-miller.png";

    return (
        <div className="flex flex-col items-start p-0 gap-[36px] w-full lg:w-[1280px] mx-auto mt-[40px] mb-[64px] font-sarabun px-4 lg:px-0">

            <h1 className="w-full lg:w-[371px] h-[48px] font-sarabun font-bold text-[48px] leading-none text-[#27272A] dark:text-zinc-100 m-0 shrink-0">
                {t("title") || "Account Settings"}
            </h1>

            <div className="flex flex-col lg:flex-row items-start p-0 gap-[36px] w-full lg:w-[1280px] min-h-[720px] shrink-0">

                <div className="box-border flex flex-col items-start p-[16px] gap-[10px] w-full lg:w-[299px] lg:h-[720px] bg-[#FAFAFA] dark:bg-zinc-900 border border-[#F4F4F5] dark:border-zinc-800 rounded-[16px] shrink-0">

                    <div className="flex flex-col items-start p-0 gap-[10px] w-full lg:w-[267px] flex-grow">
                        <button
                            type="button"
                            onClick={() => setActiveTab("profile")}
                            className={`flex flex-row items-center p-[12px_16px] gap-[10px] w-full h-[48px] rounded-[8px] transition-colors cursor-pointer border-none outline-none shrink-0 ${activeTab === "profile"
                                    ? "bg-[#27272A] dark:bg-zinc-800"
                                    : "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                                }`}
                        >
                            <User className={`w-[24px] h-[24px] shrink-0 ${activeTab === "profile" ? "text-[#FAFAFA]" : "text-[#27272A] dark:text-zinc-300"}`} strokeWidth={1.5} />
                            <span className={`font-sarabun font-medium text-[16px] leading-none ${activeTab === "profile" ? "text-[#FAFAFA]" : "text-[#27272A] dark:text-zinc-300"}`}>
                                {t("tabProfile") || "Profile"}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("password")}
                            className={`flex flex-row items-center p-[12px_16px] gap-[10px] w-full h-[48px] rounded-[8px] transition-colors cursor-pointer border-none outline-none shrink-0 ${activeTab === "password"
                                    ? "bg-[#27272A] dark:bg-zinc-800"
                                    : "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                                }`}
                        >
                            <Lock className={`w-[24px] h-[24px] shrink-0 ${activeTab === "password" ? "text-[#FAFAFA]" : "text-[#27272A] dark:text-zinc-300"}`} strokeWidth={1.5} />
                            <span className={`font-sarabun font-medium text-[16px] leading-none ${activeTab === "password" ? "text-[#FAFAFA]" : "text-[#27272A] dark:text-zinc-300"}`}>
                                {t("tabPassword") || "Change Password"}
                            </span>
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex flex-row items-center p-[12px_16px] gap-[10px] w-full lg:w-[267px] h-[44px] bg-[#F4F4F5] dark:bg-zinc-800 hover:opacity-80 rounded-[8px] transition-opacity cursor-pointer border-none outline-none shrink-0 mt-auto"
                    >
                        <LogOut className="w-[20px] h-[20px] text-[#CD2E33] rtl:rotate-180 shrink-0" strokeWidth={1.5} />
                        <span className="font-sarabun font-medium text-[16px] leading-none text-[#CD2E33]">
                            {t("tabLogout") || "Logout"}
                        </span>
                    </button>
                </div>

                <div className="flex flex-col items-start p-0 gap-[16px] w-full lg:w-[945px] shrink-0">

                    {activeTab === "profile" ? (
                        <>
                            <div className="flex flex-row items-center p-0 gap-[16px] w-full lg:w-[945px] h-[120px] shrink-0">
                                <div className="box-border w-[120px] h-[120px] bg-zinc-50 border border-[#E4E4E7] dark:border-zinc-700 rounded-full shrink-0 relative isolate">
                                    <Image
                                        src={currentPhotoUrl}
                                        alt="Profile Photo"
                                        fill
                                        className="object-cover rounded-full"
                                        unoptimized={currentPhotoUrl.startsWith("data:")}
                                    />
                                    <button
                                        type="button"
                                        onClick={triggerFileSelect}
                                        className="box-border flex flex-row justify-center items-center p-0 gap-[10px] absolute w-[34px] h-[34px] right-[1px] rtl:right-auto rtl:left-[1px] bottom-0 bg-[#FAFAFA] dark:bg-zinc-800 border border-[#E4E4E7] dark:border-zinc-600 rounded-full cursor-pointer z-10 outline-none transition-transform hover:scale-105"
                                    >
                                        <UploadCloud className="w-[20px] h-[20px] text-[#27272A] dark:text-zinc-300 shrink-0" strokeWidth={1.5} />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handlePhotoChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>

                                <div className="flex flex-col items-start p-0 gap-[16px] w-full max-w-[432px] h-[68px] shrink-0">
                                    <span className="w-[121px] h-[20px] font-sarabun font-semibold text-[20px] leading-none text-[#27272A] dark:text-zinc-100 whitespace-nowrap">
                                        {t("uploadPhoto") || "Upload Photo"}
                                    </span>
                                    <span className="w-full lg:w-[432px] h-[32px] font-sarabun font-normal text-[16px] leading-none text-[#71717A] dark:text-zinc-400">
                                        {t("uploadPhotoInfo") || "You can upload a .jpg, .png, or .gif photo with max size of 5MB."}
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col items-start p-0 gap-[10px] w-full lg:w-[945px] shrink-0">

                                <div className="flex flex-col md:flex-row items-start p-0 gap-[20px] w-full lg:w-[945px] lg:h-[72px] shrink-0">
                                    <div className="flex flex-col items-start p-0 gap-[6px] w-full lg:w-[462.5px] h-[72px] bg-white dark:bg-zinc-950 shrink-0">
                                        <label className="w-[71px] h-[17px] font-inter font-medium text-[14px] leading-[17px] text-[#27272A] dark:text-zinc-300 whitespace-nowrap">
                                            {t("firstName") || "First name"}
                                        </label>
                                        <div className="box-border flex flex-row items-center p-[16px] gap-[8px] w-full lg:w-[462.5px] h-[49px] border border-[#D4D4D8] dark:border-zinc-700 rounded-[10px] focus-within:border-[#A6252A] transition-colors shrink-0">
                                            <input
                                                type="text"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className="w-full bg-transparent border-none outline-none font-inter font-normal text-[14px] leading-[17px] text-[#27272A] dark:text-zinc-100 placeholder-[#A1A1AA]"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-start p-0 gap-[6px] w-full lg:w-[462.5px] h-[72px] bg-white dark:bg-zinc-950 shrink-0">
                                        <label className="w-[70px] h-[17px] font-inter font-medium text-[14px] leading-[17px] text-[#27272A] dark:text-zinc-300 whitespace-nowrap">
                                            {t("lastName") || "Last name"}
                                        </label>
                                        <div className="box-border flex flex-row items-center p-[16px] gap-[8px] w-full lg:w-[462.5px] h-[49px] border border-[#D4D4D8] dark:border-zinc-700 rounded-[10px] focus-within:border-[#A6252A] transition-colors shrink-0">
                                            <input
                                                type="text"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                className="w-full bg-transparent border-none outline-none font-inter font-normal text-[14px] leading-[17px] text-[#27272A] dark:text-zinc-100 placeholder-[#A1A1AA]"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Email Field */}
                                <div className="flex flex-col items-start p-0 gap-[6px] w-full lg:w-[945px] h-[72px] bg-white dark:bg-zinc-950 shrink-0 mt-[6px]">
                                    <label className="h-[17px] font-inter font-medium text-[14px] leading-[17px] text-[#27272A] dark:text-zinc-300">
                                        {t("email") || "Email"}
                                    </label>
                                    <div className="box-border flex flex-row items-center p-[16px] gap-[8px] w-full lg:w-[945px] h-[49px] border border-[#D4D4D8] dark:border-zinc-700 rounded-[10px] focus-within:border-[#A6252A] transition-colors shrink-0">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="example@email.com"
                                            className="w-full bg-transparent border-none outline-none font-inter font-normal text-[14px] leading-[17px] text-[#27272A] dark:text-zinc-100 placeholder-[#A1A1AA]"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col items-start p-0 gap-[6px] w-full lg:w-[945px] h-[76px] shrink-0 mt-[6px]">
                                    <label className="h-[17px] font-inter font-medium text-[14px] leading-[17px] text-[#27272A] dark:text-zinc-300 whitespace-nowrap">
                                        {t("phone") || "Phone"}
                                    </label>
                                    <div className="w-full lg:w-[945px] h-[53px]">
                                        <PhoneInput
                                            value={phone}
                                            onChange={(val) => setPhone(val || "")}
                                            onDialCodeChange={(code) => setPhoneDialCode(code)}
                                            placeholder="1012345678"
                                            className="box-border flex flex-row items-center w-full h-[53px] bg-white dark:bg-zinc-950 border border-[#D4D4D8] dark:border-zinc-700 rounded-[10px] focus-within:border-[#A6252A] transition-colors font-inter"
                                        />
                                    </div>
                                </div>

                                {/* Gender Field */}
                                <div className="flex flex-col items-start p-0 gap-[6px] w-full lg:w-[945px] h-[72px] bg-white dark:bg-zinc-950 shrink-0 mt-[6px]">
                                    <label className="h-[17px] font-inter font-medium text-[14px] leading-[17px] text-[#27272A] dark:text-zinc-300">
                                        {t("gender") || "Gender"}
                                    </label>
                                    <div className="box-border flex flex-row items-center p-[16px] gap-[8px] w-full lg:w-[945px] h-[49px] bg-transparent border border-[#D4D4D8] dark:border-zinc-700 rounded-[10px] focus-within:border-[#A6252A] transition-colors shrink-0">
                                        <select
                                            value={gender}
                                            onChange={(e) => setGender(e.target.value as "MALE" | "FEMALE")}
                                            className="flex-grow bg-transparent border-none outline-none font-inter font-normal text-[14px] leading-[17px] text-[#27272A] dark:text-zinc-100 cursor-pointer appearance-none"
                                        >
                                            <option value="MALE" className="dark:bg-zinc-900">{t("male") || "Male"}</option>
                                            <option value="FEMALE" className="dark:bg-zinc-900">{t("female") || "Female"}</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row justify-between items-center pt-[60px] pb-0 px-0 gap-[10px] w-full lg:w-[945px] h-auto sm:h-[104px] shrink-0">
                                    <button
                                        type="button"
                                        onClick={handleDeleteAccount}
                                        className="w-[132px] h-[16px] font-sarabun font-medium text-[16px] leading-none text-[#CD2E33] bg-transparent border-none outline-none cursor-pointer hover:underline p-0 m-0 shrink-0"
                                    >
                                        {t("deleteAccount") || "Delete My Account"}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updateProfileMutation.isPending}
                                        className="flex flex-row justify-center items-center p-[14px_16px] gap-[10px] w-full sm:w-[228px] h-[44px] bg-[#A6252A] rounded-[10px] hover:opacity-90 transition-opacity border-none outline-none cursor-pointer shrink-0 disabled:opacity-50 mt-6 sm:mt-0"
                                    >
                                        {updateProfileMutation.isPending ? (
                                            <Loader2 className="w-[20px] h-[20px] animate-spin text-white shrink-0" />
                                        ) : (
                                            <span className="w-[97px] h-[16px] font-sarabun font-medium text-[16px] leading-none text-white whitespace-nowrap">
                                                {t("saveChanges") || "Save Changes"}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col items-start p-0 gap-[24px] w-full lg:w-[945px] shrink-0">

                            {/* Old Password */}
                            <div className="flex flex-col items-start p-0 gap-[6px] w-full lg:w-[945px] shrink-0">
                                <label className="font-inter font-medium text-[14px] leading-[17px] text-[#27272A] dark:text-zinc-300">
                                    {t("currentPassword") || "Old Password"}
                                </label>
                                <div className="box-border flex flex-row items-center p-[16px] gap-[8px] w-full lg:w-[945px] h-[49px] border border-[#D4D4D8] dark:border-zinc-700 rounded-[10px] focus-within:border-[#A6252A] transition-colors shrink-0 bg-transparent">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="********"
                                        className="w-full bg-transparent border-none outline-none font-inter font-normal text-[14px] leading-[17px] text-[#27272A] dark:text-zinc-100 placeholder-[#A1A1AA]"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="text-[#A1A1AA] hover:text-[#27272A] focus:outline-none cursor-pointer border-none bg-transparent flex items-center justify-center p-0 shrink-0 outline-none"
                                    >
                                        {showCurrentPassword ? <Eye className="w-[18px] h-[18px]" strokeWidth={1.5} /> : <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.5} />}
                                    </button>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="w-full lg:w-[945px] border-t border-[#E4E4E7] dark:border-zinc-800 shrink-0 my-1" />

                            {/* New Password */}
                            <div className="flex flex-col items-start p-0 gap-[6px] w-full lg:w-[945px] shrink-0">
                                <label className="font-inter font-medium text-[14px] leading-[17px] text-[#27272A] dark:text-zinc-300">
                                    {t("newPassword") || "New Password"}
                                </label>
                                <div className="box-border flex flex-row items-center p-[16px] gap-[8px] w-full lg:w-[945px] h-[49px] border border-[#D4D4D8] dark:border-zinc-700 rounded-[10px] focus-within:border-[#A6252A] transition-colors shrink-0 bg-transparent">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="********"
                                        className="w-full bg-transparent border-none outline-none font-inter font-normal text-[14px] leading-[17px] text-[#27272A] dark:text-zinc-100 placeholder-[#A1A1AA]"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="text-[#A1A1AA] hover:text-[#27272A] focus:outline-none cursor-pointer border-none bg-transparent flex items-center justify-center p-0 shrink-0 outline-none"
                                    >
                                        {showNewPassword ? <Eye className="w-[18px] h-[18px]" strokeWidth={1.5} /> : <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.5} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm New Password */}
                            <div className="flex flex-col items-start p-0 gap-[6px] w-full lg:w-[945px] shrink-0">
                                <label className="font-inter font-medium text-[14px] leading-[17px] text-[#27272A] dark:text-zinc-300">
                                    {t("confirmPassword") || "Confirm New Password"}
                                </label>
                                <div className="box-border flex flex-row items-center p-[16px] gap-[8px] w-full lg:w-[945px] h-[49px] border border-[#D4D4D8] dark:border-zinc-700 rounded-[10px] focus-within:border-[#A6252A] transition-colors shrink-0 bg-transparent">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="********"
                                        className="w-full bg-transparent border-none outline-none font-inter font-normal text-[14px] leading-[17px] text-[#27272A] dark:text-zinc-100 placeholder-[#A1A1AA]"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="text-[#A1A1AA] hover:text-[#27272A] focus:outline-none cursor-pointer border-none bg-transparent flex items-center justify-center p-0 shrink-0 outline-none"
                                    >
                                        {showConfirmPassword ? <Eye className="w-[18px] h-[18px]" strokeWidth={1.5} /> : <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.5} />}
                                    </button>
                                </div>
                            </div>

                            {/* Change Password Button */}
                            <div className="flex flex-row justify-end items-center pt-[20px] w-full lg:w-[945px] shrink-0">
                                <button
                                    type="submit"
                                    disabled={changePasswordMutation.isPending}
                                    className="flex flex-row justify-center items-center px-[24px] py-[14px] gap-[10px] w-full sm:w-[228px] h-[48px] bg-[#A6252A] rounded-[10px] hover:opacity-90 transition-opacity border-none outline-none cursor-pointer shrink-0 disabled:opacity-50"
                                >
                                    {changePasswordMutation.isPending ? (
                                        <Loader2 className="w-[20px] h-[20px] animate-spin text-white shrink-0" />
                                    ) : (
                                        <span className="font-sarabun font-medium text-[16px] leading-none text-white whitespace-nowrap">
                                            {t("changePassword") || "Change Password"}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Custom Delete Account Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
                    <div className="bg-white dark:bg-zinc-900 rounded-[24px] p-[32px] max-w-[440px] w-full flex flex-col items-center relative shadow-2xl text-center gap-[24px]">
                        <button
                            type="button"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="absolute top-[16px] right-[16px] text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 cursor-pointer bg-transparent border-none outline-none"
                        >
                            <X className="w-[24px] h-[24px]" strokeWidth={1.5} />
                        </button>

                        <div className="w-[100px] h-[100px] bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                            <div className="w-[70px] h-[70px] bg-zinc-100 dark:bg-zinc-700 rounded-full flex items-center justify-center">
                                <Trash2 className="w-[32px] h-[32px] text-[#27272A] dark:text-zinc-300" strokeWidth={1.5} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-[8px]">
                            <h3 className="font-sarabun font-bold text-[22px] leading-tight text-[#27272A] dark:text-zinc-100 m-0">
                                {t("deleteModalTitle") || "Are you sure?"}
                            </h3>
                            <p className="text-[14px] text-[#CD2E33] font-semibold leading-normal m-0">
                                {t("deleteModalSubtitle") || "This action cannot be undone."}
                            </p>
                        </div>

                        <div className="flex flex-row gap-[16px] w-full mt-[8px]">
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 h-[48px] border border-[#D4D4D8] dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-[#27272A] dark:text-zinc-300 rounded-[12px] font-sarabun font-semibold text-[15px] transition-colors cursor-pointer outline-none bg-transparent"
                            >
                                {t("deleteModalCancel") || "Cancel"}
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                className="flex-1 h-[48px] bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-[12px] font-sarabun font-semibold text-[15px] transition-colors cursor-pointer outline-none border-none"
                            >
                                {t("deleteModalConfirm") || "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}