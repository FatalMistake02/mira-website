import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ReviewThemeActions } from "./ReviewThemeActions";

export default async function ReviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  // Fetch pending themes
  const { data: pendingThemes } = await supabase
    .from("themes")
    .select("*")
    .eq("status", "under_review")
    .order("created_at", { ascending: false });

  return (
    <main className="section page-section">
      <div className="container">
        <div className="review-header">
          <h1 className="animate-fade-up">Review Themes</h1>
          <Link href="/admin" className="btn btn-ghost">
            Back to Admin
          </Link>
        </div>

        {pendingThemes && pendingThemes.length > 0 ? (
          <div className="review-themes animate-fade-up" style={{ animationDelay: "80ms" }}>
            {pendingThemes.map((theme) => (
              <div key={theme.id} className="review-theme-card">
                <Link href={`/themes/${theme.id}`} className="review-theme-link">
                  <div className="review-theme-info">
                    <h3>{theme.name}</h3>
                    <p className="review-theme-author">by {theme.author_name}</p>
                    <p className="review-theme-date">
                      Submitted {new Date(theme.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="review-theme-version">
                    <span className="version-badge">v{theme.version}</span>
                  </div>
                </Link>
                <ReviewThemeActions themeId={theme.id} />
              </div>
            ))}
          </div>
        ) : (
          <div className="review-empty animate-fade-up" style={{ animationDelay: "80ms" }}>
            <p>No themes pending review.</p>
            <Link href="/admin" className="btn btn-primary">
              Back to Admin Dashboard
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
