"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/analyzer", label: "Analyzer" },
  { href: "/focus", label: "Focus Table" },
];

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Gradient accent line at very top of page */}
      <div
        className="fixed top-0 left-0 right-0 z-[60] h-[3px]"
        style={{
          background: "linear-gradient(90deg, var(--color-waste), var(--color-reclaim), var(--color-gold))",
        }}
      />

      <nav
        className="sticky top-[3px] z-50 backdrop-blur-md border-b"
        style={{
          backgroundColor: "rgba(243, 237, 225, 0.85)",
          borderColor: "var(--color-line)",
        }}
      >
        <div className="mx-auto max-w-6xl flex items-center justify-between px-5 h-16">
          {/* Wordmark */}
          <Link href="/" className="flex items-baseline gap-0 no-underline">
            <span
              className="text-2xl font-bold tracking-tight"
              style={{
                fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
                color: "var(--color-ink)",
              }}
            >
              Focus
            </span>
            <span
              className="text-2xl font-bold tracking-tight"
              style={{
                fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
                color: "var(--color-waste)",
              }}
            >
              Lab
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium no-underline transition-colors duration-150 hover:opacity-70"
                style={{ color: "var(--color-ink-soft)" }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="sm:hidden flex items-center justify-center w-9 h-9 rounded-md transition-colors duration-150"
            style={{ color: "var(--color-ink)" }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div
            className="sm:hidden border-t px-5 pb-4 pt-2"
            style={{
              borderColor: "var(--color-line)",
              backgroundColor: "var(--color-paper)",
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2.5 text-sm font-medium no-underline transition-colors duration-150 hover:opacity-70"
                style={{ color: "var(--color-ink-soft)" }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}
