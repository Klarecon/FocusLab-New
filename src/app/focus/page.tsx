"use client";

import Nav from "@/components/layout/Nav";
import FocusStage from "@/components/focus/FocusStage";
import { useAuditStore } from "@/stores/audit-store";
import Link from "next/link";
import AnimatedEmoji from "@/components/ui/AnimatedEmoji";

export default function FocusPage() {
  const paretoResult = useAuditStore((s) => s.paretoResult);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
        {paretoResult ? (
          <FocusStage />
        ) : (
          <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
            <AnimatedEmoji emoji="🔍" animation="float" size="xl" />
            <h1
              className="text-3xl font-semibold"
              style={{
                fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
              }}
            >
              No audit results yet
            </h1>
            <p
              className="text-lg max-w-md"
              style={{ color: "var(--color-ink-soft)" }}
            >
              Run the Pareto Analyzer first to identify your biggest time drains,
              then come back here to build your action plan.
            </p>
            <Link
              href="/analyzer"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl text-white font-bold no-underline transition-all hover:scale-[1.03]"
              style={{
                backgroundColor: "var(--color-reclaim)",
                boxShadow: "0 4px 16px rgba(196, 24, 106, 0.25)",
              }}
            >
              <span>Go to Analyzer</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
