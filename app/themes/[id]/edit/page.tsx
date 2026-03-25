import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getThemeById } from "@/lib/themes/queries";
import { createClient } from "@/lib/supabase/server";
import { EditThemeForm } from "@/components/themes/edit-theme-form";
import { getSiteUrl } from "@/lib/site-url";

interface EditThemePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EditThemePageProps): Promise<Metadata> {
  const { id } = await params;
  const theme = await getThemeById(id);

  if (!theme) {
    return {
      title: "Theme Not Found",
    };
  }

  return {
    title: `Edit ${theme.name} - Mira Theme`,
    alternates: {
      canonical: `${getSiteUrl()}/themes/${id}/edit`,
    },
  };
}

export default async function EditThemePage({ params }: EditThemePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/themes?signin=true");
  }

  const theme = await getThemeById(id);

  if (!theme) {
    notFound();
  }

  // Check ownership
  const isOwner = theme.user_id === user.id;

  if (!isOwner) {
    return (
      <main className="section page-enter">
        <div className="container narrow">
          <div className="error-message">
            <h1>Access Denied</h1>
            <p>You can only edit themes that you own.</p>
            <Link href={`/themes/${theme.id}`} className="btn btn-primary">
              Back to Theme
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="section page-enter">
      <div className="container narrow">
        <h1 className="animate-fade-up">Edit Theme</h1>
        <p className="muted-note animate-fade-up" style={{ animationDelay: "80ms" }}>
          Update your theme details.
        </p>

        <div className="upload-form-wrapper animate-fade-up" style={{ animationDelay: "160ms" }}>
          <EditThemeForm theme={theme} />
        </div>
      </div>
    </main>
  );
}
