// Structured, ATS-oriented resume data — the single source for the
// machine-readable endpoints under /api/resume*.xml (see lib/resume-xml).
//
// Transcribed from "Sachin Nagaraja Resume.pdf" (Sept 2026 revision) — the
// same PDF served by the gated /resume download. Name, email and links are
// reused from ./profile; keep the rest in sync with the PDF when it changes.
//
// Deliberately public-safe: these endpoints are static files anyone can
// fetch, so there is NO phone number and the email is the forwarding
// address (hello@ch-ai.in), not the personal inbox. Add the phone by hand
// on application forms.

import { person } from "./profile";

export type ResumePosition = {
  id: string;
  title: string;
  company: string;
  location: string;
  /** ISO year-month, e.g. "2025-04" */
  start: string;
  /** ISO year-month, or null while still in the role */
  end: string | null;
  description: string[];
  techStack: string[];
};

export type ResumeEducation = {
  degree: string;
  degreeType: "bachelors" | "masters" | "doctorate" | "diploma";
  major: string;
  institution: string;
  university: string;
  location: string;
  startYear: number;
  endYear: number;
  grade: string;
};

export const resume = {
  contact: {
    fullName: person.fullName,
    firstName: person.firstName,
    middleName: person.middleName,
    lastName: person.lastName,
    email: person.email,
    city: "Bengaluru",
    region: "Karnataka",
    country: "India",
    countryCode: "IN",
    website: "https://ch-ai.in",
    linkedin: person.links.linkedin,
    github: person.links.github,
  },
  headline: "Staff Software Engineer | Application Modernisation | ReactJS, NodeJS, AWS, AI",
  summary:
    "Staff Software Engineer with 12+ years of experience and a track record in application modernisation. Has led legacy-to-modern migrations at three consecutive companies: a 20-year-old C++ application moved to AWS at One Advanced, AngularJS migrated to React at Diligent, and 4 Oracle Cloud plug-in migrations delivered in a single year at Oracle. Brings deep hands-on experience across React, Node.js, ASP.NET Web API and AWS, along with software architecture, performance optimisation and AI-enabled features. Works closely with Product, Architects and cross-functional teams, and mentors engineers through design and code reviews.",
  /** First professional role — total experience is derived from this at build time. */
  careerStart: "2014-01",
  skills: [
    { group: "Specialisation", items: ["Application Modernisation", "Legacy Migration", "Cloud Migration", "Frontend Framework Migration", "Tech Debt Reduction"] },
    { group: "Frontend", items: ["ReactJS", "JavaScript", "AngularJS", "HTML", "CSS", "Accessibility (a11y)", "Responsive Design", "UI Performance Optimisation"] },
    { group: "Backend", items: ["NodeJS", "Express", "C#", "ASP.NET Web API", "RESTful APIs", "Microservices"] },
    { group: "Cloud and AI", items: ["Amazon Web Services (AWS: S3, EC2, Lambda, Bedrock)", "Google Cloud Platform (GCP)", "Oracle Cloud", "Generative AI", "Prompt Engineering", "Retrieval-Augmented Generation (RAG)", "Agentic AI", "AI Coding Tools (Claude Code, OpenAI Codex)"] },
    { group: "Databases", items: ["MongoDB", "DynamoDB", "MS SQL", "MySQL", "SQL", "NoSQL"] },
    { group: "DevOps and Tools", items: ["Git", "GitHub Actions", "CI/CD", "Docker", "Bitbucket", "VS Code"] },
    { group: "Practices", items: ["Software Architecture", "Solution Design", "Scalable Distributed Systems", "Code Quality", "Agile", "Scrum", "Scrum Master"] },
  ],
  experience: [
    {
      id: "oracle",
      title: "Senior Member of Technical Staff",
      company: "Oracle",
      location: "Bengaluru, India",
      start: "2025-04",
      end: null,
      description: [
        "Delivered 4 Oracle Cloud plug-in migrations within one year, moving legacy plug-ins to a scalable, accessible and standards-compliant UI architecture.",
        "Develop and enhance core UI components for Oracle Cloud Shell and the UXE Console, a configuration-driven framework that standardises UI development across Oracle Cloud plug-in teams.",
        "Improved UI responsiveness by 20–30% through front-end optimisation and modernisation.",
        "Resolved 30+ customer-reported production issues, improving platform stability and reducing recurring defects.",
        "Support other teams' plug-in migrations through office hours, sharing migration patterns and guidance.",
        "Collaborate with Principal Engineers and Architects on technical designs and proofs of concept, and mentor junior engineers through architecture and design reviews.",
      ],
      techStack: ["ReactJS", "JavaScript", "HTML", "CSS", "Oracle Cloud"],
    },
    {
      id: "diligent",
      title: "Staff Software Engineer",
      company: "Diligent (RSAM Technologies)",
      location: "Bengaluru, India",
      start: "2019-12",
      end: "2025-03",
      description: [
        "Migrated AngularJS 1.x components to React, reducing tech debt and increasing migration coverage by 50%.",
        "Built enterprise Governance, Risk and Compliance (GRC) features on the HighBond and RSAM platforms, supporting risk management and audit workflows for large organisations including the U.S. Army.",
        "Developed Third-Party Risk Management (TPM) capabilities that evaluate vendor engagements and generate automated risk scores from investment and compliance data.",
        "Designed and integrated AI-powered features using Retrieval-Augmented Generation (RAG), Agentic AI workflows and prompt engineering, and cut AI chatbot response time from 10–15 seconds to 6–8 seconds (about 50% faster).",
        "Reduced infrastructure and operational costs by about 10% through architecture optimisation and performance tuning.",
        "Delivered full-stack solutions with React, ASP.NET Web API and AWS.",
        "Led a feature team end to end and performed Scrum Master responsibilities: worked with Product on scope, managed tasks and reported Red/Amber/Green delivery status to stakeholders. Conducted 20+ technical interviews as a member of the hiring panel.",
      ],
      techStack: ["ReactJS", "AngularJS", "ASP.NET Web API", "AWS", "RAG", "Agentic AI", "Prompt Engineering"],
    },
    {
      id: "one-advanced",
      title: "Specialist Software Engineer",
      company: "One Advanced",
      location: "Bengaluru, India",
      start: "2016-09",
      end: "2019-12",
      description: [
        "Migrated a 20-year-old C++ application to AWS, modernising a long-running legacy system into a cloud-hosted solution.",
        "Developed Laserform HUB, which lets solicitors digitally generate, manage and submit government-compliant legal forms.",
        "Engineered the Coroner's Notification System, with dynamic decision workflows for statutory death reporting used by healthcare and law-enforcement agencies across the UK.",
        "Built responsive, accessible full-stack applications using React, Node.js, JavaScript, HTML and CSS.",
      ],
      techStack: ["React", "Node.js", "JavaScript", "HTML", "CSS", "AWS"],
    },
    {
      id: "ness",
      title: "Software Engineer",
      company: "Ness Technologies",
      location: "Bengaluru, India",
      start: "2014-12",
      end: "2016-09",
      description: [
        "Built enterprise HR applications (Vacation Management, Ness-E-city) and candidate onboarding and background-verification solutions (JoiNess, BGV) using ASP.NET, C#, Web API and JavaScript.",
      ],
      techStack: ["ASP.NET", "C#", "Web API", "JavaScript"],
    },
    {
      id: "tenet",
      title: "System Engineer",
      company: "Tenet Technetronics",
      location: "Bengaluru, India",
      start: "2014-01",
      end: "2014-12",
      description: [
        "Developed cloud-connected IoT applications, including a water dispenser API, an energy meter and a GPS vehicle-tracking system, using ASP.NET, C# and WinForms.",
      ],
      techStack: ["ASP.NET", "C#", "WinForms", "IoT"],
    },
  ] satisfies ResumePosition[],
  education: [
    {
      degree: "Bachelor of Engineering (B.E.) in Computer Science",
      degreeType: "bachelors",
      major: "Computer Science",
      institution: "City Engineering College, Bengaluru",
      university: "Visvesvaraya Technological University",
      location: "Bengaluru, India",
      startYear: 2009,
      endYear: 2013,
      grade: "71.30%",
    },
  ] satisfies ResumeEducation[],
  projects: [
    {
      name: "Prompt Cookbook (Open Source, AI)",
      url: "https://ch-ai.in/prompt-cookbook",
      description: "Building a local-first MERN application for managing, organising and benchmarking AI prompts across platforms.",
    },
    {
      name: "Hardware and 3D Design",
      url: "",
      description: "Design functional 3D-printed components and run a self-hosted NAS for secure, local-first data storage.",
    },
    {
      name: "Community Champion, Ducati Owners Club Bangalore",
      url: "",
      description: "Lead a community of 450+ riders, coordinating events, logistics and member engagement.",
    },
  ],
  /** Where the PDF lives (email + Turnstile gated — see /resume). */
  pdfRequestUrl: "https://ch-ai.in/resume",
} as const;

/** Whole years between careerStart and `now`. */
export function totalExperienceYears(now = new Date()): number {
  const [y, m] = resume.careerStart.split("-").map(Number);
  const months = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
  return Math.floor(months / 12);
}
