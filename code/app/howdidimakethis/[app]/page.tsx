import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShowcaseTopBar from "@/components/showcase/ShowcaseTopBar";
import ChAiContent from "@/components/showcase/ChAiContent";
import { getLiveShowcaseApps, getShowcaseApp } from "@/lib/showcase/apps";

// output: "export" (see next.config.ts) means every dynamic path has to be
// known at build time -- generateStaticParams only pre-renders the "live"
// entries in the registry, so a "coming-soon" slug (or anything else) 404s
// instead of producing a broken/empty page.
export function generateStaticParams() {
  return getLiveShowcaseApps().map((app) => ({ app: app.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ app: string }>;
}): Promise<Metadata> {
  const { app: slug } = await params;
  const app = getShowcaseApp(slug);
  if (!app) return {};
  return {
    title: `how ${app.name} was built — ch-ai.in`,
    description: app.tagline,
  };
}

// Content is bespoke per project (not template-generated from the
// registry) -- each project's real architecture is different enough that
// forcing them through one generic renderer would flatten the interesting
// parts. This switch is where a future project's content component gets
// wired in, mirroring how HomeThemed.tsx switches over the active theme.
export default async function ShowcaseAppPage({
  params,
}: {
  params: Promise<{ app: string }>;
}) {
  const { app: slug } = await params;
  const app = getShowcaseApp(slug);
  if (!app || app.status !== "live") notFound();

  return (
    <div className="sc-shell">
      <ShowcaseTopBar path={`/howdidimakethis/${app.slug}`} repoUrl={app.repoUrl} />
      {slug === "ch-ai" ? <ChAiContent /> : notFound()}
    </div>
  );
}
