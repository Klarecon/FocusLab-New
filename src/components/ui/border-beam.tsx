"use client";

import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  /** Length of the travelling light, in px. */
  size?: number;
  /** Seconds for one full lap. */
  duration?: number;
  borderWidth?: number;
  anchor?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
}

/**
 * A light that travels around the border of its (rounded) parent. The parent
 * must be `relative` with a border-radius — this overlays it and inherits the
 * radius. On-brand defaults: pink → gold.
 */
export function BorderBeam({
  className,
  size = 220,
  duration = 8,
  anchor = 90,
  borderWidth = 2,
  colorFrom = "#c4186a",
  colorTo = "#edb215",
  delay = 0,
}: BorderBeamProps) {
  return (
    <div
      style={
        {
          "--size": size,
          "--duration": duration,
          "--anchor": anchor,
          "--border-width": borderWidth,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          "--delay": `-${delay}s`,
        } as React.CSSProperties
      }
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent]",
        "![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)]",
        "after:absolute after:aspect-square after:w-[calc(var(--size)*1px)] after:animate-border-beam after:[animation-delay:var(--delay)] after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)] after:[offset-anchor:calc(var(--anchor)*1%)_50%] after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]",
        className,
      )}
    />
  );
}
