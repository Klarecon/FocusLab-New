"use client";

import { motion } from "framer-motion";

const STEPS = [
  { label: "Role", emoji: "🎯" },
  { label: "Context", emoji: "⚙️" },
  { label: "Log your week", emoji: "🧠" },
  { label: "Results", emoji: "🤯" },
];

interface StepperProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export default function Stepper({ currentStep, onStepClick }: StepperProps) {
  const currentStepData = STEPS[currentStep];

  return (
    <nav aria-label="Wizard progress" className="mb-12">
      {/* Mobile: Mini dots */}
      <div className="flex sm:hidden flex-col items-center gap-2">
        <div className="flex items-center gap-2.5">
          {STEPS.map((s, i) => {
            const isCompleted = i < currentStep;
            const isCurrent = i === currentStep;
            return (
              <button
                key={s.label}
                type="button"
                disabled={i > currentStep}
                onClick={() => isCompleted && onStepClick(i)}
                aria-label={`Step ${i + 1}: ${s.label}${isCompleted ? " (completed)" : isCurrent ? " (current)" : ""}`}
                aria-current={isCurrent ? "step" : undefined}
                className={`rounded-full transition-all duration-300 ${
                  isCurrent
                    ? "w-3.5 h-3.5"
                    : "w-2.5 h-2.5"
                } ${isCompleted ? "cursor-pointer" : "cursor-default"}`}
                style={{
                  background: isCurrent
                    ? "linear-gradient(135deg, var(--color-waste), var(--color-reclaim))"
                    : isCompleted
                      ? "var(--color-reclaim)"
                      : "var(--color-line)",
                  boxShadow: isCurrent
                    ? "0 2px 8px rgba(224, 62, 18, 0.3)"
                    : undefined,
                }}
              />
            );
          })}
        </div>
        <span
          className="text-xs font-semibold"
          style={{ color: "var(--color-waste)" }}
        >
          <span aria-hidden="true">{currentStepData?.emoji}</span>{" "}
          {currentStepData?.label}
        </span>
      </div>

      {/* Desktop: Full circles */}
      <ol className="hidden sm:flex items-center justify-between gap-1">
        {STEPS.map((s, i) => {
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep;
          const isFuture = i > currentStep;

          return (
            <li key={s.label} className="flex-1 flex flex-col items-center gap-2">
              <div className="flex items-center w-full">
                {i > 0 && (
                  <div
                    className="flex-1 h-1 rounded-full transition-colors duration-300"
                    style={{
                      backgroundColor: isCompleted || isCurrent
                        ? "var(--color-waste)"
                        : "var(--color-line)",
                    }}
                  />
                )}

                <motion.button
                  type="button"
                  disabled={isFuture}
                  onClick={() => isCompleted && onStepClick(i)}
                  aria-label={`Step ${i + 1}: ${s.label}${isCompleted ? " (completed)" : isCurrent ? " (current)" : ""}`}
                  className={`
                    relative flex items-center justify-center w-11 h-11 rounded-full
                    text-base font-bold transition-all duration-300
                    ${isFuture ? "cursor-default" : isCompleted ? "cursor-pointer" : "cursor-default"}
                  `}
                  style={{
                    background: isCurrent
                      ? "linear-gradient(135deg, var(--color-waste), var(--color-reclaim))"
                      : isCompleted
                        ? "var(--color-reclaim)"
                        : "var(--color-line)",
                    color: isCurrent || isCompleted ? "#fff" : "var(--color-ink-soft)",
                    boxShadow: isCurrent
                      ? "0 3px 12px rgba(224, 62, 18, 0.3)"
                      : undefined,
                  }}
                  whileHover={isCompleted ? { scale: 1.1 } : {}}
                  whileTap={isCompleted ? { scale: 0.95 } : {}}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? (
                    <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7.5L5.5 11L12 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </motion.button>

                {i < STEPS.length - 1 && (
                  <div
                    className="flex-1 h-1 rounded-full transition-colors duration-300"
                    style={{
                      backgroundColor: isCompleted
                        ? "var(--color-waste)"
                        : "var(--color-line)",
                    }}
                  />
                )}
              </div>

              <span
                className="text-xs font-semibold whitespace-nowrap"
                style={{
                  color: isCurrent
                    ? "var(--color-waste)"
                    : isCompleted
                      ? "var(--color-ink)"
                      : "var(--color-ink-soft)",
                }}
              >
                <span aria-hidden="true">{s.emoji}</span> {s.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
