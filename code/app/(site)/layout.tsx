import type { Metadata } from "next";
import {
  Newsreader,
  IBM_Plex_Mono,
  Space_Grotesk,
  Fraunces,
  Inter,
  Press_Start_2P,
  VT323,
  Lora,
  Nunito,
} from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { defaultTheme } from "@/lib/theme/themes";
import "./globals.css";
import "@/themes/magazine/magazine.css";
import "@/themes/pixel/pixel.css";
import "@/themes/material/material.css";
import "@/themes/monochrome/monochrome.css";

// Newsreader + IBM Plex Mono: the original "Ink & Brass" pairing, kept as
// the default/fallback theme's type.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// Magazine theme's type: Fraunces carries the cover masthead (a serif
// "title" moment), Space Grotesk handles headlines/nav, Inter is body text.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["600", "900"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Pixel theme's type: Press Start 2P for arcade headers/labels/buttons,
// VT323 for CRT-terminal body copy. VT323 only ships weight 400.
const pressStart2p = Press_Start_2P({
  variable: "--font-press-start-2p",
  subsets: ["latin"],
  weight: "400",
});

const vt323 = VT323({
  variable: "--font-vt323",
  subsets: ["latin"],
  weight: "400",
});

// Material theme's type: Lora (a warm, humanist serif) for display
// headings, Nunito (a soft, rounded grotesque) for body copy -- the boho
// pairing. font-mono reuses the already-loaded --font-plex-mono rather
// than shipping a duplicate monospace family.
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Sachin — building things",
  description: "Personal portfolio, project case studies, and writing.",
};

// Sets data-theme and data-mode before first paint (reading the same
// localStorage keys ThemeProvider/ModeToggle use) so switching themes or
// modes never flashes the wrong one on reload. Falls back to the default
// theme when nothing is stored yet. The mode fallback is per-theme rather
// than a single constant: magazine and pixel were designed dark-first (that
// remains their default the first time a visitor shows up with no stored
// preference), while material and monochrome were designed light-first --
// once someone explicitly toggles a mode, that choice is stored and wins
// regardless of theme, same as ModeToggle's own behavior after mount.
const noFlashThemeScript = `
(function () {
  var theme = "${defaultTheme}";
  try {
    var storedTheme = window.localStorage.getItem("ch-ai-theme");
    if (storedTheme) theme = storedTheme;
  } catch (e) {}
  document.documentElement.setAttribute("data-theme", theme);

  var lightFirstThemes = ["material", "monochrome"];
  var defaultMode = lightFirstThemes.indexOf(theme) === -1 ? "dark" : "light";
  var mode = defaultMode;
  try {
    var storedMode = window.localStorage.getItem("ch-ai-mode");
    if (storedMode === "dark" || storedMode === "light") mode = storedMode;
  } catch (e) {}
  document.documentElement.setAttribute("data-mode", mode);
})();
`;

// The inline script above mutates data-theme/data-mode on <html> before
// React hydrates (that's the point -- no flash of the wrong theme/mode for
// a returning visitor), so the attributes React hydrates against can
// legitimately differ from what the browser already shows by then.
// suppressHydrationWarning on the element is the standard fix for that
// exact pattern (see e.g. next-themes' own docs); data-mode gets a static
// "dark" default matching the default theme's (magazine) traditional
// look, so server and first-paint-before-script markup agree whenever
// nothing has run the script yet (e.g. with JS disabled).
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme={defaultTheme}
      data-mode="dark"
      suppressHydrationWarning
      className={`${newsreader.variable} ${plexMono.variable} ${fraunces.variable} ${spaceGrotesk.variable} ${inter.variable} ${pressStart2p.variable} ${vt323.variable} ${lora.variable} ${nunito.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-surface text-ink">
        <GoogleAnalytics />
        <ThemeProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
