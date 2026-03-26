"use client";

import { useTransition, useRef } from "react";
import { incrementDownloadCount } from "./actions";

interface DownloadButtonProps {
  themeId: string;
  themeName: string;
  authorName: string;
  version: string;
  cssContent: string;
}

export function DownloadButton({ themeId, themeName, authorName, version, cssContent }: DownloadButtonProps) {
  const [isPending, startTransition] = useTransition();
  const linkRef = useRef<HTMLAnchorElement>(null);

  // Build download URL from theme data
  const themeData = JSON.parse(cssContent || "{}");
  const outputJson = {
    name: themeName,
    author: authorName,
    version: version,
    mode: themeData.mode || "dark",
    fonts: themeData.fonts || {},
    colors: themeData.colors || {},
  };
  const jsonString = JSON.stringify(outputJson, null, 2);
  const downloadUrl = `data:application/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
  const downloadName = `${themeName.toLowerCase().replace(/\s+/g, "-")}.json`;

  const handleClick = () => {
    startTransition(async () => {
      // Try to increment count - will only succeed if not on cooldown
      await incrementDownloadCount(themeId);
      
      // Always trigger the download
      linkRef.current?.click();
    });
  };

  const buttonText = isPending ? "Downloading..." : "Download";

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isPending}
        className="btn btn-primary"
      >
        {buttonText}
      </button>
      {/* Hidden anchor for actual download */}
      <a
        ref={linkRef}
        href={downloadUrl}
        download={downloadName}
        style={{ display: "none" }}
      />
    </>
  );
}
