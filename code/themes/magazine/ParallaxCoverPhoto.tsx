"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

// Subtle scroll parallax on the cover portrait, matching the approved
// preview: the image drifts and scales slightly as the page scrolls past
// the cover frame. Disabled entirely under prefers-reduced-motion.
export default function ParallaxCoverPhoto({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion || !imgRef.current) return;

    const el = imgRef.current;
    const onScroll = () => {
      const y = Math.min(window.scrollY, 400);
      el.style.transform = `translateY(${y * 0.08}px) scale(1.04)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Image
      ref={imgRef}
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 900px) 100vw, 560px"
      priority
    />
  );
}
