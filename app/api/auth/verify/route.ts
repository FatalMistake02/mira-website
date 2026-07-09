import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use SERVICE_ROLE_KEY to bypass RLS and access internal auth.users table
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { apiKey, token } = body;

    if (!apiKey || !token) {
      return NextResponse.json({ error: "Missing API Key or Token" }, { status: 400 });
    }

    // 1. Check if API Key exists and get its assigned domain
    const { data: keyData, error: keyError } = await supabaseAdmin
      .from("api_keys")
      .select("domain")
      .eq("key_value", apiKey)
      .single();

    if (keyError || !keyData) {
      return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
    }

    const assignedDomain = keyData.domain;

    // 2. Find the token and get the redirect URL and user ID
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from("auth_tokens")
      .select("redirect_url, user_id")
      .eq("token", token)
      .gt("expires_at", new Date().toISOString()) // Ensure token isn't expired
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // 3. Check if the domain for the API Key matches the domain in the redirect URL
    try {
      const url = new URL(tokenData.redirect_url);
      const redirectDomain = url.hostname;

      if (redirectDomain !== assignedDomain) {
        return NextResponse.json(
          { error: "Domain mismatch. This token is not valid for this domain." }, 
          { status: 403 }
        );
      }
    } catch (e) {
      return NextResponse.json({ error: "Invalid redirect URL format" }, { status: 400 });
    }

    // 4. Get User Email from auth.users (via Admin API)
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(tokenData.user_id);
    
    if (authError || !authUser.user) {
      return NextResponse.json({ error: "User authentication record not found" }, { status: 404 });
    }

    // 5. Get Username from public.profiles
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("username")
      .eq("id", tokenData.user_id)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // SUCCESS: Return combined data
    return NextResponse.json({
      success: true,
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
        username: profileData.username,
      },
    });

  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
