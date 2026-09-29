// Content pulled from Sachin's resume — kept separate from any one theme's
// presentation so every theme (magazine, pixel, material, monochrome) can
// render the same underlying data with its own layout and voice.

export const person = {
  name: "Sachin Nagaraja",
  fullName: "Sachin Sira Nagaraja",
  firstName: "Sachin",
  middleName: "Sira",
  lastName: "Nagaraja",
  title:
    "Senior Full Stack Engineer — Enterprise Cloud Solutions, Technical Leadership, Architecture & UI Modernization",
  summary:
    "Senior full-stack engineer at Oracle, enhancing user experience and managing UI components across the Oracle Cloud ecosystem while leading plugin-migration modernization — twelve-plus years across MERN, ASP.NET, and cloud-native architecture, shipping secure, accessible, high-performing platforms.",
  email: "hello@ch-ai.in",
  links: {
    github: "https://github.com/sachin-sn",
    linkedin: "https://linkedin.com/in/sachin-s-nagaraja",
  },
  location: "Bengaluru, India",
  openToWork: {
    headline: "Open to new roles",
    body: "Looking for fullstack or backend-leaning engineering work. Happy to talk.",
  },
};

export type ExperienceEntry = {
  id: string;
  role: string;
  company: string;
  start: string;
  end: string; // "Present" for current role
  yearLabel: string; // short label used by timeline-style layouts
  yearSub: string;
  highlights: string[];
};

export const experience: ExperienceEntry[] = [
  {
    id: "oracle",
    role: "Senior Member of Technical Staff",
    company: "Oracle",
    start: "Apr 2025",
    end: "Present",
    yearLabel: "2025",
    yearSub: "PRESENT",
    highlights: [
      "Core UI for Oracle Cloud Shell and the UXE Console, a config-driven framework standardizing UI across plug-in teams",
      "4 plug-in migrations delivered in one year; UI responsiveness up 20–30%",
      "30+ customer-reported production issues resolved",
    ],
  },
  {
    id: "diligent",
    role: "Staff Software Engineer",
    company: "Diligent (RSAM Technologies)",
    start: "Dec 2019",
    end: "Mar 2025",
    yearLabel: "2019",
    yearSub: "–2025",
    highlights: [
      "GRC platform on HighBond — risk and audit workflows, including for the U.S. Army",
      "AI chatbot response time cut from 10–15s to 6–8s (~50% faster)",
      "AngularJS → React migration; infra cost down ~10%",
    ],
  },
  {
    id: "one-advanced",
    role: "Specialist Software Engineer",
    company: "One Advanced",
    start: "Sep 2016",
    end: "Dec 2019",
    yearLabel: "2016",
    yearSub: "–2019",
    highlights: [
      "Laserform HUB — digital government-compliant legal forms for solicitors",
      "Coroner's Notification System for UK healthcare & law enforcement",
      "Migrated a 20-year-old C++ application to AWS",
    ],
  },
  {
    id: "ness",
    role: "Software Engineer",
    company: "Ness Technologies",
    start: "Dec 2014",
    end: "Sep 2016",
    yearLabel: "2014",
    yearSub: "–2016",
    highlights: [
      "Vacation Management & NessEcity — HR/workforce apps for global delivery centers",
      "JoiNess & BGV — candidate onboarding and background verification",
    ],
  },
  {
    id: "tenet",
    role: "System Engineer",
    company: "Tenet Technetronics",
    start: "Jan 2014",
    end: "Dec 2014",
    yearLabel: "2014",
    yearSub: "",
    highlights: [
      "Cloud IoT: Water Dispenser API, Energy Meter, GPS vehicle tracking for forest transportation",
    ],
  },
];

export type ProjectEntry = {
  id: string;
  slug: string;
  kicker: string;
  title: string;
  description: string;
};

// Not shown on the homepage right now -- the featured slot renders the
// latest blog posts (lib/blog/featured.ts) until these case-study pages are
// built. Swap back in app/(site)/page.tsx when they are.
export const featuredProjects: ProjectEntry[] = [
  {
    id: "chitraguptha",
    slug: "/chitraguptha",
    kicker: "Case Study — Consent by Design",
    title: "Chitraguptha",
    description:
      "A web app for leaving public good-deed and bad-deed feedback, built around consent and legal-risk questions worked through before a line of the architecture was written.",
  },
  {
    id: "ttlcache",
    slug: "/ttlcache",
    kicker: "Case Study — Architecture",
    title: "TTL Cache Module",
    description:
      "A client-side TypeScript cache: a closure-based singleton, a microtask-batched event bus, and a React hook layer sitting on top of a fully generic-typed core.",
  },
];

export type SideProject = {
  id: string;
  title: string;
  description: string;
};

export const offTheClock: SideProject[] = [
  {
    id: "prompt-cookbook",
    title: "Prompt Cookbook",
    description:
      "A local-first MERN app for managing, organizing, and benchmarking AI prompts across multiple platforms.",
  },
  {
    id: "ducati",
    title: "Ducati Owners Club Bangalore",
    description:
      "Community Champion coordinating event planning, logistics, and member engagement for 450+ riders.",
  },
  {
    id: "3d-printing",
    title: "3D Printing & Self-Hosted NAS",
    description:
      "Functional 3D-printed components on a Bambu Lab A1 Mini, alongside a self-hosted NAS for secure, local-first data storage.",
  },
];

// Single source for the "Tech Specs" block — every theme (magazine, pixel,
// material, monochrome) renders this same list, each in its own voice.
// Items are individual entries (one chip / one token each); themes join or
// chip them as they see fit, so keep each item self-contained.
export type TechSpec = { group: string; items: string[] };

export const techSpecs: TechSpec[] = [
  { group: "Specialisation", items: ["Application Modernisation", "Legacy Migration", "Cloud Migration", "Frontend Framework Migration"] },
  { group: "Primary Stack", items: ["MongoDB", "Express.js", "React.js", "Node.js"] },
  { group: "Languages", items: ["TypeScript", "JavaScript", "C#", "SQL", "HTML/CSS"] },
  { group: "Frontend", items: ["Next.js", "AngularJS", "Tailwind CSS", "Accessibility (a11y)", "Responsive Design", "UI Performance"] },
  { group: "Backend & APIs", items: ["ASP.NET Web API", "REST", "GraphQL", "Microservices"] },
  { group: "Cloud", items: ["AWS (S3, EC2, Lambda, CloudFront, Route 53, Bedrock)", "GCP (Firebase, Cloud Functions)", "Oracle Cloud"] },
  { group: "AI", items: ["Generative AI", "RAG", "Agentic AI", "Prompt Engineering", "Claude Code", "OpenAI Codex"] },
  { group: "Data", items: ["DynamoDB", "MS SQL", "MySQL"] },
  { group: "Testing & Quality", items: ["Jest", "Cypress", "Playwright", "Selenium", "ESLint", "Load Testing", "RCA"] },
  { group: "DevOps & IaC", items: ["Git", "GitHub Actions", "CI/CD", "Docker", "Terraform CDK"] },
  { group: "Practices", items: ["Software Architecture", "Solution Design", "Distributed Systems", "Agile / Scrum", "Scrum Master"] },
  { group: "Now Learning", items: ["Bun", "Zod", "tRPC", "Redis", "Kafka"] },
];
