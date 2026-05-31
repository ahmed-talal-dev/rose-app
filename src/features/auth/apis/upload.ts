
type UploadResponse = {
    url: string;
};

export const uploadImage = async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    const data = await res.json();

    if (!res.ok || !data.status) {
        throw new Error(data.message || "Upload failed");
    }

    return data.payload;
};