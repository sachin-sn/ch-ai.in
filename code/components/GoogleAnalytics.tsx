import Script from "next/script";

// GA4's Measurement ID is public by design, same as
// NEXT_PUBLIC_TURNSTILE_SITE_KEY in ResumeRequestForm.tsx -- it only tells
// gtag.js which property to send events to, it isn't a credential. Baked
// in at build time (NEXT_PUBLIC_ vars are inlined into the static export)
// -- set as the GA_MEASUREMENT_ID GitHub Actions repo variable, wired into
// gcp-static-deploy.yml's build step.
//
// Requires Google Analytics to be linked to the Firebase project first
// (Firebase console -> Project settings -> Integrations -> Google
// Analytics) -- that step creates the GA4 property and its Measurement
// ID. There's no Terraform resource for the link itself, since it's a
// one-time ToS-acceptance flow -- same reason the Turnstile widget is
// created via the Cloudflare dashboard rather than in infra-gcp.
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

// Rendered from both root layouts (see app/(site)/layout.tsx and
// app/howdidimakethis/layout.tsx -- Next's "multiple root layouts"
// pattern) so page views are counted across the whole domain, not just
// the main site. GA4's Enhanced Measurement (on by default for new
// properties) auto-tracks page views on client-side route changes, so
// one 'config' call here is enough -- no per-navigation event firing.
export default function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
