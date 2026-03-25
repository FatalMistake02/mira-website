"use client";

import Link from "next/link";
import type { Theme } from "@/lib/themes/types";

interface ThemeCardProps {
  theme: Theme;
}

export function ThemeCard({ theme }: ThemeCardProps) {
  const authorUsername = theme.profiles?.username;
  const authorDisplayName = theme.profiles?.display_name || theme.author_name;

  return (
    <article className="theme-card">
      <Link href={`/themes/${theme.id}`} className="theme-card-link">
        <div className="theme-card-preview">
          {theme.preview_image_url ? (
            <img
              src={theme.preview_image_url}
              alt={`${theme.name} preview`}
              className="theme-card-image"
            />
          ) : (
            <div className="theme-card-placeholder">
              <span>No preview</span>
            </div>
          )}
        </div>
        <div className="theme-card-content">
          <h3 className="theme-card-title">{theme.name}</h3>
          <p className="theme-card-author">
            by{" "}
            {authorUsername ? (
              <Link
                href={`/profile/${authorUsername}`}
                className="theme-card-author-link"
                onClick={(e) => e.stopPropagation()}
              >
                {authorDisplayName}
              </Link>
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
          <div className="theme-card-meta">
            <span className="theme-card-downloads">
              {theme.download_count} downloads
            </span>
            <span className="theme-card-version">v{theme.version}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
