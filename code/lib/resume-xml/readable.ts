// /api/resume.xml — self-describing tags meant for autofill agents (e.g.
// Claude in Chrome filling a careers page) and anything else that just
// wants to map "FirstName" to a form field without knowing a standard.

import { resume, totalExperienceYears } from "@/lib/content/resume";
import { el, toXmlDocument } from "./xml";

export function buildReadableResumeXml(now = new Date()): string {
  const { contact } = resume;
  const current = resume.experience.find((p) => p.end === null);
  const latest = resume.experience[0];

  const root = el(
    "Resume",
    {
      schema: "ch-ai.in/resume/v1",
      generated: now.toISOString().slice(0, 10),
      canonical: "https://ch-ai.in/api/resume.xml",
      alternate: "https://ch-ai.in/api/resume.hropen.xml",
    },
    [
      el("Candidate", {}, [
        el("FullName", contact.fullName),
        el("FirstName", contact.firstName),
        el("MiddleName", contact.middleName),
        el("LastName", contact.lastName),
        el("Headline", resume.headline),
        el("Email", contact.email),
        el("Location", {}, [
          el("City", contact.city),
          el("Region", contact.region),
          el("Country", { code: contact.countryCode }, [contact.country]),
        ]),
        el("Links", {}, [
          el("Website", contact.website),
          el("LinkedIn", contact.linkedin),
          el("GitHub", contact.github),
          el("ResumePdfRequest", resume.pdfRequestUrl),
        ]),
        el("TotalExperienceYears", totalExperienceYears(now)),
        el("CurrentlyEmployed", current ? "true" : "false"),
        el("CurrentOrMostRecentEmployer", (current ?? latest).company),
        el("CurrentOrMostRecentTitle", (current ?? latest).title),
      ]),
      el("Summary", resume.summary),
      el(
        "Skills",
        {},
        resume.skills.map((g) =>
          el("SkillGroup", { name: g.group }, g.items.map((s) => el("Skill", s))),
        ),
      ),
      el(
        "Experience",
        {},
        resume.experience.map((p) =>
          el("Position", { id: p.id, current: p.end === null }, [
            el("Title", p.title),
            el("Company", p.company),
            el("Location", p.location),
            el("StartDate", p.start),
            el("EndDate", p.end ?? "Present"),
            el("Description", {}, p.description.map((d) => el("Item", d))),
            el("TechStack", {}, p.techStack.map((t) => el("Skill", t))),
          ]),
        ),
      ),
      el(
        "Education",
        {},
        resume.education.map((e) =>
          el("Degree", { type: e.degreeType }, [
            el("Name", e.degree),
            el("Major", e.major),
            el("Institution", e.institution),
            el("University", e.university),
            el("Location", e.location),
            el("StartYear", e.startYear),
            el("EndYear", e.endYear),
            el("Grade", e.grade),
          ]),
        ),
      ),
      el(
        "Projects",
        {},
        resume.projects.map((p) =>
          el("Project", {}, [el("Name", p.name), p.url && el("Url", p.url), el("Description", p.description)]),
        ),
      ),
    ],
  );

  return toXmlDocument(
    root,
    [
      "Machine-readable resume for Sachin Sira Nagaraja (https://ch-ai.in).",
      "Intended for autofilling job application forms and ATS ingestion.",
      "Dates are ISO year-month (YYYY-MM). Phone number intentionally omitted;",
      "contact via Email. HR-XML style variant: /api/resume.hropen.xml",
    ].join("\n"),
  );
}
