import { useMutation } from "@tanstack/react-query";
import { uploadImage } from "@/features/auth/apis/upload";

export const useUpload = () =>
    useMutation({
        mutationFn: (file: File) => uploadImage(file),
    });