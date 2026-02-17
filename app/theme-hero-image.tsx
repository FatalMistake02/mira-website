"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme-preference";
const THEME_EVENT = "theme-preference-change";

function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "light" || value === "dark" ? value : null;
}

function subscribeThemePreference(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(THEME_EVENT, handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(THEME_EVENT, handler);
  };
}

function subscribeSystemTheme(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = () => onStoreChange();
  media.addEventListener("change", handler);

  return () => media.removeEventListener("change", handler);
}

function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeHeroImage() {
  const storedTheme = useSyncExternalStore(
    subscribeThemePreference,
    getStoredTheme,
    () => null,
  );

  const systemPrefersDark = useSyncExternalStore(
    subscribeSystemTheme,
    getSystemPrefersDark,
    () => false,
  );

  const effectiveTheme: Theme = storedTheme ?? (systemPrefersDark ? "dark" : "light");
  const isLight = effectiveTheme === "light";

  return (
    <Image
      src={isLight ? "/assets/mira_app_light.png" : "/assets/mira_app.png"}
      alt="Screenshot of the Mira browser"
      width={isLight ? 3808 : 7680}
      height={isLight ? 2078 : 4220}
      priority
      quality={100}
      sizes="(max-width: 520px) 100vw, 980px"
      unoptimized
      className="hero-app-image"
    />
  );
}
