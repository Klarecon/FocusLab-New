"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { useAuditStore } from "@/stores/audit-store";
import { SALARY_DEFAULTS, salaryCitation } from "@/lib/data/salary";
import type { RoleSlug } from "@/lib/data/benchmarks";

interface ContextStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function ContextStep({ onNext, onBack }: ContextStepProps) {
  const roleSlug = useAuditStore((s) => s.roleSlug);
  const workHoursPerWeek = useAuditStore((s) => s.workHoursPerWeek);
  const workDaysPerWeek = useAuditStore((s) => s.workDaysPerWeek);
  const payMode = useAuditStore((s) => s.payMode);
  const salary = useAuditStore((s) => s.salary);
  const hourlyRate = useAuditStore((s) => s.hourlyRate);
  const setContext = useAuditStore((s) => s.setContext);

  // Set default salary from BLS when role is selected and salary hasn't been set
  useEffect(() => {
    if (roleSlug && salary === 0) {
      const defaults = SALARY_DEFAULTS[roleSlug as RoleSlug];
      if (defaults) {
        setContext({ salary: defaults.amount });
      }
    }
  }, [roleSlug, salary, setContext]);

  const salaryDefault = roleSlug ? SALARY_DEFAULTS[roleSlug as RoleSlug] : null;
  const citation = salaryDefault ? salaryCitation(salaryDefault) : null;

  const DAYS_OPTIONS = [4, 5, 6, 7];

  return (
    <div>
      <div className="text-center mb-8">
        <h2
          className="text-3xl sm:text-4xl font-bold mb-2"
          style={{ fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif" }}
        >
          Your work context
        </h2>
        <p style={{ color: "var(--color-ink-soft)" }}>
          We need a few numbers to turn hours into dollars.
        </p>
      </div>

      <div className="space-y-8 max-w-lg mx-auto">
        {/* Hours per week */}
        <div className="surface-card p-5" style={{ borderLeft: "4px solid var(--color-gold)" }}>
          <label className="block text-sm font-semibold mb-3" style={{ color: "var(--color-ink)" }}>
            Hours per week
          </label>
          <div className="flex items-center gap-4">
            <StepperButton
              onClick={() => setContext({ workHoursPerWeek: Math.max(10, workHoursPerWeek - 5) })}
              icon={<Minus size={16} />}
            />
            <div className="flex-1 text-center">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={workHoursPerWeek}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (val === "") return;
                  setContext({ workHoursPerWeek: Math.max(10, Math.min(100, Number(val))) });
                }}
                className="w-20 text-center text-2xl font-semibold bg-transparent border-b-2 focus:outline-none font-figures"
                style={{ borderColor: "var(--color-waste)", color: "var(--color-ink)" }}
              />
              <span className="ml-2 text-sm" style={{ color: "var(--color-ink-soft)" }}>hrs/week</span>
            </div>
            <StepperButton
              onClick={() => setContext({ workHoursPerWeek: Math.min(100, workHoursPerWeek + 5) })}
              icon={<Plus size={16} />}
            />
          </div>
        </div>

        {/* Days per week */}
        <div className="surface-card p-5" style={{ borderLeft: "4px solid var(--color-gold)" }}>
          <label className="block text-sm font-semibold mb-3" style={{ color: "var(--color-ink)" }}>
            Days per week
          </label>
          <div className="flex gap-2">
            {DAYS_OPTIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setContext({ workDaysPerWeek: d })}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
                style={{
                  backgroundColor: workDaysPerWeek === d ? "var(--color-waste)" : "transparent",
                  color: workDaysPerWeek === d ? "#fff" : "var(--color-ink-soft)",
                  border: `1.5px solid ${workDaysPerWeek === d ? "var(--color-waste)" : "var(--color-line)"}`,
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Pay */}
        <div className="surface-card p-5" style={{ borderLeft: "4px solid var(--color-gold)" }}>
          <label className="block text-sm font-semibold mb-3" style={{ color: "var(--color-ink)" }}>
            Your pay
          </label>

          {/* Toggle */}
          <div className="flex rounded-lg overflow-hidden mb-4" style={{ border: "1.5px solid var(--color-line)" }}>
            {(["salary", "hourly"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setContext({ payMode: mode })}
                className="flex-1 py-2 text-sm font-semibold transition-all duration-150"
                style={{
                  backgroundColor: payMode === mode ? "var(--color-waste)" : "transparent",
                  color: payMode === mode ? "#fff" : "var(--color-ink-soft)",
                }}
              >
                {mode === "salary" ? "Fixed" : "Hourly"}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold" style={{ color: "var(--color-ink-soft)" }}>$</span>
            <input
              type="number"
              min={0}
              value={payMode === "salary" ? salary || "" : hourlyRate || ""}
              onChange={(e) => {
                const val = Number(e.target.value) || 0;
                if (payMode === "salary") {
                  setContext({ salary: val });
                } else {
                  setContext({ hourlyRate: val });
                }
              }}
              placeholder={payMode === "salary" ? "Annual salary" : "Hourly rate"}
              className="flex-1 px-3 py-2 rounded-lg text-lg font-figures bg-transparent focus:outline-none"
              style={{
                border: "1.5px solid var(--color-line)",
                color: "var(--color-ink)",
              }}
            />
            <span className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
              {payMode === "salary" ? "/year" : "/hour"}
            </span>
          </div>

          {/* BLS citation */}
          {payMode === "salary" && citation && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-xs leading-relaxed"
              style={{ color: "var(--color-ink-soft)" }}
            >
              Default: {citation}.{" "}
              {salaryDefault?.note && (
                <span className="italic">{salaryDefault.note}</span>
              )}
            </motion.p>
          )}
        </div>
      </div>

      {/* Nav */}
      <div className="flex justify-between mt-10">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-lg text-sm font-semibold transition-colors duration-150"
          style={{ color: "var(--color-ink-soft)", border: "1.5px solid var(--color-line)" }}
        >
          ← Back
        </button>
        <ShimmerButton
          onClick={onNext}
          borderRadius="12px"
          background="var(--color-reclaim)"
          className="px-10 py-4 text-base font-bold"
        >
          Continue →
        </ShimmerButton>
      </div>
    </div>
  );
}

function StepperButton({ onClick, icon }: { onClick: () => void; icon: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-150"
      style={{
        border: "1.5px solid var(--color-line)",
        color: "var(--color-ink-soft)",
      }}
    >
      {icon}
    </button>
  );
}
