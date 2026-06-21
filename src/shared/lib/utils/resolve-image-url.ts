const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://rose-app.elevate-bootcamp.cloud";

export function resolveImageUrl(url?: string): string {
  if (!url) return "/images/placeholder.svg";
  return url.startsWith("http") ? url : `${BASE_URL}${url}`;
}