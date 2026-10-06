import { getDeck } from "@/lib/blueprints/designs";
import DeckTransitions from "@/components/blueprints/DeckTransitions";

// Shared by the index and every slide, so the slide-transition listener
// survives navigation between them.
export default function BlueprintsLayout({ children }: { children: React.ReactNode }) {
  const order = getDeck().map((stop) => stop.href);
  return (
    <>
      <DeckTransitions order={order} />
      {children}
    </>
  );
}
