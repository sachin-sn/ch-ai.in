import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./showcase.css";

// A second, independent root layout (Next's "multiple root layouts"
// pattern via route groups -- see app/(site)/layout.tsx for the other
// one). This page is meant to feel like a separate space you've
// stumbled into, not another page of the portfolio: no Nav, no Footer,
// no ThemeProvider, no shared globals.css. It loads its own font and
// its own stylesheet (showcase.css) and defines its own <html><body>.
const plexMono = IBM_Plex_Mono({
  variable: "--sc-font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "peek under the hood — ch-ai.in",
  description:
    "How ch-ai.in (and Sachin's other projects) are actually built: stack, architecture, infra, and CI/CD.",
};

export default function HowDidIMakeThisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plexMono.variable}`}>
      <body className="sc-body">
        <div className="sc-scanlines" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
