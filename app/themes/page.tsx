import type { Metadata } from "next";
import Link from "next/link";
import { getThemes, getTags } from "@/lib/themes/queries";
import { ThemeGrid } from "@/components/themes/theme-grid";
import { SearchBar } from "@/components/themes/search-bar";
import { ThemeFilters } from "@/components/themes/theme-filters";
import { SignInModal } from "@/components/auth/sign-in-modal";
import { getSiteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Themes Marketplace",
  description: "Browse and share themes for Mira browser.",
  alternates: {
    canonical: `${getSiteUrl()}/themes`,
  },
};

interface ThemesPageProps {
  searchParams: Promise<{
    search?: string;
    tag?: string;
    sort?: "newest" | "popular" | "name";
    signin?: string;
  }>;
}

export default async function ThemesPage({ searchParams }: ThemesPageProps) {
  const params = await searchParams;
  const search = params.search;
  const tag = params.tag;
  const sortBy = params.sort || "newest";
  const showSignIn = params.signin === "true";

  const [themes, tags, supabase] = await Promise.all([
    getThemes({ search, tag, sortBy }),
    getTags(),
    createClient(),
  ]);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="section page-enter">
      <div className="container">
        <div className="themes-header">
          <h1 className="animate-fade-up">Themes Marketplace</h1>
          <p className="muted-note animate-fade-up" style={{ animationDelay: "80ms" }}>
            Browse community themes for Mira and share your own.
          </p>
        </div>

        <div className="themes-toolbar animate-fade-up" style={{ animationDelay: "160ms" }}>
          <SearchBar
            initialValue={search}
            onSearch={(query) => {
              const url = new URL(window.location.href);
              if (query) {
                url.searchParams.set("search", query);
              } else {
                url.searchParams.delete("search");
              }
              window.location.href = url.toString();
            }}
          />
          <Link href="/themes/upload" className="btn btn-primary">
            Upload Theme
          </Link>
        </div>

        <div className="themes-layout animate-fade-up" style={{ animationDelay: "240ms" }}>
          <aside className="themes-sidebar">
            <ThemeFilters
              tags={tags}
              selectedTag={tag}
              sortBy={sortBy}
              onTagChange={(selectedTag) => {
                const url = new URL(window.location.href);
                if (selectedTag) {
                  url.searchParams.set("tag", selectedTag);
                } else {
                  url.searchParams.delete("tag");
                }
                window.location.href = url.toString();
              }}
              onSortChange={(sort) => {
                const url = new URL(window.location.href);
                url.searchParams.set("sort", sort);
                window.location.href = url.toString();
              }}
            />
          </aside>

          <div className="themes-content">
            <ThemeGrid themes={themes} />
          </div>
        </div>
      </div>

      <SignInModal isOpen={showSignIn} onClose={() => {}} />
    </main>
  );
}
