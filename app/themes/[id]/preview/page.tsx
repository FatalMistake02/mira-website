"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemePreview } from "@/components/themes/theme-preview";

interface ThemeApiResponse {
  id: string;
  name: string;
  css_content: string;
}

export default function ThemePreviewPage() {
  const params = useParams();
  const [theme, setTheme] = useState<ThemeApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const response = await fetch(`/api/themes/${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch theme");
        const data: ThemeApiResponse = await response.json();
        setTheme(data);
      } catch {
        setError("Failed to load theme preview");
      }
    };
    fetchTheme();
  }, [params.id]);

  if (error) {
    return (
      <div className="theme-preview-page" style={{ padding: 40, textAlign: "center" }}>
        <p>{error}</p>
        <Link href={`/themes/${params.id}`}>Back to theme</Link>
      </div>
    );
  }

  if (!theme) {
    return (
      <div className="theme-preview-page" style={{ padding: 40, textAlign: "center" }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="theme-preview-page">
      <div className="theme-preview-page-header">
        <h1>Preview: {theme.name}</h1>
        <Link href={`/themes/${params.id}`} className="btn btn-ghost">
          Back to Theme
        </Link>
      </div>
      <div className="theme-preview-frame">
        <ThemePreview cssContent={theme.css_content} />
      </div>
    </div>
  );
}
