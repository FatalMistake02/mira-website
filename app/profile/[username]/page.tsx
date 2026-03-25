import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileByUsername, getProfileThemes } from "@/lib/themes/queries";
import { createClient } from "@/lib/supabase/server";
import { ThemeGrid } from "@/components/themes/theme-grid";
import { getSiteUrl } from "@/lib/site-url";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);

  if (!profile) {
    return {
      title: "Profile Not Found",
    };
  }

  const displayName = profile.display_name || profile.username || "User";

  return {
    title: `${displayName} - Mira Themes`,
    description: profile.bio || `Themes by ${displayName}`,
    alternates: {
      canonical: `${getSiteUrl()}/profile/${username}`,
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const [profile, supabase] = await Promise.all([
    getProfileByUsername(username),
    createClient(),
  ]);

  if (!profile) {
    notFound();
  }

  const themes = await getProfileThemes(profile.id);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = user && user.id === profile.id;
  const displayName = profile.display_name || profile.username || "User";

  return (
    <main className="section page-enter">
      <div className="container">
        <div className="profile-header animate-fade-up">
          <div className="profile-avatar">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="profile-avatar-img"
              />
            ) : (
              <div className="profile-avatar-fallback">
                {displayName[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h1>{displayName}</h1>
            {profile.username && (
              <p className="profile-username">@{profile.username}</p>
            )}
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            {isOwner && (
              <Link href="/profile/edit" className="btn btn-ghost">
                Edit Profile
              </Link>
            )}
          </div>
        </div>

        <div className="profile-themes animate-fade-up" style={{ animationDelay: "120ms" }}>
          <h2>Themes ({themes.length})</h2>
          <ThemeGrid themes={themes} />
        </div>
      </div>
    </main>
  );
}
