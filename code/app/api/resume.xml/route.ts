// GET /api/resume.xml — prerendered to out/api/resume.xml at build time
// (static export), served by Firebase Hosting. See lib/resume-xml/readable.ts.
import { buildReadableResumeXml } from "@/lib/resume-xml/readable";
import { xmlResponse } from "@/lib/resume-xml/xml";

export const dynamic = "force-static";

export function GET() {
  return xmlResponse(buildReadableResumeXml());
}
