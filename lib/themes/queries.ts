import { createClient as createServerClient } from "@/lib/supabase/server";
import type { Theme, Profile, Tag, ThemeInput, ProfileInput } from "./types";

export async function getThemes({
  search,
  tag,
  sortBy = "newest",
  limit = 50,
  offset = 0,
}: {
  search?: string;
  tag?: string;
  sortBy?: "newest" | "popular" | "name";
  limit?: number;
  offset?: number;
}) {
  const supabase = await createServerClient();

  // Use inner join when filtering by tag, left join otherwise
  const selectQuery = tag
    ? `
      *,
      theme_tags!inner (
        tags!inner (id, name, slug)
      )
    `
    : `
      *,
      theme_tags (
        tags (id, name, slug)
      )
    `;

  let query = supabase
    .from("themes")
    .select(selectQuery)
    .eq("status", "approved");

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  if (tag) {
    query = query.eq("theme_tags.tags.slug", tag);
  }

  if (sortBy === "newest") {
    query = query.order("created_at", { ascending: false });
  } else if (sortBy === "popular") {
    query = query.order("download_count", { ascending: false });
  } else if (sortBy === "name") {
    query = query.order("name", { ascending: true });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching themes:", error);
    return [];
  }

  // Fetch profiles separately to avoid FK relationship issues
  const themes = (data || []) as Theme[];
  const userIds = themes.map(t => t.user_id).filter(Boolean);
  
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds);
    
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
    
    for (const theme of themes) {
      if (theme.user_id) {
        (theme as Theme & { profiles?: object }).profiles = profileMap.get(theme.user_id);
      }
    }
  }

  return themes;
}

export async function getThemeById(id: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("themes")
    .select(
      `
      *,
      theme_tags (
        tags (id, name, slug)
      )
    `
    )
    .eq("id", id)
    .eq("status", "approved")
    .single();

  if (error) {
    console.error("Error fetching theme:", error);
    return null;
  }

  const theme = data as Theme;

  // Fetch profile separately to avoid FK relationship issues
  if (theme.user_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", theme.user_id)
      .single();
    
    (theme as Theme & { profiles?: object }).profiles = profile || undefined;
  }

  return theme;
}

export async function getThemeVersions(themeId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("versions")
    .select("*")
    .eq("theme_id", themeId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching versions:", error);
    return [];
  }

  return data;
}

export async function getTags() {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching tags:", error);
    return [];
  }

  return data as Tag[];
}

export async function getProfileByUsername(username: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data as Profile;
}

export async function getProfileThemes(userId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("themes")
    .select(
      `
      *,
      theme_tags (
        tags (id, name, slug)
      )
    `
    )
    .eq("user_id", userId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching profile themes:", error);
    return [];
  }

  return data as Theme[];
}

export async function getAllProfileThemes(userId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("themes")
    .select(
      `
      *,
      theme_tags (
        tags (id, name, slug)
      )
    `
    )
    .eq("user_id", userId)
    .in("status", ["approved", "under_review"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching profile themes:", error);
    return [];
  }

  return data as Theme[];
}

export async function incrementDownloadCount(themeId: string) {
  const supabase = await createServerClient();

  const { error } = await supabase.rpc("increment_download_count", {
    theme_id: themeId,
  });

  if (error) {
    console.error("Error incrementing download count:", error);
  }
}
