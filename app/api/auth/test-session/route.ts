import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";

// 1. Define interfaces to replace 'any'
interface LocalUser {
  id: string;
  miraId: string;
  email: string;
  username: string;
  createdAt: string;
}

interface MiraUser {
  id: string;
  email: string;
  username: string;
}

// --- FAKE IN-MEMORY DATABASE ---
const FAKE_USER_DB: Record<string, LocalUser> = {}; 
const FAKE_SESSIONS: Record<string, string> = {}; 

const AUTH_SERVER_URL = "https://mira.fatalmistake02.com/api/auth/verify";
const CLIENT_API_KEY = "mira_a9dcf802fbfa9caed71aa34f4d591247d3bbb8ce4e6ee19377335b8c81cdb3c2";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies(); 
    const existingSession = cookieStore.get("mira_test_session");

    let body: { token?: string } = {};
    try {
      body = await req.json();
    } catch {}
    
    const token = body.token;

    // --- SESSION VALIDATION ---
    if (existingSession) {
      const sessionKey = existingSession.value;
      const localUserId = FAKE_SESSIONS[sessionKey];

      if (!localUserId) {
        return NextResponse.json(
          { error: "Session expired or invalid. Please login again." }, 
          { status: 401 }
        );
      }

      const localUser = Object.values(FAKE_USER_DB).find(u => u.id === localUserId);

      if (!localUser) {
        return NextResponse.json(
          { error: "User account not found in local database." }, 
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user: localUser,
        message: "Authenticated via existing session",
      });
    }

    // --- TOKEN VERIFICATION ---
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const verifyResponse = await fetch(AUTH_SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: CLIENT_API_KEY,
        token: token,
      }),
    });

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok || !verifyData.success) {
      return NextResponse.json(
        { error: verifyData.error || "Authentication failed at Auth Server" }, 
        { status: verifyResponse.status || 401 }
      );
    }

    const miraUser = verifyData.user as MiraUser;

    // Local User Sync
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

    // Generate a new session key
    const newSessionKey = crypto.randomBytes(32).toString('hex');
    FAKE_SESSIONS[newSessionKey] = localUser.id;

    const response = NextResponse.json({
      success: true,
      user: localUser,
    });

    response.cookies.set("mira_test_session", newSessionKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, 
    });

    return response;
  } catch (error) {
    console.error("Client Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
