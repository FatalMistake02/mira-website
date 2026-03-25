"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignInButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (provider: "github" | "google") => {
    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-buttons">
      <button
        onClick={() => handleSignIn("github")}
        disabled={isLoading}
        className="btn btn-primary"
      >
        {isLoading ? "Signing in..." : "Sign in with GitHub"}
      </button>
      <button
        onClick={() => handleSignIn("google")}
        disabled={isLoading}
        className="btn btn-ghost"
      >
        {isLoading ? "Signing in..." : "Sign in with Google"}
      </button>
    </div>
  );
}
