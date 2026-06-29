"use client";

import { useEffect } from "react";
import { useAuditStore } from "@/stores/audit-store";
import { AnimatePresence, motion } from "framer-motion";
import Stepper from "./Stepper";
import RoleStep from "./RoleStep";
import ContextStep from "./ContextStep";
import LogStep from "./LogStep";
import ResultsView from "./ResultsView";

const stepVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

function StepContent({
  step,
  goNext,
  goBack,
  onRestart,
}: {
  step: number;
  goNext: () => void;
  goBack: () => void;
  onRestart: () => void;
}) {
  switch (step) {
    case 0:
      return <RoleStep onNext={goNext} />;
    case 1:
      return <ContextStep onNext={goNext} onBack={goBack} />;
    case 2:
      // Merged logging screen (Option C) — replaces the old IntakeStep +
      // DrilldownStep two-pass with one screen.
      return <LogStep onNext={goNext} onBack={goBack} />;
    case 3:
      return <ResultsView onRestart={onRestart} />;
    default:
      return null;
  }
}

export default function AuditWizard() {
  const step = useAuditStore((s) => s.step);
  const setStep = useAuditStore((s) => s.setStep);
  const reset = useAuditStore((s) => s.reset);
  const paretoResult = useAuditStore((s) => s.paretoResult);

  // Smart resume on reopen: KEEP a finished audit (jump straight to its results,
  // where "Start over" lives), but DISCARD a half-finished draft (role/drains with
  // no computed result) so returning users get a clean start instead of confusing
  // leftover picks. A re-run takes ~90s; only completed work is worth restoring.
  useEffect(() => {
    const resumeOrReset = () => {
      const s = useAuditStore.getState();
      if (s.paretoResult) {
        if (s.step !== 3) s.setStep(3);
      } else if (s.roleSlug || s.activeSources.length > 0) {
        // Partial draft, never computed — wipe it for a fresh start.
        s.reset();
      }
    };
    // Check after hydration
    const unsub = useAuditStore.persist.onFinishHydration(() => resumeOrReset());
    // Also check immediately in case hydration already happened
    resumeOrReset();
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to top on every step transition
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const goNext = () => setStep(Math.min(step + 1, 3));
  const goBack = () => setStep(Math.max(step - 1, 0));
  const handleRestart = () => {
    // Reset all data — persist middleware writes defaults to localStorage automatically
    reset();
  };

  return (
    <div>
      <Stepper currentStep={step} onStepClick={setStep} />

      {/* Top-of-step Back, mirroring the one at the bottom — so you can go back
          without scrolling to the end of a long step (S26). */}
      {step > 0 && step < 3 && (
        <button
          type="button"
          onClick={goBack}
          className="mb-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          style={{ color: "var(--color-ink-soft)", border: "1.5px solid var(--color-line)" }}
        >
          &larr; Back
        </button>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={stepVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <StepContent
            step={step}
            goNext={goNext}
            goBack={goBack}
            onRestart={handleRestart}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
