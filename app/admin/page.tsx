import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
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

  // Fetch stats
  const { count: totalThemes } = await supabase
    .from("themes")
    .select("*", { count: "exact", head: true });

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: totalDownloads } = await supabase
    .from("themes")
    .select("download_count", { count: "exact", head: true });

  const { count: pendingThemes } = await supabase
    .from("themes")
    .select("*", { count: "exact", head: true })
    .eq("status", "under_review");

  const { data: recentThemes } = await supabase
    .from("themes")
    .select("id, name, author_name, created_at, download_count")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <main className="section page-section">
      <div className="container">
        <h1 className="animate-fade-up">Admin Dashboard</h1>
        
        <div className="admin-actions animate-fade-up" style={{ animationDelay: "40ms" }}>
          <Link href="/admin/review" className="btn btn-primary admin-review-btn">
            Review Themes
            {pendingThemes && pendingThemes > 0 && (
              <span className="admin-badge">{pendingThemes}</span>
            )}
          </Link>
        </div>
        
        <div className="admin-stats animate-fade-up" style={{ animationDelay: "80ms" }}>
          <div className="stat-card">
            <h3>{totalThemes || 0}</h3>
            <p>Total Themes</p>
          </div>
          <div className="stat-card">
            <h3>{totalUsers || 0}</h3>
            <p>Total Users</p>
          </div>
          <div className="stat-card">
            <h3>{totalDownloads || 0}</h3>
            <p>Total Downloads</p>
          </div>
        </div>

        <section className="admin-section animate-fade-up" style={{ animationDelay: "120ms" }}>
          <h2>Recent Themes</h2>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Author</th>
                  <th>Downloads</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentThemes?.map((theme) => (
                  <tr key={theme.id}>
                    <td>{theme.name}</td>
                    <td>{theme.author_name}</td>
                    <td>{theme.download_count}</td>
                    <td>{new Date(theme.created_at).toLocaleDateString()}</td>
                    <td>
                      <a href={`/themes/${theme.id}`} className="admin-link">
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
