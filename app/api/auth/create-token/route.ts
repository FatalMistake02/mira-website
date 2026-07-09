// Modified app/api/auth/create-token/route.ts
import { createClient } from "@supabase/supabase-js"; // Use the raw JS client for admin tasks
import { NextResponse } from "next/server";
import crypto from "node:crypto";

export async function POST(req: Request) {
  try {
    // Use the SERVICE ROLE KEY here to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // <--- MUST be the Service Role Key
    );

    // We still need a standard client to check the user's session via cookies
    // Assuming your existing helper handles cookies:
    const { createClient: createServerClient } = await import("@/lib/supabase/server");
    const supabaseUserClient = await createServerClient();

    const { data: { user }, error: userError } = await supabaseUserClient.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { redirectUrl } = await req.json();
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + 30);

    // Insert using the ADMIN client
    const { error: insertError } = await supabaseAdmin
      .from("auth_tokens")
      .insert({
        user_id: user.id,
        token: token,
        redirect_url: redirectUrl,
        expires_at: expiresAt.toISOString(),
        used: false,
      });

    if (insertError) {
      console.error("DB Insert Error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
