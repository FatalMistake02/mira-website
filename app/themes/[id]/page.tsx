import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getThemeById, getThemeVersions } from "@/lib/themes/queries";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { DownloadButton } from "./download-button";
import { ThemePreview } from "@/components/themes/theme-preview";

interface ThemeDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ThemeDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const theme = await getThemeById(id);

  if (!theme) {
    return {
      title: "Theme Not Found",
    };
  }

  return {
    title: `${theme.name} - Mira Theme`,
    description: theme.description || `A theme for Mira browser by ${theme.author_name}`,
    alternates: {
      canonical: `${getSiteUrl()}/themes/${id}`,
    },
  };
}

export default async function ThemeDetailPage({ params }: ThemeDetailPageProps) {
  const { id } = await params;
  const [theme, versions, supabase] = await Promise.all([
    getThemeById(id),
    getThemeVersions(id),
    createClient(),
  ]);

  if (!theme) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = user && theme.user_id === user.id;
  const authorUsername = theme.profiles?.username;
  const authorDisplayName = theme.profiles?.display_name || theme.author_name;

  return (
    <main className="section page-enter">
      <div className="container">
        <div className="theme-detail animate-fade-up">
          <div className="theme-detail-header">
            <div className="theme-detail-info">
              <h1>{theme.name}</h1>
              <p className="theme-detail-author">
                by{" "}
                {authorUsername ? (
                  <Link href={`/profile/${authorUsername}`}>{authorDisplayName}</Link>
                ) : (
                  theme.author_name
                )}
              </p>
              {theme.description && (
                <p className="theme-detail-description">{theme.description}</p>
              )}
              {theme.theme_tags && theme.theme_tags.length > 0 && (
                <div className="theme-detail-tags">
                  {theme.theme_tags.map(({ tags }) => (
                    <Link
                      key={tags.id}
                      href={`/themes?tag=${tags.slug}`}
                      className="theme-tag"
                    >
                      {tags.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="theme-detail-actions">
              <DownloadButton
                themeId={theme.id}
                themeName={theme.name}
                authorName={theme.author_name}
                version={theme.version}
                cssContent={theme.css_content}
              />
              {isOwner && (
                <Link
                  href={`/themes/${theme.id}/edit`}
                  className="btn btn-ghost"
                >
                  Update Theme
                </Link>
              )}
            </div>
          </div>

          {theme.preview_image_url && (
            <div className="theme-detail-preview">
              <img
                src={theme.preview_image_url}
                alt={`${theme.name} preview`}
                className="theme-detail-image"
              />
            </div>
          )}

          <div className="theme-detail-meta">
            <div className="theme-meta-item">
              <span className="theme-meta-label">Downloads</span>
              <span className="theme-meta-value">{theme.download_count}</span>
            </div>
            <div className="theme-meta-item">
              <span className="theme-meta-label">Created</span>
              <span className="theme-meta-value">
                {new Date(theme.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="theme-meta-item">
              <span className="theme-meta-label">Version</span>
              <span className="theme-meta-value">{theme.version}</span>
            </div>
          </div>

          {versions.length > 0 && (
            <div className="theme-versions">
              <h2>Version History</h2>
              <ul className="theme-versions-list">
                {versions.map((v) => (
                  <li key={v.id} className="theme-version-item">
                    <span className="theme-version-number">{v.version}</span>
                    <span className="theme-version-date">
                      {new Date(v.created_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="theme-detail-preview-section">
            <h2>Preview</h2>
            <ThemePreview cssContent={theme.css_content} />
          </div>
        </div>
      </div>
    </main>
  );
}
