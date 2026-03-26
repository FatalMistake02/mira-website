"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface UserMenuProps {
  initialUser: User | null;
}

export function UserMenu({ initialUser }: UserMenuProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsOpen(false);
    window.location.reload();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="user-menu-trigger"
        aria-label="User menu"
      >
        <div className="user-avatar">
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt=""
              className="user-avatar-img"
            />
          ) : (
            <span className="user-avatar-fallback">
              {user.email?.[0].toUpperCase() || "U"}
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="user-menu-dropdown">
          <div className="user-menu-header">
            <p className="user-menu-email">{user.email}</p>
          </div>
          <div className="user-menu-links">
            <Link
              href={`/profile/${user.user_metadata?.user_name || user.id}`}
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
            <Link href="/profile/edit" onClick={() => setIsOpen(false)}>
              Edit Profile
            </Link>
          </div>
          <div className="user-menu-footer">
            <button onClick={handleSignOut} className="user-menu-signout">
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
