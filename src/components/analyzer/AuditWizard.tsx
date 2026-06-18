"use client";

import { useEffect } from "react";
import { useAuditStore } from "@/stores/audit-store";
import { AnimatePresence, motion } from "framer-motion";
import Stepper from "./Stepper";
import RoleStep from "./RoleStep";
import ContextStep from "./ContextStep";
import IntakeStep from "./IntakeStep";
import DrilldownStep from "./DrilldownStep";
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
      return <IntakeStep onNext={goNext} onBack={goBack} />;
    case 3:
      return <DrilldownStep onNext={goNext} onBack={goBack} />;
    case 4:
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

  // If user navigates to /analyzer and already has results, show them
  // instead of wiping everything. The "Start over" button handles reset.
  useEffect(() => {
    const jumpToResults = () => {
      const s = useAuditStore.getState();
      if (s.paretoResult && s.step !== 4) {
        s.setStep(4);
      }
    };
    // Check after hydration
    const unsub = useAuditStore.persist.onFinishHydration(() => jumpToResults());
    // Also check immediately in case hydration already happened
    jumpToResults();
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to top on every step transition
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const goNext = () => setStep(Math.min(step + 1, 4));
  const goBack = () => setStep(Math.max(step - 1, 0));
  const handleRestart = () => {
    // Reset all data first, then ensure step is 0
    reset();
    // Force-clear localStorage to prevent persist rehydration from restoring old state
    if (typeof window !== "undefined") {
      localStorage.removeItem("focuslab-audit");
    }
    setStep(0);
  };

  return (
    <div>
      <Stepper currentStep={step} onStepClick={setStep} />

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
