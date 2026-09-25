"use client";

import { useEffect } from "react";
import { markLeavingPost } from "@/lib/motion/expandCardToPage";

// Renders nothing. When the post page unmounts (Back link, browser back,
// nav link) it records the slug so the list can zoom back onto its card.
export default function PostReturnMarker({ slug }: { slug: string }) {
  useEffect(() => () => markLeavingPost(slug), [slug]);
  return null;
}
