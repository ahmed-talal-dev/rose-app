import { ElementType } from "react";

interface NavButtonProps {
    label: string;
    icon: ElementType;
    active: boolean;
    onClick?: () => void;
}

export function NavButton({ label, icon: Icon, active, onClick }: NavButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13.5px] font-bold transition-colors w-full text-left cursor-pointer border-none outline-none ${active
                    ? "bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-rose-300"
                    : "text-zinc-800 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                }`}
        >
            <Icon size={17} />
            {label}
        </button>
    );
}
