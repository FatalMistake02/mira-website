"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Theme } from "@/lib/themes/types";
import { ThemePreview } from "./theme-preview";

interface ThemeCardProps {
  theme: Theme;
}

export function ThemeCard({ theme }: ThemeCardProps) {
  const router = useRouter();
  const authorUsername = theme.profiles?.username;
  const authorDisplayName = theme.profiles?.display_name || theme.author_name;

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (authorUsername) {
      router.push(`/profile/${authorUsername}`);
    }
  };

  return (
    <article className="theme-card">
      <Link href={`/themes/${theme.id}`} className="theme-card-link">
        <div className="theme-card-preview mini-preview">
          <ThemePreview cssContent={theme.css_content} />
        </div>
        <div className="theme-card-content">
          <h3 className="theme-card-title">{theme.name}</h3>
          <p className="theme-card-author">
            by{" "}
            {authorUsername ? (
              <span
                className="theme-card-author-link"
                onClick={handleAuthorClick}
                role="button"
                tabIndex={0}
              >
                {authorDisplayName}
              </span>
            ) : (
              <span>{theme.author_name}</span>
            )}
          </p>
          {theme.theme_tags && theme.theme_tags.length > 0 && (
            <div className="theme-card-tags">
              {theme.theme_tags.slice(0, 3).map(({ tags }) => (
                <span key={tags.id} className="theme-tag">
                  {tags.name}
                </span>
              ))}
            </div>
          )}
          {theme.status === "under_review" && (
            <div className="theme-card-status">
              <span className="status-badge under-review">Under Review</span>
            </div>
          )}
          <div className="theme-card-meta">
            <span className="theme-card-downloads">
              {theme.download_count} downloads
            </span>
            <span className="theme-card-version">{theme.version}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
