import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Edit Profile",
  description: "Update your Mira themes profile.",
  alternates: {
    canonical: `${getSiteUrl()}/profile/edit`,
  },
};

export default async function EditProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/themes?signin=true");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    notFound();
  }

  return (
    <main className="section page-enter">
      <div className="container narrow">
        <h1 className="animate-fade-up">Edit Profile</h1>
        <p className="muted-note animate-fade-up" style={{ animationDelay: "80ms" }}>
          Update your profile information.
        </p>

        <div className="upload-form-wrapper animate-fade-up" style={{ animationDelay: "160ms" }}>
          <EditProfileForm profile={profile} />
        </div>
      </div>
    </main>
  );
}
