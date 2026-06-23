"use client";

import { RefObject, useRef } from "react";

const CARD_GAP_PX = 24;

interface UseHorizontalSliderOptions {
  fallbackCardWidth: number;
}

interface UseHorizontalSliderReturn {
  sliderRef: RefObject<HTMLDivElement | null>;
  handleSlidePrev: () => void;
  handleSlideNext: () => void;
}

export function useHorizontalSlider({
  fallbackCardWidth,
}: UseHorizontalSliderOptions): UseHorizontalSliderReturn {
  const sliderRef = useRef<HTMLDivElement>(null);

  const getScrollAmount = () => {
    const card = sliderRef.current?.querySelector<HTMLElement>("[data-card]");

    return card ? card.offsetWidth + CARD_GAP_PX : fallbackCardWidth;
  };

  const handleSlidePrev = () => {
    sliderRef.current?.scrollBy({
      left: -getScrollAmount(),
      behavior: "smooth",
    });
  };

  const handleSlideNext = () => {
    sliderRef.current?.scrollBy({
      left: getScrollAmount(),
      behavior: "smooth",
    });
  };

  return {
    sliderRef,
    handleSlidePrev,
    handleSlideNext,
  };
}
