"use client";

import { useEffect } from "react";
import { useAuditStore } from "@/stores/audit-store";
import { AnimatePresence, motion } from "framer-motion";
import Stepper from "./Stepper";
import RoleStep from "./RoleStep";
import ContextStep from "./ContextStep";
import IntakeStep from "./IntakeStep";
import WeighStep from "./WeighStep";
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
      return <WeighStep onNext={goNext} onBack={goBack} />;
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

  // Fresh start: if user navigates to /analyzer after completing a session,
  // reset wizard state so previous WeighStep selections don't persist.
  useEffect(() => {
    if (paretoResult && step === 0) {
      // Only reset when we're at step 0 (fresh navigation) but have old results
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount only

  // Scroll to top on every step transition
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const goNext = () => setStep(Math.min(step + 1, 4));
  const goBack = () => setStep(Math.max(step - 1, 0));
  const handleRestart = () => {
    reset();
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
