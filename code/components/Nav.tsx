import Link from "next/link";
import ThemeSwitcher from "./ThemeSwitcher";
import ModeToggle from "./ModeToggle";
import MobileMenu from "./MobileMenu";

const links = [
  { href: "/blog", label: "writing" },
  { href: "/resume", label: "resume" },
];

// Nav stays a plain server component: the only interactive piece is the
// burger dropdown's open/closed state, which lives entirely inside
// <MobileMenu>. Both the desktop row and the mobile burger render
// unconditionally here -- which one is visible is decided purely by CSS
// media queries (.site-nav-desktop / .site-nav-mobile in globals.css), so
// there's no client-side viewport check and no layout flash while JS
// loads.
export default function Nav() {
  return (
    <header className="site-nav ledger-rule">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-4">
        <Link
          href="/"
          className="site-brand font-display text-lg font-bold tracking-tight text-ink hover:text-accent-bright"
        >
          sachin.nagaraja
        </Link>

        <div className="site-nav-desktop flex items-center gap-6">
          <nav>
            <ul className="flex gap-6 font-mono text-sm uppercase tracking-wide">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-ink-dim hover:text-accent-bright"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <ThemeSwitcher />
          </div>
        </div>

        <MobileMenu links={links} />
      </div>
    </header>
  );
}
