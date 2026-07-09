import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { ThemeToggle } from "./theme-toggle";
import { UpdateBanner } from "./downloads/update-banner";
import { getLatestVersion } from "./lib/latest-version";
import { UserMenu } from "@/components/auth/user-menu";
import { DynamicNav } from "@/components/navigation/dynamic-nav";
import { DynamicHeaderImage } from "@/components/header/dynamic-header-image";
import { getSiteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Mira Studios",
  description: "An open source browser that helps you get everything done.",
  keywords: [
    "FatalMistake02",
    "Fatal Mistake 02",
    "Mira-Studios",
    "Mira Studios",
    "Kolbe Tessarzik",
    "kolbe-tessarzik",
    "Mira",
    "Browser",
    "Mira Browser",
    "efficient browser",
    "open source browser",
    "open-source browser",
    "customizable browser",
    "customizable themes",
    "browser themes",
    "themeable browser",
    "desktop browser",
    "Electron browser",
    "React browser",
    "MIT licensed browser",
    "easy to use",
    "ad blocker",
    "ad-blocker",
    "browser with ad blocker",
    "privacy-focused browser",
    "privacy browser",
    "mobile browser",
    "cross-platform browser",
    "phone browser",
    "iphone browser",
    "android browser",
    "tablet browser",
    "ipad browser",
    "mira browser",
    "mira office",
    "mira documents",
    "mira office suite",
    "mira type",
    "mira text editor",
    "mira deck",
    "mira presentation",
    "mira slides",
    "mira matrix",
    "mira sheets",
    "mira spreadsheet",
  ],
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
  const latestVersion = await getLatestVersion();

  // Check if user is admin
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.is_admin || false;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="theme-preference"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html:
              "try{const t=localStorage.getItem('theme-preference');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;}}catch{}",
          }}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="google-site-verification" content="RwpruDDKM5uiqVPr4VkMb4f6Luwz6vx1XXBqb2HebdQ" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"/>
      </head>
      <body>
        <div className="site-shell">
          <header className="site-header">
            <div className="container nav-wrap">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <DynamicHeaderImage />
                <UpdateBanner latestVersion={latestVersion} settingsUrl="mira://Updates" compact />
              </div>
              <div className="nav-controls">
                <DynamicNav isAdmin={isAdmin} />
                <nav className="mobile-links" aria-label="Mobile">
                  <Link href="/roadmap">Roadmap</Link>
                  <Link href="/downloads">Downloads</Link>
                </nav>
                <ThemeToggle />
                <UserMenu initialUser={user} />
              </div>
            </div>
          </header>

          {children}

          <footer className="site-footer">
            <div className="container nav-wrap footer-nav-wrap">
              <div className="flex flex-col gap-1">
                <Link href="/">
                  <Image src="/assets/miraStudios.webp" alt="Mira" width={160} height={68} className="ml-[-7px] mb-[-4px]" />
                </Link>
                <div className="nav-links">
                  <Link href="https://github.com/Mira-Studios" target="_blank" rel="noreferrer">GitHub</Link>
                </div>
                <div className="nav-links">
                  <Link href="https://github.com/Mira-Studios/mira/blob/main/LICENSE" target="_blank" rel="noreferrer" >MIT License - &copy; {year}</Link>
                </div>
                <p className="text-[10px] text-[var(--text-secondary)]">
                  Mira Studios and all associated names<br />and logos are All Rights Reserved.
                </p>
              </div>
              <nav aria-label="Footer" className="flex flex-row gap-4">
                <div className="flex flex-col gap-1 m-4">
                  <div className="nav-links">
                    <Link href="/browser" className="text-lg">Mira Browser</Link>
                  </div>
                  <div className="nav-links">
                    <Link href="/downloads">Downloads</Link>
                  </div>
                  <div className="nav-links">
                    <Link href="/roadmap">Roadmap</Link>
                  </div>
                  <div className="nav-links">
                    <Link href="/themes">Themes</Link>
                  </div>
                  <div className="nav-links">
                    <a href="https://github.com/Mira-Studios/mira" target="_blank" rel="noreferrer">
                      GitHub
                    </a>
                  </div>
                  <div className="nav-links">
                    <a
                    href="https://github.com/Mira-Studios/mira/blob/main/LICENSE"
                    target="_blank"
                    rel="noreferrer"
                  >
                    License
                  </a>
                  </div>
                  <div className="nav-links">
                    <Link href="/privacy">Privacy</Link>
                  </div>
                  <div className="nav-links">
                    <Link href="/terms">Terms</Link>
                  </div>
                </div>
                <span className="bg-[var(--muted)] h-[230px] w-[1px] self-center"></span>
                <div className="flex flex-col gap-1 m-4">
                  <div className="nav-links">
                    <Link href="/office" className="text-lg">miraOffice</Link>
                  </div>
                  <div className="nav-links">
                    <Link href="/office/downloads">Downloads</Link>
                  </div>
                  <div className="nav-links">
                    <Link href="/office/roadmap">Roadmap</Link>
                  </div>
                  <div className="nav-links">
                    <a href="https://github.com/Mira-Studios/mira-office" target="_blank" rel="noreferrer">
                      GitHub
                    </a>
                  </div>
                  <div className="nav-links">
                    <a
                    href="https://github.com/Mira-Studios/mira-office/blob/main/LICENSE"
                    target="_blank"
                    rel="noreferrer"
                  >
                    License
                  </a>
                  </div>
                  <div className="nav-links">
                    <Link href="/privacy">Privacy</Link>
                  </div>
                  <div className="nav-links">
                    <Link href="/terms">Terms</Link>
                  </div>
                </div>
                <span className="bg-[var(--muted)] h-[230px] w-[1px] self-center"></span>
                <div className="flex flex-col gap-1 m-4">
                  <div className="nav-links">
                    <Link href="/mail" className="text-lg">miraMail</Link>
                  </div>
                  <div className="nav-links">
                    <Link href="/mail/downloads">Downloads</Link>
                  </div>
                  <div className="nav-links">
                    <Link href="/mail/roadmap">Roadmap</Link>
                  </div>
                  <div className="nav-links">
                    <a href="https://github.com/Mira-Studios/mira-mail" target="_blank" rel="noreferrer">
                      GitHub
                    </a>
                  </div>
                  <div className="nav-links">
                    <a
                      href="https://github.com/Mira-Studios/mira-mail/blob/main/LICENSE"
                      target="_blank"
                      rel="noreferrer"
                    >
                      License
                    </a>
                  </div>
                  <div className="nav-links">
                    <Link href="/privacy">Privacy</Link>
                  </div>
                  <div className="nav-links">
                    <Link href="/terms">Terms</Link>
                  </div>
                </div>
              </nav>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
