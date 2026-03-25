import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "@/components/auth/user-menu";
import { getSiteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Mira Browser",
  description: "An open source desktop browser that helps you get everything done.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const year = new Date().getFullYear();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{const t=localStorage.getItem('theme-preference');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;}}catch{}",
          }}
        />
      </head>
      <body>
        <div className="site-shell">
          <header className="site-header">
            <div className="container nav-wrap">
              <Link href="/" className="brand" aria-label="Mira home">
                <Image
                  src="/assets/mira.png"
                  alt="Mira"
                  width={140}
                  height={38}
                  className="brand-image"
                  priority
                />
              </Link>
              <div className="nav-controls">
                <nav className="nav-links" aria-label="Primary">
                  <Link href="/">Home</Link>
                  <Link href="/roadmap">Roadmap</Link>
                  <Link href="/downloads">Downloads</Link>
                  <Link href="/themes">Themes</Link>
                </nav>
                <ThemeToggle />
                <UserMenu initialUser={user} />
              </div>
            </div>
          </header>

          {children}

          <footer className="site-footer">
            <div className="container nav-wrap footer-nav-wrap">
              <p className="footer-brand">Mira Browser - MIT License - &copy; {year}</p>
              <nav className="nav-links" aria-label="Footer">
                <Link href="/">Home</Link>
                <Link href="/roadmap">Roadmap</Link>
                <Link href="/downloads">Downloads</Link>
                <Link href="/themes">Themes</Link>
                <Link href="/privacy">Privacy</Link>
                <a href="https://github.com/FatalMistake02/mira" target="_blank" rel="noreferrer">
                  GitHub
                </a>
                <a
                  href="https://github.com/FatalMistake02/mira/blob/main/LICENSE"
                  target="_blank"
                  rel="noreferrer"
                >
                  License
                </a>
              </nav>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
