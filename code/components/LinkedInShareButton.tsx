// A share-intent link, not a LinkedIn API integration: no app
// registration, no OAuth, no token to store or refresh. LinkedIn's own
// "share offsite" URL opens a compose dialog pre-filled with the link;
// the preview card it shows comes from the Open Graph tags on that page
// (set per-post in app/(site)/blog/[slug]/page.tsx's generateMetadata),
// which LinkedIn's scraper can read because the page is fully static
// HTML at request time -- nothing to render client-side first.
type LinkedInShareButtonProps = {
  url: string;
};

export default function LinkedInShareButton({ url }: LinkedInShareButtonProps) {
  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <a
      href={shareUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-md bg-accent-bright px-5 py-2.5 font-mono text-sm font-bold uppercase tracking-wide text-surface transition hover:opacity-90"
    >
      Share on LinkedIn
    </a>
  );
}
