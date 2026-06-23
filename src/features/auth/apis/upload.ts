import { fetchClient } from "@/shared/lib/apis/fetch.client";

type UploadResponse = {
  url: string;
};

export const uploadImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("image", file);

  return fetchClient<UploadResponse>("/api/upload", {
    method: "POST",
    body: formData,
  });
};