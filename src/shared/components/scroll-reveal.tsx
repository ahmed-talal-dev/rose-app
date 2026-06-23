"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number; // delay in ms
  duration?: number; // duration in ms
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 750,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold: 0.05, // trigger when 5% of the element is visible
        rootMargin: "0px 0px -80px 0px", // triggers slightly before entering viewport
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
      className={`transition-all ease-out duration-750 transform ${
        !isMounted || isVisible
          ? "opacity-100 translate-y-0 filter-none"
          : "opacity-0 translate-y-12 blur-[1px]"
      } ${className}`}
    >
      {children}
    </div>
  );
}
