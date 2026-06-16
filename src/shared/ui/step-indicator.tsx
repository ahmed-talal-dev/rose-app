"use client";

import { CheckCircle2 } from "lucide-react";

export type Step = "email" | "verify" | "form";

export function StepIndicator({ step }: { step: Step }) {
    const steps: Step[] = ["email", "verify", "form"];
    const current = steps.indexOf(step);

    return (
        <div className="flex items-center gap-2 justify-center mb-6">
            {steps.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                    <div className={`
                        w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold font-inter transition-all
                        ${i < current ? "bg-primary-700 dark:bg-rose-300 text-white dark:text-[#212226]" : i === current ? "bg-primary-700 dark:bg-rose-300 text-white dark:text-[#212226] ring-4 ring-primary-100 dark:ring-rose-300/20" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500"}
                    `}>
                        {i < current ? <CheckCircle2 className="size-4" /> : i + 1}
                    </div>
                    {/* Add connecting line if it's not the last step */}
                    {i < 2 && (
                        <div className={`w-8 h-0.5 rounded-full transition-all ${i < current ? "bg-primary-700 dark:bg-rose-300" : "bg-zinc-200 dark:bg-zinc-700"}`} />
                    )}
                </div>
            ))}
        </div>
    );
}