"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export async function incrementDownloadCount(themeId: string): Promise<boolean> {
  const supabase = await createClient();

  // Get current user (null if anonymous)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get IP address from headers
  const headersList = await headers();
  const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "127.0.0.1";

  // Call the database function to increment download with validation
  const { data: success, error } = await supabase.rpc("increment_download_count", {
    p_theme_id: themeId,
    p_user_id: user?.id || null,
    p_ip_address: ipAddress.split(",")[0].trim(), // Take first IP if multiple
  });

  if (error) {
    console.error("Error incrementing download count:", error);
    return false;
  }

  return success || false;
}

export async function checkDownloadCooldown(themeId: string): Promise<{ canDownload: boolean; hoursRemaining?: number }> {
  const supabase = await createClient();

  // Get current user (null if anonymous)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get IP address from headers
  const headersList = await headers();
  const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "127.0.0.1";
  const cleanIp = ipAddress.split(",")[0].trim();

  // Check recent download by user_id
  if (user) {
    const { data: userDownload } = await supabase
      .from("download_logs")
      .select("downloaded_at")
      .eq("theme_id", themeId)
      .eq("user_id", user.id)
      .gt("downloaded_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("downloaded_at", { ascending: false })
      .limit(1)
      .single();

    if (userDownload) {
      const hoursRemaining = 24 - Math.floor((Date.now() - new Date(userDownload.downloaded_at).getTime()) / (1000 * 60 * 60));
      return { canDownload: false, hoursRemaining: Math.max(1, hoursRemaining) };
    }
  }

  // Check recent download by IP
  const { data: ipDownload } = await supabase
    .from("download_logs")
    .select("downloaded_at")
    .eq("theme_id", themeId)
    .eq("ip_address", cleanIp)
    .gt("downloaded_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order("downloaded_at", { ascending: false })
    .limit(1)
    .single();

  if (ipDownload) {
    const hoursRemaining = 24 - Math.floor((Date.now() - new Date(ipDownload.downloaded_at).getTime()) / (1000 * 60 * 60));
    return { canDownload: false, hoursRemaining: Math.max(1, hoursRemaining) };
  }

  return { canDownload: true };
}
