"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

const COUNTRIES = [
    { code: "EG", dialCode: "+20", name: "Egypt" },
    { code: "SA", dialCode: "+966", name: "Saudi Arabia" },
    { code: "AE", dialCode: "+971", name: "UAE" },
    { code: "KW", dialCode: "+965", name: "Kuwait" },
    { code: "QA", dialCode: "+974", name: "Qatar" },
    { code: "BH", dialCode: "+973", name: "Bahrain" },
    { code: "OM", dialCode: "+968", name: "Oman" },
    { code: "JO", dialCode: "+962", name: "Jordan" },
    { code: "LB", dialCode: "+961", name: "Lebanon" },
    { code: "SY", dialCode: "+963", name: "Syria" },
    { code: "IQ", dialCode: "+964", name: "Iraq" },
    { code: "LY", dialCode: "+218", name: "Libya" },
    { code: "TN", dialCode: "+216", name: "Tunisia" },
    { code: "DZ", dialCode: "+213", name: "Algeria" },
    { code: "MA", dialCode: "+212", name: "Morocco" },
    { code: "SD", dialCode: "+249", name: "Sudan" },
    { code: "US", dialCode: "+1", name: "United States" },
    { code: "GB", dialCode: "+44", name: "United Kingdom" },
    { code: "FR", dialCode: "+33", name: "France" },
    { code: "DE", dialCode: "+49", name: "Germany" },
    { code: "TR", dialCode: "+90", name: "Turkey" },
    { code: "IN", dialCode: "+91", name: "India" },
];

function FlagImage({ code, size = 20 }: { code: string; size?: number }) {
    return (
        <span
            className="overflow-hidden rounded-full shrink-0"
            style={{ width: size, height: size }}
        >
            <Image
                src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
                alt={code}
                width={size}
                height={size}
                className="w-full h-full object-cover"
                unoptimized
            />
        </span>
    );
}

interface PhoneInputProps {
    value?: string;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    hasError?: boolean;
    id?: string;
}

export function PhoneInput({
    value = "",
    onChange,
    onBlur,
    placeholder = "Phone number",
    hasError = false,
    id,
}: PhoneInputProps) {
    const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const filtered = COUNTRIES.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.dialCode.includes(search) ||
            c.code.toLowerCase().includes(search.toLowerCase())
    );

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Focus search on open
    useEffect(() => {
        if (open) setTimeout(() => searchRef.current?.focus(), 50);
    }, [open]);

    const handleSelect = (country: typeof COUNTRIES[0]) => {
        setSelectedCountry(country);
        setOpen(false);
        setSearch("");
    };

    return (
        <div className="relative flex items-center" ref={dropdownRef}>
            {/* Country selector button */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`absolute start-0 h-full flex items-center gap-1.5 px-3 border-e border-zinc-200 hover:bg-zinc-50 transition-colors rounded-s-[10px] z-10 ${open ? "bg-zinc-50" : ""}`}
            >
                <FlagImage code={selectedCountry.code} size={20} />
                <span className="text-xs lg:text-sm font-medium text-[#323639] font-inter whitespace-nowrap">
                    {selectedCountry.dialCode}
                </span>
                <ChevronDown
                    className={`size-3.5 text-zinc-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </button>

            {/* Phone number input */}
            <input
                id={id}
                type="tel"
                inputMode="numeric"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                onBlur={onBlur}
                className={`
                    h-10 lg:h-[53px] w-full rounded-[10px] border bg-white
                    ps-[calc(var(--selector-w,7rem)+0.5rem)] pe-4
                    text-sm font-inter text-zinc-800 placeholder:text-zinc-400
                    outline-none transition-colors
                    focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700
                    ${hasError ? "border-red-500" : "border-zinc-300"}
                `}
                style={{ paddingInlineStart: "calc(var(--phone-selector-width, 110px) + 8px)" }}
            />

            {/* Dropdown */}
            {open && (
                <div className="absolute start-0 top-full mt-1 w-72 bg-white border border-zinc-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    {/* Search */}
                    <div className="p-2 border-b border-zinc-100">
                        <input
                            ref={searchRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search country..."
                            className="w-full h-8 px-3 text-sm font-inter text-zinc-800 placeholder:text-zinc-400 bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-primary-700"
                        />
                    </div>

                    {/* List */}
                    <ul className="max-h-52 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <li className="px-4 py-3 text-sm text-zinc-400 font-inter text-center">
                                No results
                            </li>
                        ) : (
                            filtered.map((country) => (
                                <li key={country.code}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(country)}
                                        className={`
                                            w-full flex items-center gap-3 px-4 py-2.5 text-start
                                            hover:bg-zinc-50 transition-colors
                                            ${selectedCountry.code === country.code ? "bg-zinc-50" : ""}
                                        `}
                                    >
                                        <FlagImage code={country.code} size={20} />
                                        <span className="flex-1 text-sm font-inter text-zinc-700">{country.name}</span>
                                        <span className="text-sm font-inter text-zinc-400">{country.dialCode}</span>
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}