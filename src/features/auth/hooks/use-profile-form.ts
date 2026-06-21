import { useState } from "react";
import { COUNTRIES } from "@/shared/ui/phone-input";


interface ProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  photo?: string;
}

export function useProfileForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneDialCode, setPhoneDialCode] = useState("+20");
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const initFromProfile = (data: ProfileData) => {
    setFirstName(data.firstName ?? "");
    setLastName(data.lastName ?? "");
    setEmail(data.email ?? "");
    setGender(data.gender?.toUpperCase() === "FEMALE" ? "FEMALE" : "MALE");

    const rawPhone = data.phone ?? "";
    const matchedCountry = COUNTRIES.find((c) => rawPhone.startsWith(c.dialCode));
    if (matchedCountry) {
      setPhoneDialCode(matchedCountry.dialCode);
      setPhone(rawPhone.slice(matchedCountry.dialCode.length));
    } else {
      setPhone(rawPhone);
    }
  };

  const handlePhotoChange = (file: File, onError: () => void) => {
    if (file.size > 5 * 1024 * 1024) {
      onError();
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  return {
    firstName, setFirstName,
    lastName, setLastName,
    email, setEmail,
    phone, setPhone,
    phoneDialCode, setPhoneDialCode,
    gender, setGender,
    selectedFile, setSelectedFile,
    previewUrl,
    initFromProfile,
    handlePhotoChange,
  };
}
