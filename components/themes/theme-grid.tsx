"use client";

import { ThemeCard } from "./theme-card";
import type { Theme } from "@/lib/themes/types";

interface ThemeGridProps {
  themes: Theme[];
}

export function ThemeGrid({ themes }: ThemeGridProps) {
  if (themes.length === 0) {
    return (
      <div className="theme-grid-empty">
        <p>No themes found.</p>
      </div>
    );
  }

  return (
    <div className="theme-grid">
      {themes.map((theme) => (
        <ThemeCard key={theme.id} theme={theme} />
      ))}
    </div>
  );
}
