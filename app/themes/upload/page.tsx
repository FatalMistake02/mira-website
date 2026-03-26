import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { UploadForm } from "@/components/themes/upload-form";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Upload Theme",
  description: "Upload a new theme to the Mira themes marketplace.",
  alternates: {
    canonical: `${getSiteUrl()}/themes/upload`,
  },
};

export default async function UploadPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get profile for pre-filled author name
  let authorName = "";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();
    authorName = profile?.display_name || user.email?.split("@")[0] || "";
  }

  return (
    <main className="section page-enter">
      <div className="container narrow">
        <h1 className="animate-fade-up">Upload Theme</h1>

        <div className="upload-form-wrapper animate-fade-up" style={{ animationDelay: "160ms" }}>
          <UploadForm
            userId={user?.id}
            authorName={authorName}
          />
        </div>
      </div>
    </main>
  );
}
