"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";

// In production, this should be process.env.NEXT_PUBLIC_SITE_URL
const BASE_URL = "https://mira.fatalmistake02.com";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirectTo");
  const isLinkMode = searchParams.get("link") === "true";

  const [user, setUser] = useState<any>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [lastMethod, setLastMethod] = useState<string | null>(null);

  const [loading, setLoading] = useState({
    email: false,
    google: false,
    github: false,
    continue: false, 
    logout: false, // Added loading state for logout
  });

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    window.scrollTo(0, 75);

    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsCheckingUser(false);
    };
    checkUser();

    const savedMethod = localStorage.getItem("auth_last_method");
    setLastMethod(savedMethod);
  }, []);

  const updateLastMethod = (method: string) => {
    setLastMethod(method);
    localStorage.setItem("auth_last_method", method);
  };

  const handleContinue = async () => {
    const targetPath = redirectParam || "/";
    setLoading((prev) => ({ ...prev, continue: true }));

    try {
      const response = await fetch("/api/auth/create-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redirectUrl: targetPath }),
      });

      if (!response.ok) throw new Error("Could not generate secure session token.");

      const { token } = await response.json();
      const separator = targetPath.includes("?") ? "&" : "?";
      const finalUrl = `${targetPath}${separator}token=${token}`;

      if (targetPath.startsWith("http://") || targetPath.startsWith("https://")) {
        window.location.href = finalUrl;
      } else {
        router.push(finalUrl);
      }
    } catch (error: any) {
      alert(error.message || "An unexpected error occurred");
    } finally {
      setLoading((prev) => ({ ...prev, continue: false }));
    }
  };

  // --- NEW LOGOUT FUNCTION ---
  const handleLogout = async () => {
    setLoading((prev) => ({ ...prev, logout: true }));
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      alert(error.message);
    } else {
      // Force a reload to clear the user state and return to the login screen
      window.location.href = "/auth";
    }
    setLoading((prev) => ({ ...prev, logout: false }));
  };

  const getFullRedirectUrl = () => {
    const callbackUrl = `${BASE_URL}/auth/callback`;
    let nextPath = `${BASE_URL}/auth`;
    if (isLinkMode) nextPath += `?link=true`;
    if (redirectParam) {
      nextPath += (nextPath.includes('?') ? '&' : '?') + `redirectTo=${encodeURIComponent(redirectParam)}`;
    }
    return `${callbackUrl}?next=${encodeURIComponent(nextPath)}`;
  };

  const handleOAuth = async (provider: string) => {
    updateLastMethod(provider);
    setLoading((prev) => ({ ...prev, [provider]: true }));
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: { redirectTo: getFullRedirectUrl() },
    });
    if (error) {
      console.error(error);
      setLoading((prev) => ({ ...prev, [provider]: false }));
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    updateLastMethod("email");
    setLoading({ ...loading, email: true });
    const supabase = createClient();

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { emailRedirectTo: getFullRedirectUrl() } 
      });
      if (error) alert(error.message);
      else alert("Check your email to confirm your account!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert(error.message);
      } else {
        const target = redirectParam 
            ? `${BASE_URL}/auth?redirectTo=${redirectParam}` 
            : `${BASE_URL}/auth`;
        window.location.href = target;
      }
    }
    setLoading({ ...loading, email: false });
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) return alert("Please enter your email first");
    setLoading({ ...loading, email: true });
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) alert(error.message);
    else alert("Password reset link sent to your email!");
    setLoading({ ...loading, email: false });
  };

  const LastUsedBadge = ({ method }: { method: string }) => {
    if (lastMethod !== method) return null;
    return (
      <div 
        className="absolute -top-2 -right-2 z-10 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tighter shadow-sm transition-all"
        style={{ backgroundColor: "var(--primary)", color: "var(--bg)", border: "1px solid var(--line)" }}
      >
        Last used
      </div>
    );
  };

  return (
    <div className="h-screen w-full flex items-center justify-center p-4 overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
      
      {isCheckingUser ? (
        <div className="animate-pulse text-sm text-[var(--muted)]">Loading...</div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-xs text-center"
        >
          <div className="flex flex-col gap-4">
            {user ? (
              <div className="flex flex-col gap-3">
                {isLinkMode ? (
                  <div className="mb-2">
                    <h2 className="text-sm font-bold" style={{ color: "var(--text)" }}>Connect Other Providers</h2>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>{user.email}</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="mb-2">
                      <h2 className="text-sm font-bold" style={{ color: "var(--text)" }}>Welcome Back</h2>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>{user.email}</p>
                    </div>
                    <button 
                      onClick={handleContinue} 
                      disabled={loading.continue}
                      className="btn btn-primary w-full py-2 text-sm"
                      style={{ cursor: loading.continue ? "not-allowed" : "pointer" }}
                    >
                      {loading.continue ? "Loading..." : `Continue as ${user.email}`}
                    </button>
                    
                    {/* --- LOGOUT BUTTON --- */}
                    <button 
                      onClick={handleLogout}
                      disabled={loading.logout}
                      className="w-full py-2 text-xs font-medium transition-colors hover:text-[var(--text)]"
                      style={{ color: "var(--muted)", cursor: "pointer", background: "none", border: "none" }}
                    >
                      {loading.logout ? "Signing out..." : "Sign out of account"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
                  <div className="relative flex flex-col gap-3">
                    <LastUsedBadge method="email" />
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2 text-sm outline-none transition-colors"
                      style={{ backgroundColor: "var(--bg)", border: "1px solid var(--line)", color: "var(--text)", borderRadius: "8px", cursor: "text" }}
                    />
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2 text-sm outline-none transition-colors"
                        style={{ backgroundColor: "var(--bg)", border: "1px solid var(--line)", color: "var(--text)", borderRadius: "8px", cursor: "text" }}
                      />
                      <button 
                        onClick={handleForgotPassword}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-tight"
                        style={{ color: "var(--muted)", cursor: "pointer", background: "none", border: "none" }}
                      >
                        Forgot?
                      </button>
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading.email} 
                      className="btn btn-primary w-full py-2 text-sm"
                      style={{ cursor: "pointer" }}
                    >
                      {loading.email ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
                    </button>
                  </div>
                </form>

                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button 
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="font-bold underline"
                    style={{ color: "var(--text)", cursor: "pointer", background: "none", border: "none" }}
                  >
                    {isSignUp ? "Sign In" : "Sign Up"}
                  </button>
                </p>
              </>
            )}

            {!user ? (
              <div className="relative my-2 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--line)]"></div>
                </div>
                <span className="relative bg-[var(--bg)] px-2 text-xs font-medium text-[var(--muted)]">
                  OR
                </span>
              </div>
            ) : null}

            {(user && isLinkMode) || !user ? (
              <div className="flex flex-col gap-4">
                <div className="relative w-full">
                  <LastUsedBadge method="github" />
                  <button
                    onClick={() => handleOAuth("github")}
                    disabled={loading.github}
                    className="btn btn-primary w-full gap-3"
                    style={{ cursor: "pointer" }}
                  >
                    {loading.github ? "..." : (
                    <>
                      <i className="fa-brands fa-github"></i>
                      <span className="text-sm">{user && isLinkMode ? "Link GitHub" : user ? "Connect GitHub" : "GitHub"}</span>
                    </>
                    )}
                  </button>
                </div>

                <div className="relative w-full">
                  <LastUsedBadge method="google" />
                  <button
                    onClick={() => handleOAuth("google")}
                    disabled={loading.google}
                    className="btn btn-ghost w-full gap-3"
                    style={{ color: "var(--text)", cursor: "pointer" }}
                  >
                    {loading.google ? "..." : (
                    <>
                      <i className="fa-brands fa-google"></i>
                      <span className="text-sm">{user && isLinkMode ? "Link Google" : user ? "Connect Google" : "Google"}</span>
                    </>
                    )}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      )}
    </div>
  );
}
