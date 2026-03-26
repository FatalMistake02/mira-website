import type { Metadata } from "next";
import Link from "next/link";
import { getThemes, getTags } from "@/lib/themes/queries";
import { ThemeGrid } from "@/components/themes/theme-grid";
import { SearchBar } from "@/components/themes/search-bar";
import { ThemeFilters } from "@/components/themes/theme-filters";
import { SignInModalWrapper } from "./sign-in-modal-wrapper";
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
          <h1 className="animate-fade-up">Themes</h1>
          <div className="themes-header-actions">
            {!user && (
              <Link href="/themes?signin=true" className="btn btn-ghost">
                Sign in
              </Link>
            )}
            <Link href="/themes/upload" className="btn btn-primary">
              Upload Theme
            </Link>
          </div>
        </div>

        <div className="themes-toolbar animate-fade-up" style={{ animationDelay: "160ms" }}>
          <SearchBar initialValue={search} />
        </div>

        <div className="themes-layout animate-fade-up" style={{ animationDelay: "240ms" }}>
          <aside className="themes-sidebar">
            <ThemeFilters
              tags={tags}
              selectedTag={tag}
              sortBy={sortBy}
            />
          </aside>

          <div className="themes-content">
            <ThemeGrid themes={themes} />
          </div>
        </div>
      </div>

      <SignInModalWrapper isOpen={showSignIn} />
    </main>
  );
}
