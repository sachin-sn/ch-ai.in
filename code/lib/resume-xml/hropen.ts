// /api/resume.hropen.xml — the same data shaped like an HR-XML 2.5
// <Resume>/<StructuredXMLResume> document (the HR Open Standards lineage
// most resume parsers — Textkernel/Sovren, Daxtra, etc. — emit and many
// ATS importers understand). Modeled on the schema's element names; not
// validated against the XSD.

import { resume } from "@/lib/content/resume";
import { el, toXmlDocument, type XmlNode } from "./xml";

const sentence = (s: string) => (/[.!?]$/.test(s) ? s : `${s}.`);

const yearMonth = (ym: string) => el("YearMonth", ym);

export function buildHrOpenResumeXml(now = new Date()): string {
  const { contact } = resume;

  const employment: XmlNode[] = resume.experience.map((p) =>
    el("EmployerOrg", {}, [
      el("EmployerOrgName", p.company),
      el("PositionHistory", { positionType: "directHire", currentEmployer: p.end === null }, [
        el("Title", p.title),
        el("OrgName", {}, [el("OrganizationName", p.company)]),
        el("Description", p.description.map(sentence).join(" ")),
        el("StartDate", {}, [yearMonth(p.start)]),
        el("EndDate", {}, [p.end ? yearMonth(p.end) : el("StringDate", "current")]),
        el("OrgInfo", {}, [
          el("PositionLocation", {}, [
            el("CountryCode", contact.countryCode),
            el("Municipality", p.location.split(",")[0].trim()),
          ]),
        ]),
        ...p.techStack.map((t) => el("Competency", { name: t })),
      ]),
    ]),
  );

  const root = el(
    "Resume",
    { xmlns: "http://ns.hr-xml.org/2006-02-28", "xml:lang": "en" },
    [
      el("ResumeId", {}, [el("IdValue", "ch-ai.in/sachin-sira-nagaraja")]),
      el("StructuredXMLResume", {}, [
        el("ContactInfo", {}, [
          el("PersonName", {}, [
            el("FormattedName", contact.fullName),
            el("GivenName", contact.firstName),
            el("MiddleName", contact.middleName),
            el("FamilyName", contact.lastName),
          ]),
          el("ContactMethod", {}, [
            el("InternetEmailAddress", contact.email),
            el("InternetWebAddress", contact.website),
            el("PostalAddress", {}, [
              el("CountryCode", contact.countryCode),
              el("Region", contact.region),
              el("Municipality", contact.city),
            ]),
          ]),
          el("ContactMethod", {}, [el("Use", "linkedin"), el("InternetWebAddress", contact.linkedin)]),
          el("ContactMethod", {}, [el("Use", "github"), el("InternetWebAddress", contact.github)]),
        ]),
        el("Objective", resume.headline),
        el("ExecutiveSummary", resume.summary),
        el("EmploymentHistory", {}, employment),
        el(
          "EducationHistory",
          {},
          resume.education.map((e) =>
            el("SchoolOrInstitution", { schoolType: "university" }, [
              el("School", {}, [el("SchoolName", `${e.institution} (${e.university})`)]),
              el("Degree", { degreeType: e.degreeType }, [
                el("DegreeName", e.degree),
                el("DegreeDate", {}, [el("Year", e.endYear)]),
                el("DegreeMajor", {}, [el("Name", e.major)]),
                el("DatesOfAttendance", {}, [
                  el("StartDate", {}, [el("Year", e.startYear)]),
                  el("EndDate", {}, [el("Year", e.endYear)]),
                ]),
                el("Comments", e.grade),
              ]),
            ]),
          ),
        ),
        el(
          "Qualifications",
          {},
          resume.skills.flatMap((g) =>
            g.items.map((s) =>
              el("Competency", { name: s }, [el("CompetencyEvidence", { name: g.group, typeDescription: "skill group" }, [])]),
            ),
          ),
        ),
        el(
          "ProjectHistory",
          {},
          resume.projects.map((p) =>
            el("Project", {}, [el("ProjectName", p.name), p.url && el("ProjectUrl", p.url), el("Description", p.description)]),
          ),
        ),
        el("RevisionDate", now.toISOString().slice(0, 10)),
      ]),
    ],
  );

  return toXmlDocument(
    root,
    "HR-XML 2.5 style resume for Sachin Sira Nagaraja (https://ch-ai.in). Simpler tags: /api/resume.xml",
  );
}
