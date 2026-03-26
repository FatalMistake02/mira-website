"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveTheme(themeId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("themes")
    .update({ status: "approved" })
    .eq("id", themeId);

  if (error) {
    throw new Error("Failed to approve theme: " + error.message);
  }

  revalidatePath("/admin/review");
  revalidatePath("/themes");
  revalidatePath("/profile/[username]");
}

export async function rejectTheme(themeId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("themes")
    .update({ status: "rejected" })
    .eq("id", themeId);

  if (error) {
    throw new Error("Failed to reject theme: " + error.message);
  }

  revalidatePath("/admin/review");
}
