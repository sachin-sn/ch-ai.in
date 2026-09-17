import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Next's own dev-mode indicator (the small floating badge in a bottom
     corner, present only under `next dev`, never in a production build)
     sits at a fixed viewport position -- on a short/narrow viewport, like
     Chrome DevTools' mobile device emulation, it can visually overlap
     page content that's also near the bottom of the screen, e.g. the
     footer. It's not a rendering bug in the site itself, but it reads
     like one while testing responsive layout in dev mode, so it's
     switched off here. */
  devIndicators: false,

  // Static export: the site is built to plain HTML/CSS/JS in ./out and
  // served from S3 + CloudFront (see ../infra) — there's no Node server
  // behind it in production, so no API routes / middleware / SSR here.
  output: "export",

  // next/image's built-in optimizer needs a running server to resize
  // images on request, which a static export doesn't have. Unoptimized
  // mode just serves the source images as-is. Not currently in use by
  // this app, but harmless to set now, before it is.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
