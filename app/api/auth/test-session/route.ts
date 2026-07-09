import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// --- FAKE IN-MEMORY DATABASE ---
// In a real app, these would be actual database tables
const FAKE_USER_DB: Record<string, any> = {}; 
const FAKE_SESSIONS: Record<string, string> = {}; 

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    // 1. Simulate the 3rd party app's API Key
    // In a real scenario, the 3rd party server would store this in their .env
    const TEST_API_KEY = "test_key_123"; // Ensure this exists in your api_keys table!
    const TEST_DOMAIN = "mira.fatalmistake02.com";

    // 2. Call the verification logic (Internal check)
    const { data: keyData } = await supabaseAdmin
      .from("api_keys")
      .select("domain")
      .eq("key_value", TEST_API_KEY)
      .single();

    if (!keyData || keyData.domain !== TEST_DOMAIN) {
      return NextResponse.json({ error: "API Key invalid for this domain" }, { status: 401 });
    }

    const { data: tokenData } = await supabaseAdmin
      .from("auth_tokens")
      .select("user_id, redirect_url")
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (!tokenData) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const miraUserId = tokenData.user_id;

    // 3. Fake Database: Check if local user exists by Mira UUID
    if (!FAKE_USER_DB[miraUserId]) {
      console.log(`Creating new local user for Mira ID: ${miraUserId}`);
      FAKE_USER_DB[miraUserId] = {
        id: `local_${Math.random().toString(36).substr(2, 9)}`,
        miraId: miraUserId,
        createdAt: new Date().toISOString(),
      };
    }

    const localUser = FAKE_USER_DB[miraUserId];

    // 4. Generate a random session key
    const sessionKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    FAKE_SESSIONS[sessionKey] = localUser.id;

    // 5. Create Response with HttpOnly Cookie
    const response = NextResponse.json({
      success: true,
      user: localUser,
    });

    response.cookies.set("mira_test_session", sessionKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
