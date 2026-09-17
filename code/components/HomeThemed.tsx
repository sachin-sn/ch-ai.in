"use client";

import { useTheme } from "@/lib/theme/ThemeProvider";
import MagazineHome from "@/themes/magazine/MagazineHome";
import PixelHome from "@/themes/pixel/PixelHome";
import MaterialHome from "@/themes/material/MaterialHome";
import MonochromeHome from "@/themes/monochrome/MonochromeHome";

// Renders the homepage for whichever theme is active: "magazine",
// "pixel", "material", and "monochrome" are all built.
export default function HomeThemed() {
  const { theme } = useTheme();

  switch (theme) {
    case "pixel":
      return <PixelHome />;
    case "material":
      return <MaterialHome />;
    case "monochrome":
      return <MonochromeHome />;
    case "magazine":
    default:
      return <MagazineHome />;
  }
}
