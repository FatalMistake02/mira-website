// lib/auth.ts
import { cookies } from "next/headers";

// Move your "DBs" here so they are shared across the whole app
export const FAKE_USER_DB: Record<string, any> = {}; 
export const FAKE_SESSIONS: Record<string, string> = {}; 

export async function getAuthenticatedUser() {
  const cookieStore = await cookies(); 
  const sessionKey = cookieStore.get("mira_test_session")?.value;

  if (!sessionKey) return null;

  const userId = FAKE_SESSIONS[sessionKey];
  if (!userId) return null;

  const user = Object.values(FAKE_USER_DB).find(u => u.id === userId);
  return user || null;
}
