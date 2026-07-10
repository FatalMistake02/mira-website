"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function AuthTestPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"idle" | "logging-in" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const initAuth = async () => {
      // 1. If there is a token in the URL, we prioritize verifying that token
      if (token) {
        await verifyToken(token);
      } else {
        // 2. Otherwise, check if we already have a valid session cookie
        await checkExistingSession();
      }
    };

    initAuth();
  }, [token]);

  // This function checks the server for an existing HttpOnly cookie
  const checkExistingSession = async () => {
    try {
      // We send an empty object or nothing because we are relying on the cookie
      const response = await fetch("/api/auth/test-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), 
      });

      if (response.ok) {
        setStatus("success");
      } else {
        // If it's not OK (e.g., 401), we just stay "idle" 
        // so the user sees the "Login with Mira" button
        setStatus("idle");
      }
    } catch (e) {
      setStatus("idle");
    }
  };

  const verifyToken = async (tokenValue: string) => {
    setStatus("logging-in");
    try {
      const response = await fetch("/api/auth/test-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenValue }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Verification failed");
      }

      setStatus("success");
    } catch (e: any) {
      setErrorMessage(e.message);
      setStatus("error");
    }
  };

  const handleLoginClick = () => {
    const redirectUrl = encodeURIComponent("https://mira.fatalmistake02.com/auth/test");
    window.location.href = `https://mira.fatalmistake02.com/auth?redirectTo=${redirectUrl}`;
  };

  return (
    <div className="h-screen w-full flex items-center justify-center p-4" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 rounded-2xl border border-[var(--line)] bg-[var(--bg)] shadow-xl max-w-md w-full text-center"
      >
        <h1 className="text-2xl font-semibold mb-6">Mira Auth Test</h1>

        {status === "idle" && !token && (
          <button 
            onClick={handleLoginClick}
            className="w-full py-3 px-6 rounded-lg font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: "var(--primary)", color: "var(--bg)" }}
          >
            Login with Mira Auth
          </button>
        )}

        {status === "logging-in" && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-[var(--muted)]">Checking session...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-2">
              <i className="fa-solid fa-check text-white"></i>
            </div>
            <h2 className="text-xl font-bold">Logged In!</h2>
            <p className="text-xs text-[var(--muted)]">Session cookie has been set via HttpOnly.</p>
          </div>
        )}

        {status === "error" && (
          <div className="text-red-500">
            <p className="text-sm font-bold">Authentication Failed</p>
            <p className="text-xs">{errorMessage}</p>
            <button 
              onClick={() => setStatus("idle")} 
              className="mt-4 text-xs underline text-[var(--text)]"
            >
              Try again
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
