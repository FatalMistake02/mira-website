import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: theme, error } = await supabase
    .from("themes")
    .select("css_content")
    .eq("id", id)
    .single();

  if (error || !theme) {
    return NextResponse.json({ error: "Theme not found" }, { status: 404 });
  }

  return NextResponse.json(theme);
}
