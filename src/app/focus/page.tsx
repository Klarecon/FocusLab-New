"use client";

import Nav from "@/components/layout/Nav";
import FocusStage from "@/components/focus/FocusStage";
import { useAuditStore } from "@/stores/audit-store";
import Link from "next/link";
import AnimatedEmoji from "@/components/ui/AnimatedEmoji";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";

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
            <div className="relative flex items-center justify-center h-[240px] w-[240px]">
              <AnimatedEmoji emoji="🔍" animation="float" size="xl" />
              <OrbitingCircles radius={100} iconSize={32} speed={0.6}>
                <span className="text-xl">🎯</span>
                <span className="text-xl">🛠️</span>
                <span className="text-xl">😤</span>
                <span className="text-xl">🥲</span>
              </OrbitingCircles>
            </div>
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
            <Link href="/analyzer" className="no-underline">
              <ShimmerButton
                borderRadius="12px"
                className="px-10 py-4 text-base font-bold"
              >
                <span className="flex items-center gap-2">
                  Go to Analyzer
                  <span aria-hidden="true">&rarr;</span>
                </span>
              </ShimmerButton>
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
