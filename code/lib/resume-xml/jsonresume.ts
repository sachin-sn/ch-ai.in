// /api/resume.json — the same data in JSON Resume format (https://jsonresume.org,
// schema v1.0.0), the open standard for resume JSON. Minified: it's read by
// autofill agents, where fewer tokens is the point; browsers pretty-print it.
//
// Fields JSON Resume has no slot for live under a top-level "x-autofill" key
// (and per-role tech stacks under "x-techStack"); extra properties are allowed
// by the schema, and consumers that don't know them simply ignore them.

import { resume, totalExperienceYears } from "@/lib/content/resume";

const profileFromUrl = (network: string, url: string) => ({
  network,
  username: url.replace(/\/+$/, "").split("/").pop() ?? "",
  url,
});

export function buildJsonResume(now = new Date()) {
  const { contact } = resume;
  const current = resume.experience.find((p) => p.end === null);
  const latest = resume.experience[0];

  return {
    $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    basics: {
      name: contact.fullName,
      label: resume.headline,
      email: contact.email,
      url: contact.website,
      summary: resume.summary,
      location: {
        city: contact.city,
        region: contact.region,
        countryCode: contact.countryCode,
      },
      profiles: [
        profileFromUrl("LinkedIn", contact.linkedin),
        profileFromUrl("GitHub", contact.github),
      ],
    },
    work: resume.experience.map((p) => ({
      name: p.company,
      position: p.title,
      location: p.location,
      startDate: p.start,
      // JSON Resume convention: omit endDate for a current role.
      ...(p.end ? { endDate: p.end } : {}),
      highlights: [...p.description],
      "x-techStack": [...p.techStack],
    })),
    education: resume.education.map((e) => ({
      institution: `${e.institution} (${e.university})`,
      area: e.major,
      studyType: e.degree,
      startDate: String(e.startYear),
      endDate: String(e.endYear),
      score: e.grade,
    })),
    skills: resume.skills.map((g) => ({ name: g.group, keywords: [...g.items] })),
    projects: resume.projects.map((p) => ({
      name: p.name,
      description: p.description,
      ...(p.url ? { url: p.url } : {}),
    })),
    languages: [],
    meta: {
      canonical: "https://ch-ai.in/api/resume.json",
      version: "v1.0.0",
      lastModified: now.toISOString().slice(0, 19),
    },
    "x-autofill": {
      firstName: contact.firstName,
      middleName: contact.middleName,
      lastName: contact.lastName,
      country: contact.country,
      totalExperienceYears: totalExperienceYears(now),
      currentlyEmployed: Boolean(current),
      currentOrMostRecentEmployer: (current ?? latest).company,
      currentOrMostRecentTitle: (current ?? latest).title,
      resumePdfRequest: resume.pdfRequestUrl,
      alternates: ["https://ch-ai.in/api/resume.xml", "https://ch-ai.in/api/resume.hropen.xml"],
    },
  };
}
