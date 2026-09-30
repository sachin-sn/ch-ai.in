// GET /api/resume.json — JSON Resume format, prerendered at build time.
// See lib/resume-xml/jsonresume.ts.
import { buildJsonResume } from "@/lib/resume-xml/jsonresume";

export const dynamic = "force-static";

export function GET() {
  return new Response(JSON.stringify(buildJsonResume()), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
