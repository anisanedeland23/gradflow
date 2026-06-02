"use client";

import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition active:scale-[0.98]"
      style={{
        background: "var(--gf-card)",
        color: "var(--gf-ink)",
        borderColor: "var(--gf-border-strong)",
      }}
      aria-label="Toggle theme"
    >
      <span className="text-base">{isDarkMode ? "🌙" : "☀️"}</span>

      <span>{isDarkMode ? "Night" : "Light"}</span>
    </button>
  );
}
