
export function resolveImageUrl(
    url?: string,
    fallback = "/images/jake-miller.png"
): string {
    if (!url) return fallback;
    if (url.startsWith("http")) return url;
    const base = process.env.NEXT_PUBLIC_API_URL ?? "https://flower.elevateegy.com";
    return `${base}${url}`;
}