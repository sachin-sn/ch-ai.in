import type { Metadata } from "next";
import Playground from "@/components/playground/Playground";

export const metadata: Metadata = {
  title: "Playground — ch-ai.in",
  description:
    "Run JavaScript and TypeScript in the browser with IntelliSense and any npm package — for live coding interviews.",
};

export default function PlaygroundPage() {
  return <Playground />;
}
