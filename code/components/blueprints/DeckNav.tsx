import Link from "next/link";
import type { DeckStop } from "@/lib/blueprints/designs";
import DeckKeys from "./DeckKeys";

// Slide-show navigation for /blueprints. The index is the first slide and
// the last design is the last: the left arrow doesn't render on the index,
// the right arrow doesn't render on the last design.
//
// Three presentations of the same prev/next pair, picked by CSS (no
// viewport checks in JS, same approach as the site nav):
//   - wide screens: arrows fixed to the left/right edges of the viewport,
//     labelled with the neighbour's number and title; hovering/focusing
//     an arrow reveals what that design covers.
//   - narrower screens: a compact bar pinned to the bottom of the slide.
//   - every screen: full pager cards at the end of the slide.
// Plus the ← / → keys (DeckKeys).

type Props = { deck: DeckStop[]; position: number };

function label(stop: DeckStop) {
  return stop.number === null ? "Index" : String(stop.number).padStart(2, "0");
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {dir === "left" ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
    </svg>
  );
}

export function DeckArrows({ deck, position }: Props) {
  const prev = position > 0 ? deck[position - 1] : null;
  const next = position < deck.length - 1 ? deck[position + 1] : null;

  return (
    <>
      <DeckKeys prevHref={prev?.href ?? null} nextHref={next?.href ?? null} />

      {prev && (
        <Link
          href={prev.href}
          className="deck-arrow deck-arrow--prev"
          aria-label={`Previous: ${prev.shortTitle}`}
        >
          <span className="deck-arrow-btn"><Chevron dir="left" /></span>
          <span className="deck-arrow-num">{label(prev)}</span>
          <span className="deck-arrow-title">{prev.shortTitle}</span>
          {prev.topic && <span className="deck-arrow-topic">{prev.topic}</span>}
        </Link>
      )}

      {next && (
        <Link
          href={next.href}
          className="deck-arrow deck-arrow--next"
          aria-label={`Next: ${next.shortTitle}`}
        >
          <span className="deck-arrow-btn"><Chevron dir="right" /></span>
          <span className="deck-arrow-num">{label(next)}</span>
          <span className="deck-arrow-title">{next.shortTitle}</span>
          {next.topic && <span className="deck-arrow-topic">{next.topic}</span>}
        </Link>
      )}
    </>
  );
}

/** Compact prev/next bar, pinned to the bottom of the viewport on narrow screens. */
export function DeckBar({ deck, position }: Props) {
  const prev = position > 0 ? deck[position - 1] : null;
  const next = position < deck.length - 1 ? deck[position + 1] : null;
  const designs = deck.length - 1;

  return (
    <nav className="deck-bar" aria-label="Blueprint slides">
      <div className="deck-bar-inner">
        {prev ? (
          <Link href={prev.href} className="deck-bar-link deck-bar-link--prev">
            <Chevron dir="left" />
            <span className="deck-bar-text">
              <span className="deck-bar-num">{label(prev)}</span> {prev.shortTitle}
            </span>
          </Link>
        ) : (
          <span />
        )}
        <span className="deck-bar-count">
          {position === 0 ? "Index" : `${position} / ${designs}`}
        </span>
        {next ? (
          <Link href={next.href} className="deck-bar-link deck-bar-link--next">
            <span className="deck-bar-text">
              <span className="deck-bar-num">{label(next)}</span> {next.shortTitle}
            </span>
            <Chevron dir="right" />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </nav>
  );
}

/** Full prev/next cards at the end of a slide. */
export function DeckPager({ deck, position }: Props) {
  const prev = position > 0 ? deck[position - 1] : null;
  const next = position < deck.length - 1 ? deck[position + 1] : null;

  return (
    <nav className="deck-pager" aria-label="Previous and next blueprint">
      {prev ? (
        <Link href={prev.href} className="deck-card deck-card--prev">
          <span className="deck-card-eyebrow">&larr; Previous · {label(prev)}</span>
          <span className="deck-card-title">{prev.shortTitle}</span>
          {prev.topic && <span className="deck-card-topic">{prev.topic}</span>}
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
      {next ? (
        <Link href={next.href} className="deck-card deck-card--next">
          <span className="deck-card-eyebrow">Next · {label(next)} &rarr;</span>
          <span className="deck-card-title">{next.shortTitle}</span>
          {next.topic && <span className="deck-card-topic">{next.topic}</span>}
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  );
}

/** "← All blueprints" + a dot per slide; every dot jumps to that slide. */
export function DeckProgress({ deck, position }: Props) {
  return (
    <div className="deck-progress">
      <Link href={deck[0].href} className="deck-home">
        <span aria-hidden="true">&larr;</span> All blueprints
      </Link>
      <ol className="deck-dots" aria-label="Jump to a blueprint">
        {deck.slice(1).map((stop, i) => (
          <li key={stop.href}>
            <Link
              href={stop.href}
              className="deck-dot"
              aria-current={i + 1 === position ? "page" : undefined}
              title={`${label(stop)} · ${stop.shortTitle}`}
            >
              <span className="sr-only">{`${label(stop)} ${stop.shortTitle}`}</span>
            </Link>
          </li>
        ))}
      </ol>
      <span className="deck-count">
        {String(position).padStart(2, "0")} / {String(deck.length - 1).padStart(2, "0")}
      </span>
    </div>
  );
}
