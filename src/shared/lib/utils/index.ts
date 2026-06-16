import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── formatPhone ─────────────────────────────────────────────────────────────
// Normalizes a phone number to E.164 format (+[countryCode][number])
// Examples:
//   formatPhone("01012345678", "+20") → "+201012345678"
//   formatPhone("+201012345678", "+20") → "+201012345678"
//   formatPhone("", "+20")             → undefined
// ─────────────────────────────────────────────────────────────────────────────
export function formatPhone(
  phoneNum: string,
  countryCode: string
): string | undefined {
  if (!phoneNum) return undefined;

  // Remove formatting characters (spaces, dashes, parentheses)
  let clean = phoneNum.replace(/[\s\-()]/g, "");

  // Already in E.164 format — return as-is
  if (clean.startsWith("+")) return clean;

  // Strip leading zero (local format)
  if (clean.startsWith("0")) {
    clean = clean.substring(1);
  }

  // Already contains the dial code digits without the + prefix
  const dialDigits = countryCode.replace("+", "");
  if (clean.startsWith(dialDigits)) {
    return `+${clean}`;
  }

  return `${countryCode}${clean}`;
}