import { Navbar } from "@/shared/layout/navbar";
import { Footer } from "@/shared/layout/footer";

export default function UserLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col bg-background dark:bg-zinc-800">
            <Navbar />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}
