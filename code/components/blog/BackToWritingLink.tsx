"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { closePostZoom, fadeOutArticle } from "@/lib/motion/expandCardToPage";
import { canZoomTransition } from "@/lib/motion/zoomTransition";

// The post page's "Back to Writing" link. With View Transitions, the
// post zooms back down into its card on the list (the reverse of
// opening it); otherwise the article fades out and the list
// zooms back onto the card. Modifier clicks skip onNavigate and behave
// like a normal link.
export default function BackToWritingLink({
  slug,
  className,
  children,
}: {
  slug: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <Link
      href="/blog"
      className={className}
      onNavigate={(e) => {
        e.preventDefault();
        if (canZoomTransition()) closePostZoom(slug, "/blog", () => router.push("/blog"));
        else fadeOutArticle(() => router.push("/blog"));
      }}
    >
      {children}
    </Link>
  );
}
