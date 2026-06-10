import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Check } from "lucide-react";

export function AboutSection() {
    const t = useTranslations("home.about");

    const features = [
        t("feature1"),
        t("feature2"),
        t("feature3"),
        t("feature4")
    ];

    return (
        <section className="py-16 lg:py-24 dark:bg-zinc-800 overflow-hidden">
            <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
                {/* Main container: width: 1280px, layout: flex, gap: 80px */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-[80px]">

                    {/* Images Column: w: 530.49px, h: 376.95px */}
                    <div className="flex flex-row items-center gap-2 shrink-0 select-none w-full max-w-[530px] h-[377px] justify-center lg:justify-start">

                        {/* Group 5: w: 329.49px, h: 376.95px */}
                        <div className="relative w-[329px] h-[377px] shrink-0">
                            {/* Rectangle 3 Border */}
                            <div
                                className="absolute w-[269px] h-[363px] left-0 top-0 border-4 border-[#FF668B] dark:border-[#FDCFD4] rotate-[3.09deg]"
                                style={{ borderRadius: "50px 120px 120px 120px" }}
                            />
                            {/* Rectangle 3 Image */}
                            <div
                                className="absolute w-[302px] h-[344px] left-[27.5px] top-[24.2px] bg-muted overflow-hidden shadow-md"
                                style={{ borderRadius: "50px 120px 120px 120px" }}
                            >
                                <Image
                                    src="/images/occasion-1.svg"
                                    alt="Gift Box"
                                    fill
                                    className="object-cover"
                                    sizes="302px"
                                    priority
                                />
                            </div>
                        </div>

                        {/* Frame 69: w: 193px, h: 345px */}
                        <div className="flex flex-col gap-2 w-[193px] h-[345px] shrink-0 justify-center">
                            {/* Frame 67 */}
                            <div className="relative w-[193px] h-[193px] bg-muted rounded-full overflow-hidden shadow-md">
                                <Image
                                    src="/images/occasion-4.svg"
                                    alt="Occasion Ribbon"
                                    fill
                                    className="object-cover"
                                    sizes="193px"
                                />
                            </div>
                            {/* Frame 68 */}
                            <div
                                className="relative w-[193px] h-[144px] bg-muted overflow-hidden shadow-md"
                                style={{ borderRadius: "50px 100px 100px 50px" }}
                            >
                                <Image
                                    src="/images/occasion-3.svg"
                                    alt="Occasion Box"
                                    fill
                                    className="object-cover"
                                    sizes="193px"
                                />
                            </div>
                        </div>

                    </div>

                    {/* Content Column: w: 627px, h: 345px */}
                    <div className="flex flex-col items-start gap-6 w-full lg:max-w-[627px]">

                        {/* About label */}
                        <span className="text-[#A6252A] dark:text-[#FDCFD4] font-sarabun font-bold text-base leading-[21px] tracking-[0.25em] uppercase">
                            {t("eyebrow")}
                        </span>

                        {/* Title: Delivering the Finest Gift Boxes for Your Special Moments */}
                        <h2 className="font-sarabun font-bold text-[30px] leading-tight text-[#A6252A] dark:text-[#FDCFD4]">
                            {t("titlePart1")}
                            <span className="text-[#FF668B]">{t("titleHighlight1")}</span>
                            {t("titlePart2")}
                            <span className="text-[#FF668B]">{t("titleHighlight2")}</span>
                            {t("titlePart3")}
                        </h2>

                        {/* Description */}
                        <p className="text-muted-foreground font-sarabun font-normal text-base leading-relaxed dark:text-[#D1D1D6]/80">
                            {t("description")}
                        </p>

                        {/* Discover Button */}
                        <Link
                            href="/products"
                            className="flex flex-row justify-center items-center px-5 py-2.5 gap-2.5 bg-[#A6252A] hover:bg-[#FDCFD4]/90 dark:bg-[#FDCFD4] dark:hover:bg-[#A6252A] rounded-[10px] text-[#FFFFFF] dark:text-zinc-800 transition-all shrink-0 shadow-sm font-medium group"
                        >
                            <span className="font-sarabun text-base leading-none">
                                {t("cta")}
                            </span>
                            <ArrowRight className="h-4 w-4 text-[#FFFFFF] dark:text-zinc-800 transition-transform group-hover:translate-x-1" />
                        </Link>

                        {/* Features Grid: flex wrap, gap: 0px 24px */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 w-full pt-4">
                            {features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Check className="h-5 w-5 text-[#FF668B] dark:text-[#FDCFD4] shrink-0" strokeWidth={3} />
                                    <span className="text-sm font-normal text-foreground font-sarabun dark:text-[#D1D1D6]">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>

                    </div>

                </div>
            </div>
        </section>
    );
}