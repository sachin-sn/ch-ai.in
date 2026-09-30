import type { Metadata } from "next";
import ResumeRequestForm from "@/components/ResumeRequestForm";

// Advertise the machine-readable resume so autofill agents (e.g. Claude in
// Chrome) and ATS crawlers landing here can discover it from <head>.
export const metadata: Metadata = {
  alternates: {
    types: {
      "application/json": [{ url: "/api/resume.json", title: "Resume (JSON Resume)" }],
      "application/xml": [
        { url: "/api/resume.xml", title: "Resume (XML)" },
        { url: "/api/resume.hropen.xml", title: "Resume (HR-XML)" },
      ],
    },
  },
};

export default function ResumePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl font-bold text-ink">Resume</h1>
      <p className="mt-6 text-ink-dim">
        Enter your email and I&rsquo;ll generate a one-time download link on the spot — no account,
        no waiting. It&rsquo;s used only to keep a lightweight count of interest in the resume; it&rsquo;s
        never shared, sold, or used for anything else.
      </p>
      <div className="mt-8">
        <ResumeRequestForm />
      </div>
      <p className="mt-10 text-sm text-ink-dim">
        Recruiters &amp; ATS: a machine-readable version is available at{" "}
        <a className="underline" href="/api/resume.json">/api/resume.json</a> (JSON Resume),{" "}
        <a className="underline" href="/api/resume.xml">/api/resume.xml</a> (simple tags) and{" "}
        <a className="underline" href="/api/resume.hropen.xml">/api/resume.hropen.xml</a> (HR-XML style).
      </p>
    </div>
  );
}
