import Nav from "@/components/layout/Nav";
import AuditWizard from "@/components/analyzer/AuditWizard";

export const metadata = {
  title: "Pareto Analyzer — FocusLab",
  description:
    "Find the 20% of activities draining 80% of your time. A quick waste audit for any kind of work.",
};

export default function AnalyzerPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
        <AuditWizard />
      </main>
    </>
  );
}
