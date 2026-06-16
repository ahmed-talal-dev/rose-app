"use client";

import { useRef } from "react";

interface OtpInputProps {
    value: string;
    onChange: (val: string) => void;
    hasError?: boolean;
}

export function OtpInput({ value, onChange, hasError }: OtpInputProps) {
    const inputs = useRef<(HTMLInputElement | null)[]>([]);
    const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

    const handleChange = (index: number, char: string) => {
        // Only allow numbers
        const digit = char.replace(/\D/g, "").slice(-1);
        const next = [...digits];
        next[index] = digit;
        onChange(next.join(""));

        // Move focus to the next input automatically
        if (digit && index < 5) inputs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        // Move focus to the previous input on Backspace if current is empty
        if (e.key === "Backspace" && !digits[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        onChange(pasted);

        // Calculate where to put the focus after pasting
        const focusIndex = Math.min(pasted.length, 5);
        inputs.current[focusIndex]?.focus();
    };

    return (
        // Force LTR direction because OTP codes are always written left-to-right
        <div className="flex gap-2 lg:gap-3 justify-center" dir="ltr">
            {digits.map((digit, i) => (
                <input
                    key={i}
                    ref={(el) => { inputs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className={`
                        w-10 h-12 lg:w-12 lg:h-14 text-center text-lg font-semibold font-inter
                        rounded-[10px] border outline-none transition-all
                        ${hasError ? "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400" : digit ? "border-primary-700 dark:border-rose-300 bg-primary-50 dark:bg-zinc-800 text-primary-700 dark:text-rose-300" : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#3A3B3F] text-zinc-800 dark:text-zinc-100"}
                        focus:border-primary-700 dark:focus:border-rose-300 focus:ring-2 focus:ring-primary-700/20 dark:focus:ring-rose-300/20
                    `}
                />
            ))}
        </div>
    );
}