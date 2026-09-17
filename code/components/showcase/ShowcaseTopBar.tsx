import Link from "next/link";

// Minimal breadcrumb for every /howdidimakethis/* page -- "cd .." back to
// the real site, the current path, and (when the registry has one for
// this app) a "view source" link straight to the public repo. repoUrl is
// per-app rather than hardcoded here, since future write-ups (Chitragupta,
// the TTL cache module, ...) will point at their own repos, not this one.
export default function ShowcaseTopBar({
  path,
  repoUrl,
}: {
  path: string;
  repoUrl?: string;
}) {
  return (
    <div className="sc-topbar">
      <Link href="/">&larr; cd .. (back to the actual site)</Link>
      <div className="sc-topbar-right">
        {repoUrl && (
          <a href={repoUrl} target="_blank" rel="noreferrer">
            view source &#8599;
          </a>
        )}
        <span className="sc-topbar-path">{path}</span>
      </div>
    </div>
  );
}
