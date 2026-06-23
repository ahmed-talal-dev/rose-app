"use client";

import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import Image from "next/image";
import { useTestimonials } from "@/features/testimonials/hooks/use-testimonials";
import { Testimonial } from "@/features/testimonials/types";

const CARD_TOP_OFFSET_PX = 119.5;
const AVATAR_TOP_OFFSET_PX = 44.5;
const TESTIMONIAL_CARD_HEIGHT_PX = 250;
const STAR_COUNT = 5;
const UPLOADS_BASE_URL = "https://flower.elevateegy.com/uploads";

function formatDate(rawDate: string): string {
  const date = new Date(rawDate);
  return isNaN(date.getTime()) ? rawDate : date.toLocaleDateString();
}

function resolveAvatarUrl(image: string | undefined): string {
  if (!image) return "/images/placeholder.svg";
  if (image.startsWith("http") || image.startsWith("/")) return image;
  return `${UPLOADS_BASE_URL}/${image}`;
}

export function TestimonialsSection() {
  const t = useTranslations("home.testimonials");
  const { data, isLoading, isError } = useTestimonials({ limit: 3 });
  const apiTestimonials = data?.data ?? [];

  const staticTestimonials: Testimonial[] = [
    {
      id: "static-1",
      name: t("jakeName"),
      email: "",
      content: t("jakeReview"),
      createdAt: t("jakeDate"),
      rating: 5,
      image: "/images/jake-miller.png",
      isApproved: true,
    },
    {
      id: "static-2",
      name: t("tylerName"),
      email: "",
      content: t("tylerReview"),
      createdAt: t("tylerDate"),
      rating: 5,
      image: "/images/tyler-brooks.png",
      isApproved: true,
    },
    {
      id: "static-3",
      name: t("maxName"),
      email: "",
      content: t("maxReview"),
      createdAt: t("maxDate"),
      rating: 4,
      image: "/images/max-turner.png",
      isApproved: true,
    },
  ];

  const testimonialsToDisplay =
    apiTestimonials.length > 0 ? apiTestimonials : staticTestimonials;

  return (
    <section className="w-full flex flex-col items-center justify-start gap-10 bg-background dark:bg-zinc-800 font-sarabun py-12 lg:h-[660px] lg:py-0">
      <div className="w-full max-w-[562px] lg:h-[70px] flex flex-col items-center lg:justify-between relative px-4 sm:px-0 gap-2 lg:gap-0">
        <span className="w-full text-center text-base font-bold tracking-[0.25em] uppercase text-rose-500 h-[21px] flex items-center justify-center">
          {t("eyebrow")}
        </span>

        <div className="w-full h-[41px] relative mt-2 flex justify-center items-center">
          <div className="absolute w-[280px] sm:w-[402px] h-[17px] bg-rose-100/50 dark:bg-rose-950/40 rounded-full inset-x-0 mx-auto top-[24px]" />
          <div className="absolute w-[110px] sm:w-[157px] h-[2px] bg-rose-600 dark:bg-rose-500 inset-x-0 mx-auto top-[39px]" />
          <h2 className="relative font-sarabun font-bold text-3xl sm:text-4xl leading-[41px] text-rose-600 dark:text-primary-100 z-10 text-center select-none whitespace-nowrap">
            {t("title")}
          </h2>
        </div>
      </div>

      <div className="w-full bg-rose-50 dark:bg-zinc-900 py-12 lg:py-0 lg:h-[550px] flex items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-10 px-4 max-w-7xl w-full">
            {["skeleton-0", "skeleton-1", "skeleton-2"].map((skeletonKey) => (
              <div
                key={skeletonKey}
                className="w-full max-w-[404px] h-[433px] relative bg-white/5 rounded-[24px] animate-pulse flex items-center justify-center"
              >
                <span className="text-zinc-400">{t("noTestimonials")}</span>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center text-red-500 font-medium text-lg">
            {t("empty")}
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-10 px-4 max-w-7xl w-full">
            {testimonialsToDisplay.map((testimonial) => {
              const avatarUrl = resolveAvatarUrl(testimonial.image);
              const displayDate = testimonial.createdAt
                ? formatDate(testimonial.createdAt)
                : "";
              const rating = testimonial.rating ?? STAR_COUNT;

              return (
                <div
                  key={testimonial.id}
                  className="w-full max-w-[404px] h-[433px] relative shrink-0"
                >
                  <div
                    className="absolute left-1/2 -translate-x-1/2 size-[120px] border-[3px] border-white rounded-full z-20 overflow-hidden bg-white shadow-md"
                    style={{ top: `${AVATAR_TOP_OFFSET_PX}px` }}
                  >
                    <Image
                      src={avatarUrl}
                      alt={testimonial.name}
                      width={120}
                      height={120}
                      className="object-cover"
                      style={{ width: "100%", height: "100%" }}
                      priority
                    />
                  </div>

                  <div
                    className="absolute w-[343px] max-w-[90%] left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-800 rounded-[24px] shadow-lg pt-[55px] pb-5 px-5 flex flex-col items-center justify-between z-10"
                    style={{
                      top: `${CARD_TOP_OFFSET_PX}px`,
                      height: `${TESTIMONIAL_CARD_HEIGHT_PX}px`,
                    }}
                  >
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 text-center w-full truncate h-5">
                      {testimonial.name}
                    </h3>

                    <div className="flex items-center justify-center gap-1 w-full h-[15px]">
                      {Array.from({ length: STAR_COUNT }).map((_, j) => (
                        <Star
                          key={j}
                          className={`size-[15px] ${
                            j < rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-zinc-200 dark:text-zinc-600"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-sm sm:text-base font-normal text-zinc-800 dark:text-zinc-300 text-center leading-relaxed h-[72px] overflow-hidden text-ellipsis flex items-center justify-center w-full">
                      {testimonial.content}
                    </p>

                    <span className="text-xs font-medium text-zinc-400 dark:text-zinc-400 text-center w-full h-4 block">
                      {displayDate}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
