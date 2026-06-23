import { Loader2 } from "lucide-react";
import Image from "next/image";

interface LoadingStateProps {
  label: string;
}

export function LoadingState({ label }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center mx-auto py-20 px-4 gap-4 max-w-7xl">
      <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
      <span className="font-sarabun text-sm text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
    </div>
  );
}

interface EmptyCartProps {
  subtitle: string;
}

export function EmptyCart({ subtitle }: EmptyCartProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[288px] p-5 gap-6 border border-zinc-200 dark:border-zinc-800 rounded-xl">
      <Image
        src="/images/cart.png"
        alt="Empty Cart"
        width={240}
        height={180}
        className="w-60 h-auto object-contain"
        unoptimized
      />
      <p className="font-sarabun font-medium text-lg text-zinc-400">
        {subtitle}
      </p>
    </div>
  );
}
