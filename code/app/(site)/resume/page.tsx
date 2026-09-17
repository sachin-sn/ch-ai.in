import ResumeRequestForm from "@/components/ResumeRequestForm";

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
    </div>
  );
}
