"use client";

import { useEffect, useMemo, useState } from "react";

type SlotAsset = {
  name: string;
  browser_download_url: string;
};

type DownloadSlot = {
  label: string;
  platform: "windows" | "mac-arm64" | "mac-x64";
  asset: SlotAsset | null;
};

type DownloadCardsProps = {
  slots: DownloadSlot[];
};

type DetectedOS = "windows" | "mac-arm64" | "mac-x64" | "mac" | "other" | "unknown";

function normalizeArchitecture(value: string | undefined, allowX64 = true): "arm64" | "x64" | null {
  if (!value) {
    return null;
  }

  const lower = value.toLowerCase();
  if (
    lower.includes("arm64") ||
    lower.includes("aarch64") ||
    lower === "arm" ||
    lower.includes("apple-silicon")
  ) {
    return "arm64";
  }

  if (allowX64 && (lower.includes("x64") || lower.includes("x86_64") || lower.includes("amd64"))) {
    return "x64";
  }

  return null;
}

async function detectOS(): Promise<DetectedOS> {
  if (typeof window === "undefined") {
    return "other";
  }

  if (process.env.NODE_ENV === "development") {
    const forced = new URLSearchParams(window.location.search).get("os")?.toLowerCase();
    if (forced === "windows" || forced === "win") {
      return "windows";
    }
    if (forced === "mac-arm64" || forced === "arm64" || forced === "mac-arm" || forced === "macos-arm64") {
      return "mac-arm64";
    }
    if (
      forced === "mac-x64" ||
      forced === "x64" ||
      forced === "intel" ||
      forced === "mac-intel" ||
      forced === "macos-x64"
    ) {
      return "mac-x64";
    }
    if (forced === "mac" || forced === "macos") {
      return "mac";
    }
  }

  const navigatorWithUAData = window.navigator as Navigator & {
    userAgentData?: {
      platform?: string;
      architecture?: string;
      getHighEntropyValues?: (
        hints: string[],
      ) => Promise<{ architecture?: string; platform?: string }>;
    };
  };
  const fromUserAgentData = navigatorWithUAData.userAgentData?.platform?.toLowerCase();
  let architecture = normalizeArchitecture(navigatorWithUAData.userAgentData?.architecture);

  if (!architecture && typeof navigatorWithUAData.userAgentData?.getHighEntropyValues === "function") {
    try {
      const highEntropy = await navigatorWithUAData.userAgentData.getHighEntropyValues(["architecture"]);
      architecture = normalizeArchitecture(highEntropy.architecture);
    } catch {
      // Ignore and continue with fallback parsing.
    }
  }

  if (fromUserAgentData?.includes("win")) {
    return "windows";
  }
  if (fromUserAgentData?.includes("mac")) {
    if (architecture === "arm64") {
      return "mac-arm64";
    }
    if (architecture === "x64") {
      return "mac-x64";
    }
    return "mac";
  }

  const platform = window.navigator.platform.toLowerCase();
  if (platform.includes("win")) {
    return "windows";
  }
  if (platform.includes("mac")) {
    if (architecture === "arm64") {
      return "mac-arm64";
    }
    if (architecture === "x64") {
      return "mac-x64";
    }
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  architecture = architecture ?? normalizeArchitecture(userAgent, false);
  if (userAgent.includes("windows")) {
    return "windows";
  }
  if (userAgent.includes("mac os")) {
    if (architecture === "arm64") {
      return "mac-arm64";
    }
    if (architecture === "x64") {
      return "mac-x64";
    }
    return "mac";
  }

  return "other";
}

function getRelevanceScore(slot: DownloadSlot, os: DetectedOS): number {
  if (os === "unknown" || os === "other") {
    return 0;
  }

  if (os === "windows") {
    return slot.platform === "windows" ? 0 : 2;
  }

  if (os === "mac-arm64") {
    if (slot.platform === "mac-arm64") {
      return 0;
    }
    if (slot.platform === "mac-x64") {
      return 1;
    }
    return 2;
  }

  if (os === "mac-x64") {
    if (slot.platform === "mac-x64") {
      return 0;
    }
    if (slot.platform === "mac-arm64") {
      return 1;
    }
    return 2;
  }

  if (os === "mac") {
    return slot.platform === "windows" ? 2 : 0;
  }

  return 0;
}

export function DownloadCards({ slots }: DownloadCardsProps) {
  const [os, setOs] = useState<DetectedOS>("unknown");

  useEffect(() => {
    let canceled = false;

    void detectOS().then((detectedOS) => {
      if (!canceled) {
        setOs(detectedOS);
      }
    });

    return () => {
      canceled = true;
    };
  }, []);

  const orderedSlots = useMemo(
    () => [...slots].sort((a, b) => getRelevanceScore(a, os) - getRelevanceScore(b, os)),
    [slots, os],
  );

  return (
    <>
      {orderedSlots.map((slot, idx) => {
        const isApplicable =
          os === "unknown" ||
          os === "other" ||
          (os === "mac" && (slot.platform === "mac-arm64" || slot.platform === "mac-x64")) ||
          slot.platform === os;
        const animationClass = isApplicable ? "animate-fade-up" : "animate-fade-up-muted";

        return (
          <article
            key={slot.label}
            className={`download-card ${animationClass} ${isApplicable ? "" : "inapplicable"}`}
            style={{ animationDelay: `${360 + idx * 120}ms` }}
          >
            <div>
              <h2>{slot.label}</h2>
              {slot.asset ? (
                <code>{slot.asset.name}</code>
              ) : (
                <p className="muted-note">Not available in this release.</p>
              )}
            </div>
            {slot.asset ? (
              <a
                href={slot.asset.browser_download_url}
                className={`btn ${isApplicable ? "btn-primary" : "btn-ghost"}`}
                target="_blank"
                rel="noreferrer"
              >
                Download
              </a>
            ) : (
              <span className="btn btn-ghost" aria-disabled="true">
                Unavailable
              </span>
            )}
          </article>
        );
      })}
    </>
  );
}
