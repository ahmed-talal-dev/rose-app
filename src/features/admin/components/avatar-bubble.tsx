interface AvatarBubbleProps {
    initials: string;
}

export function AvatarBubble({ initials }: AvatarBubbleProps) {
    return (
        <div className="w-9 h-9 rounded-full bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-rose-300 text-xs font-bold shrink-0">
            {initials}
        </div>
    );
}
