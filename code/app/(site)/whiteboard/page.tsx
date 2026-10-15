import type { Metadata } from "next";
import Whiteboard from "@/components/whiteboard/Whiteboard";

export const metadata: Metadata = {
  title: "Whiteboard — ch-ai.in",
  description: "A draw.io whiteboard for system design interviews. Boards are saved in your browser.",
};

export default function WhiteboardPage() {
  return <Whiteboard />;
}
