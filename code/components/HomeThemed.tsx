"use client";

import { useTheme } from "@/lib/theme/ThemeProvider";
import MagazineHome from "@/themes/magazine/MagazineHome";
import PixelHome from "@/themes/pixel/PixelHome";
import MaterialHome from "@/themes/material/MaterialHome";
import MonochromeHome from "@/themes/monochrome/MonochromeHome";
import SketchHome from "@/themes/sketch/SketchHome";
import GlassHome from "@/themes/glass/GlassHome";
import ClayHome from "@/themes/clay/ClayHome";
import BentoHome from "@/themes/bento/BentoHome";
import SwissHome from "@/themes/swiss/SwissHome";
import type { ProjectEntry } from "@/lib/content/profile";

// Renders the homepage for whichever theme is active: "magazine",
// "pixel", "material", "monochrome", "sketch", "glass", "clay", "bento", and "swiss" are all built.
// `featured` is the latest blog posts, read at build time by the server
// page (app/(site)/page.tsx) and passed through to every theme.
export default function HomeThemed({ featured }: { featured: ProjectEntry[] }) {
  const { theme } = useTheme();

  switch (theme) {
    case "pixel":
      return <PixelHome featured={featured} />;
    case "material":
      return <MaterialHome featured={featured} />;
    case "monochrome":
      return <MonochromeHome featured={featured} />;
    case "sketch":
      return <SketchHome featured={featured} />;
    case "glass":
      return <GlassHome featured={featured} />;
    case "clay":
      return <ClayHome featured={featured} />;
    case "bento":
      return <BentoHome featured={featured} />;
    case "swiss":
      return <SwissHome featured={featured} />;
    case "magazine":
    default:
      return <MagazineHome featured={featured} />;
  }
}
