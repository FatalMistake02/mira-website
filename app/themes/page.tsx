import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Themes",
  description: "Browse community themes for Mira and share your own.",
  alternates: {
    canonical: `${getSiteUrl()}/themes`,
  },
};

export default function ThemesPage() {
  return (
    <main
      className="section page-enter"
      style={{ minHeight: "70vh", display: "grid", placeItems: "center", textAlign: "center" }}
    >
      <h1 className="animate-fade-up" style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)", margin: 0 }}>
        Coming soon
      </h1>
    </main>
  );
}
