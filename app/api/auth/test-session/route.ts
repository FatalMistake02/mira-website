import { NextResponse } from "next/server";
import crypto from "node:crypto";

// --- FAKE IN-MEMORY DATABASE ---
// These represent the Client App's own local database
const FAKE_USER_DB: Record<string, any> = {}; 
const FAKE_SESSIONS: Record<string, string> = {}; 

// Configuration for the Auth Server
const AUTH_SERVER_URL = "https://mira.fatalmistake02.com/api/auth/verify";
const CLIENT_API_KEY = "test_key_123"; // This should be in your .env as process.env.MIRA_API_KEY

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // 1. CALL THE EXTERNAL AUTH SERVER
    // We send the token and our registered API Key to the central server
    const verifyResponse = await fetch(AUTH_SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: CLIENT_API_KEY,
        token: token,
      }),
    });

    const verifyData = await verifyResponse.json();

    // 2. Handle failures from the Auth Server
    if (!verifyResponse.ok || !verifyData.success) {
      return NextResponse.json(
        { error: verifyData.error || "Authentication failed at Auth Server" }, 
        { status: verifyResponse.status || 401 }
      );
    }

    // The Auth Server returned the user's identity
    const miraUser = verifyData.user; // { id, email, username }

    // 3. Local User Sync (Client App Database)
    // We use the miraUser.id (UUID) as the unique identifier to link accounts
    if (!FAKE_USER_DB[miraUser.id]) {
      console.log(`Creating new local account for Mira User: ${miraUser.id}`);
      FAKE_USER_DB[miraUser.id] = {
        id: `local_${crypto.randomBytes(16).toString('hex')}`,
        miraId: miraUser.id,
        email: miraUser.email,
        username: miraUser.username,
        createdAt: new Date().toISOString(),
      };
    }

    const localUser = FAKE_USER_DB[miraUser.id];

    // 4. Generate a local session key
    const sessionKey = crypto.randomBytes(32).toString('hex');
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
    console.error("Client Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
