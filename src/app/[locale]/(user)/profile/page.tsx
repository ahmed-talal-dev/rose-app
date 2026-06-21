"use client";

import {  useTranslations } from "next-intl";
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
import { PhoneInput } from "@/shared/ui/phone-input";
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
} from "lucide-react";
import Image from "next/image";
import { resolveImageUrl } from "@/shared/lib/utils/resolve-image-url";
import { useProfileForm } from "@/features/auth/hooks/use-profile-form";
import { usePasswordForm } from "@/features/auth/hooks/use-password-form";

export default function AccountSettingsPage() {
    const router = useRouter();
    const t = useTranslations("profile");
    const tCommon = useTranslations("common");
    const { status } = useSession();

    const { data: profileData, isLoading: isProfileLoading } = useProfile();
    const updateProfileMutation = useUpdateProfile();
    const changePasswordMutation = useChangePassword();
    const deleteAccountMutation = useDeleteAccount();
    const logoutMutation = useLogout();

    const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

    const profileForm = useProfileForm(profileData);
    const passwordForm = usePasswordForm();

    const {
        firstName, setFirstName,
        lastName, setLastName,
        email, setEmail,
        phone, setPhone,
        phoneDialCode, setPhoneDialCode,
        gender, setGender,
        selectedFile, setSelectedFile,
        previewUrl,
        initFromProfile,
    } = profileForm;

    const {
        currentPassword, setCurrentPassword,
        newPassword, setNewPassword,
        confirmPassword, setConfirmPassword,
        showCurrentPassword, setShowCurrentPassword,
        showNewPassword, setShowNewPassword,
        showConfirmPassword, setShowConfirmPassword,
        reset: resetPasswordForm,
    } = passwordForm;

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (profileData) {
            initFromProfile(profileData);
        }
    }, [profileData]);

    if (status === "loading" || isProfileLoading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
                <span className="text-zinc-500 dark:text-zinc-400 font-sarabun text-sm">
                    {tCommon("loading")}
                </span>
            </div>
        );
    }

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            profileForm.handlePhotoChange(file, () => toast.error(t("uploadError")));
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (activeTab === "profile") {
            if (!firstName.trim() || !lastName.trim() || !phone.trim() || !email.trim()) {
                toast.error(t("fillError"));
                return;
            }

            const toastId = toast.loading(t("savingChanges"));

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
                    toast.success(t("updateSuccess"));
                    setSelectedFile(null);
                },
                onError: (err: unknown) => {
                    toast.dismiss(toastId);
                    toast.error(err instanceof Error ? err.message : t("genericError"));
                },
            });
        } else {
            if (!currentPassword || !newPassword || !confirmPassword) {
                toast.error(t("fillError"));
                return;
            }
            if (newPassword !== confirmPassword) {
                toast.error(t("passwordMatchError"));
                return;
            }

            const toastId = toast.loading(t("changingPassword"));

            changePasswordMutation.mutate(
                {
                    currentPassword,
                    newPassword,
                    confirmPassword,
                },
                {
                    onSuccess: () => {
                        toast.dismiss(toastId);
                        toast.success(t("passwordSuccess"));
                        resetPasswordForm();
                    },
                    onError: (err: unknown) => {
                        toast.dismiss(toastId);
                        toast.error(err instanceof Error ? err.message : t("genericError"));
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
        const toastId = toast.loading(t("deletingAccount"));
        deleteAccountMutation.mutate(undefined, {
            onSuccess: () => {
                toast.dismiss(toastId);
                toast.success(t("deleteSuccess"));
                router.push("/login");
            },
            onError: (err: unknown) => {
                toast.dismiss(toastId);
                toast.error(err instanceof Error ? err.message : t("genericError"));
            },
        });
    };

    const handleLogout = () => {
        const toastId = toast.loading(t("loggingOut"));
        logoutMutation.mutate(undefined, {
            onSuccess: () => {
                toast.dismiss(toastId);
                router.push("/login");
            },
            onError: (err: unknown) => {
                toast.dismiss(toastId);
                toast.error(err instanceof Error ? err.message : t("genericError"));
            },
        });
    };

    const currentPhotoUrl = previewUrl || resolveImageUrl(profileData?.photo) || "/images/jake-miller.png";

    return (
        <div className="flex flex-col items-start p-0 gap-9 w-full lg:w-[1280px] mx-auto mt-10 mb-16 font-sarabun px-4 lg:px-0">

            <h1 className="w-full lg:w-[371px] h-12 font-sarabun font-bold text-5xl leading-none text-zinc-800 dark:text-zinc-100 m-0 shrink-0">
                {t("title")}
            </h1>

            <div className="flex flex-col lg:flex-row items-start p-0 gap-9 w-full lg:w-[1280px] min-h-[720px] shrink-0">

                <div className="box-border flex flex-col items-start p-4 gap-[10px] w-full lg:w-[299px] lg:h-[720px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shrink-0">

                    <div className="flex flex-col items-start p-0 gap-[10px] w-full lg:w-[267px] grow">
                        <button
                            type="button"
                            onClick={() => setActiveTab("profile")}
                            className={`flex flex-row items-center px-4 py-3 gap-[10px] w-full h-12 rounded-lg transition-colors cursor-pointer border-none outline-none shrink-0 ${activeTab === "profile"
                                ? "bg-zinc-800 dark:bg-zinc-800"
                                : "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                                }`}
                        >
                            <User className={`w-6 h-6 shrink-0 ${activeTab === "profile" ? "text-white" : "text-zinc-800 dark:text-zinc-300"}`} strokeWidth={1.5} />
                            <span className={`font-sarabun font-medium text-base leading-none ${activeTab === "profile" ? "text-white" : "text-zinc-800 dark:text-zinc-300"}`}>
                                {t("tabProfile")}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("password")}
                            className={`flex flex-row items-center px-4 py-3 gap-[10px] w-full h-12 rounded-lg transition-colors cursor-pointer border-none outline-none shrink-0 ${activeTab === "password"
                                ? "bg-zinc-800 dark:bg-zinc-800"
                                : "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                                }`}
                        >
                            <Lock className={`w-6 h-6 shrink-0 ${activeTab === "password" ? "text-white" : "text-zinc-800 dark:text-zinc-300"}`} strokeWidth={1.5} />
                            <span className={`font-sarabun font-medium text-base leading-none ${activeTab === "password" ? "text-white" : "text-zinc-800 dark:text-zinc-300"}`}>
                                {t("tabPassword")}
                            </span>
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex flex-row items-center px-4 py-3 gap-[10px] w-full lg:w-[267px] h-11 bg-zinc-100 dark:bg-zinc-800 hover:opacity-80 rounded-lg transition-opacity cursor-pointer border-none outline-none shrink-0 mt-auto"
                    >
                        <LogOut className="w-5 h-5 text-primary-500 rtl:rotate-180 shrink-0" strokeWidth={1.5} />
                        <span className="font-sarabun font-medium text-base leading-none text-primary-500">
                            {t("tabLogout")}
                        </span>
                    </button>
                </div>

                <div className="flex flex-col items-start p-0 gap-4 w-full lg:w-[945px] shrink-0">

                    {activeTab === "profile" ? (
                        <>
                            <div className="flex flex-row items-center p-0 gap-4 w-full lg:w-[945px] h-30 shrink-0">
                                <div className="box-border w-30 h-30 bg-zinc-50 border border-zinc-200 dark:border-zinc-700 rounded-full shrink-0 relative isolate">
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
                                        className="box-border flex flex-row justify-center items-center p-0 gap-[10px] absolute w-8 h-8 right-px rtl:right-auto rtl:left-px bottom-0 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-full cursor-pointer z-10 outline-none transition-transform hover:scale-105"
                                    >
                                        <UploadCloud className="w-5 h-5 text-zinc-800 dark:text-zinc-300 shrink-0" strokeWidth={1.5} />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handlePhotoChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>

                                <div className="flex flex-col items-start p-0 gap-4 w-full max-w-[432px] h-[68px] shrink-0">
                                    <span className="w-[121px] h-[20px] font-sarabun font-semibold text-xl leading-none text-zinc-800 dark:text-zinc-100 whitespace-nowrap">
                                        {t("uploadPhoto")}
                                    </span>
                                    <span className="w-full lg:w-[432px] h-[32px] font-sarabun font-normal text-base leading-none text-zinc-500 dark:text-zinc-400">
                                        {t("uploadPhotoInfo")}
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col items-start p-0 gap-[10px] w-full lg:w-[945px] shrink-0">

                                <div className="flex flex-col md:flex-row items-start p-0 gap-5 w-full lg:w-[945px] lg:h-[72px] shrink-0">
                                    <div className="flex flex-col items-start p-0 gap-1.5 w-full lg:w-[462.5px] h-[72px] bg-white dark:bg-zinc-950 shrink-0">
                                        <label className="w-[71px] h-[17px] font-inter font-medium text-sm leading-[17px] text-zinc-800 dark:text-zinc-300 whitespace-nowrap">
                                            {t("firstName")}
                                        </label>
                                        <div className="box-border flex flex-row items-center p-4 gap-2 w-full lg:w-[462.5px] h-12 border border-zinc-300 dark:border-zinc-700 rounded-xl focus-within:border-primary-600 transition-colors shrink-0">
                                            <input
                                                type="text"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className="w-full bg-transparent border-none outline-none font-inter font-normal text-sm leading-[17px] text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-start p-0 gap-1.5 w-full lg:w-[462.5px] h-[72px] bg-white dark:bg-zinc-950 shrink-0">
                                        <label className="w-[70px] h-[17px] font-inter font-medium text-sm leading-[17px] text-zinc-800 dark:text-zinc-300 whitespace-nowrap">
                                            {t("lastName")}
                                        </label>
                                        <div className="box-border flex flex-row items-center p-4 gap-2 w-full lg:w-[462.5px] h-12 border border-zinc-300 dark:border-zinc-700 rounded-xl focus-within:border-primary-600 transition-colors shrink-0">
                                            <input
                                                type="text"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                className="w-full bg-transparent border-none outline-none font-inter font-normal text-sm leading-[17px] text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Email Field */}
                                <div className="flex flex-col items-start p-0 gap-1.5 w-full lg:w-[945px] h-[72px] bg-white dark:bg-zinc-950 shrink-0 mt-1.5">
                                    <label className="h-[17px] font-inter font-medium text-sm leading-[17px] text-zinc-800 dark:text-zinc-300">
                                        {t("email")}
                                    </label>
                                    <div className="box-border flex flex-row items-center p-4 gap-2 w-full lg:w-[945px] h-12 border border-zinc-300 dark:border-zinc-700 rounded-xl focus-within:border-primary-600 transition-colors shrink-0">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="example@email.com"
                                            className="w-full bg-transparent border-none outline-none font-inter font-normal text-sm leading-[17px] text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col items-start p-0 gap-1.5 w-full lg:w-[945px] h-[76px] shrink-0 mt-1.5">
                                    <label className="h-[17px] font-inter font-medium text-sm leading-[17px] text-zinc-800 dark:text-zinc-300 whitespace-nowrap">
                                        {t("phone")}
                                    </label>
                                    <div className="w-full lg:w-[945px] h-[53px]">
                                        <PhoneInput
                                            value={phone}
                                            onChange={(val) => setPhone(val || "")}
                                            onDialCodeChange={(code) => setPhoneDialCode(code)}
                                            placeholder="1012345678"
                                        />
                                    </div>
                                </div>

                                {/* Gender Field */}
                                <div className="flex flex-col items-start p-0 gap-1.5 w-full lg:w-[945px] h-[72px] bg-white dark:bg-zinc-950 shrink-0 mt-1.5">
                                    <label className="h-[17px] font-inter font-medium text-sm leading-[17px] text-zinc-800 dark:text-zinc-300">
                                        {t("gender")}
                                    </label>
                                    <div className="box-border flex flex-row items-center p-4 gap-2 w-full lg:w-[945px] h-12 bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-xl focus-within:border-primary-600 transition-colors shrink-0">
                                        <select
                                            value={gender}
                                            onChange={(e) => setGender(e.target.value as "MALE" | "FEMALE")}
                                            className="grow bg-transparent border-none outline-none font-inter font-normal text-sm leading-[17px] text-zinc-800 dark:text-zinc-100 cursor-pointer appearance-none"
                                        >
                                            <option value="MALE" className="dark:bg-zinc-900">{t("male")}</option>
                                            <option value="FEMALE" className="dark:bg-zinc-900">{t("female")}</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row justify-between items-center pt-16 pb-0 px-0 gap-[10px] w-full lg:w-[945px] h-auto sm:h-[104px] shrink-0">
                                    <button
                                        type="button"
                                        onClick={handleDeleteAccount}
                                        className="w-[132px] h-[16px] font-sarabun font-medium text-base leading-none text-destructive bg-transparent border-none outline-none cursor-pointer hover:underline p-0 m-0 shrink-0"
                                    >
                                        {t("deleteAccount")}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updateProfileMutation.isPending}
                                        className="flex flex-row justify-center items-center px-4 py-3.5 gap-[10px] w-full sm:w-[228px] h-11 bg-primary-600 rounded-xl hover:bg-primary-700 hover:opacity-90 transition-opacity border-none outline-none cursor-pointer shrink-0 disabled:opacity-50 mt-6 sm:mt-0"
                                    >
                                        {updateProfileMutation.isPending ? (
                                            <Loader2 className="w-5 h-5 animate-spin text-white shrink-0" />
                                        ) : (
                                            <span className="w-[97px] h-[16px] font-sarabun font-medium text-base leading-none text-white whitespace-nowrap">
                                                {t("saveChanges")}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col items-start p-0 gap-6 w-full lg:w-[945px] shrink-0">

                            {/* Old Password */}
                            <div className="flex flex-col items-start p-0 gap-1.5 w-full lg:w-[945px] shrink-0">
                                <label className="font-inter font-medium text-sm leading-[17px] text-zinc-800 dark:text-zinc-300">
                                    {t("currentPassword")}
                                </label>
                                <div className="box-border flex flex-row items-center p-4 gap-2 w-full lg:w-[945px] h-12 border border-zinc-300 dark:border-zinc-700 rounded-xl focus-within:border-primary-600 transition-colors shrink-0 bg-transparent">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="********"
                                        className="w-full bg-transparent border-none outline-none font-inter font-normal text-sm leading-[17px] text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="text-zinc-400 hover:text-zinc-800 focus:outline-none cursor-pointer border-none bg-transparent flex items-center justify-center p-0 shrink-0 outline-none"
                                    >
                                        {showCurrentPassword ? <Eye className="w-[18px] h-[18px]" strokeWidth={1.5} /> : <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.5} />}
                                    </button>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="w-full lg:w-[945px] border-t border-zinc-200 dark:border-zinc-800 shrink-0 my-1" />

                            {/* New Password */}
                            <div className="flex flex-col items-start p-0 gap-1.5 w-full lg:w-[945px] shrink-0">
                                <label className="font-inter font-medium text-sm leading-[17px] text-zinc-800 dark:text-zinc-300">
                                    {t("newPassword")}
                                </label>
                                <div className="box-border flex flex-row items-center p-4 gap-2 w-full lg:w-[945px] h-12 border border-zinc-300 dark:border-zinc-700 rounded-xl focus-within:border-primary-600 transition-colors shrink-0 bg-transparent">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="********"
                                        className="w-full bg-transparent border-none outline-none font-inter font-normal text-sm leading-[17px] text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="text-zinc-400 hover:text-zinc-800 focus:outline-none cursor-pointer border-none bg-transparent flex items-center justify-center p-0 shrink-0 outline-none"
                                    >
                                        {showNewPassword ? <Eye className="w-[18px] h-[18px]" strokeWidth={1.5} /> : <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.5} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm New Password */}
                            <div className="flex flex-col items-start p-0 gap-1.5 w-full lg:w-[945px] shrink-0">
                                <label className="font-inter font-medium text-sm leading-[17px] text-zinc-800 dark:text-zinc-300">
                                    {t("confirmPassword")}
                                </label>
                                <div className="box-border flex flex-row items-center p-4 gap-2 w-full lg:w-[945px] h-12 border border-zinc-300 dark:border-zinc-700 rounded-xl focus-within:border-primary-600 transition-colors shrink-0 bg-transparent">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="********"
                                        className="w-full bg-transparent border-none outline-none font-inter font-normal text-sm leading-[17px] text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="text-zinc-400 hover:text-zinc-800 focus:outline-none cursor-pointer border-none bg-transparent flex items-center justify-center p-0 shrink-0 outline-none"
                                    >
                                        {showConfirmPassword ? <Eye className="w-[18px] h-[18px]" strokeWidth={1.5} /> : <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.5} />}
                                    </button>
                                </div>
                            </div>

                            {/* Change Password Button */}
                            <div className="flex flex-row justify-end items-center pt-5 w-full lg:w-[945px] shrink-0">
                                <button
                                    type="submit"
                                    disabled={changePasswordMutation.isPending}
                                    className="flex flex-row justify-center items-center px-6 py-3.5 gap-[10px] w-full sm:w-[228px] h-12 bg-primary-600 rounded-xl hover:opacity-90 transition-opacity border-none outline-none cursor-pointer shrink-0 disabled:opacity-50"
                                >
                                    {changePasswordMutation.isPending ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-white shrink-0" />
                                    ) : (
                                        <span className="font-sarabun font-medium text-base leading-none text-white whitespace-nowrap">
                                            {t("changePassword")}
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
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-md w-full flex flex-col items-center relative shadow-2xl text-center gap-6">
                        <button
                            type="button"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 cursor-pointer bg-transparent border-none outline-none"
                        >
                            <X className="w-6 h-6" strokeWidth={1.5} />
                        </button>

                        <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                            <div className="w-[70px] h-[70px] bg-zinc-100 dark:bg-zinc-700 rounded-full flex items-center justify-center">
                                <Trash2 className="w-8 h-8 text-zinc-800 dark:text-zinc-300" strokeWidth={1.5} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <h3 className="font-sarabun font-bold text-xl leading-tight text-zinc-800 dark:text-zinc-100 m-0">
                                {t("deleteModalTitle")}
                            </h3>
                            <p className="text-sm text-primary-500 font-semibold leading-normal m-0">
                                {t("deleteModalSubtitle")}
                            </p>
                        </div>

                        <div className="flex flex-row gap-4 w-full mt-2">
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 h-12 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-300 rounded-xl font-sarabun font-semibold text-sm transition-colors cursor-pointer outline-none bg-transparent"
                            >
                                {t("deleteModalCancel")}
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl font-sarabun font-semibold text-sm transition-colors cursor-pointer outline-none border-none"
                            >
                                {t("deleteModalConfirm")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}