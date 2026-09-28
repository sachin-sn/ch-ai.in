// GET /api/resume.hropen.xml — HR-XML 2.5 style variant, prerendered at build.
// See lib/resume-xml/hropen.ts.
import { buildHrOpenResumeXml } from "@/lib/resume-xml/hropen";
import { xmlResponse } from "@/lib/resume-xml/xml";

export const dynamic = "force-static";

export function GET() {
  return xmlResponse(buildHrOpenResumeXml());
}
