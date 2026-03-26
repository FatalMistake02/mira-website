"use client";

interface BrowserPreviewProps {
  themeData: {
    mode?: string;
    fonts?: Record<string, string>;
    colors?: Record<string, string>;
  };
}

// Exact replica of Mira browser showing the NewTab page
export function BrowserPreview({ themeData }: BrowserPreviewProps) {
  const colors = themeData.colors || {};
  const fonts = themeData.fonts || {};

  // CSS variables matching the desktop app exactly
  const cssVars = {
    // Base theme colors
    "--bg": colors.bg || "#141414",
    "--tabBg": colors.tabBg || "#1d1d1d",
    "--tabBgHover": colors.tabBgHover || "#272727",
    "--tabBgActive": colors.tabBgActive || "#313131",
    "--tabText": colors.tabText || "#e8e8e8",
    "--tabTextHover": colors.tabTextHover || "#f2f2f2",
    "--tabTextActive": colors.tabTextActive || "#ffffff",
    "--tabBorder": colors.tabBorder || "#353535",
    "--tabBorderHover": colors.tabBorderHover || "#464646",
    "--tabBorderActive": colors.tabBorderActive || "#595959",
    "--text1": colors.text1 || "#e8e8e8",
    "--text2": colors.text2 || "#b9b9b9",
    "--text3": colors.text3 || "#8f8f8f",
    "--urlBarBg": colors.urlBarBg || "#181818",
    "--urlBarBgHover": colors.urlBarBgHover || "#202020",
    "--urlBarBgActive": colors.urlBarBgActive || "#282828",
    "--urlBarText": colors.urlBarText || "#efefef",
    "--urlBarTextPlaceholder": colors.urlBarTextPlaceholder || "#8b8b8b",
    "--urlBarBorder": colors.urlBarBorder || "#3a3a3a",
    "--urlBarBorderHover": colors.urlBarBorderHover || "#4b4b4b",
    "--urlBarBorderActive": colors.urlBarBorderActive || "#5f5f5f",
    "--surfaceBg": colors.surfaceBg || "#1d1d1d",
    "--surfaceText": colors.surfaceText || "#e8e8e8",
    "--surfaceBorder": colors.surfaceBorder || "#353535",
    "--navButtonBgHover": colors.navButtonBgHover || "rgba(255,255,255,0.1)",
    "--fontPrimaryFamily": fonts.fontPrimaryFamily || "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    "--fontSecondaryFamily": fonts.fontSecondaryFamily || "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  } as React.CSSProperties;

  return (
    <div
      style={{
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid var(--surfaceBorder, #353535)",
        background: "var(--bg)",
        fontFamily: "var(--fontPrimaryFamily)",
        ...cssVars,
      }}
    >
      {/* ========== TOP BAR (matches TopBar.tsx) ========== */}
      <div
        style={{
          height: 38,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--surfaceBg, var(--tabBg))",
          userSelect: "none",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 10px" }}>
          {/* Mira Logo Icon */}
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              background: "var(--text1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              color: "var(--bg)",
              fontWeight: 700,
            }}
          >
            M
          </div>
          {/* Mira Wordmark */}
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text1)",
              letterSpacing: 0.5,
            }}
          >
            Mira
          </span>
        </div>

        {/* Tabs (horizontal) - matches TabBar structure */}
        <div
          style={{
            flex: 1,
            height: "100%",
            display: "flex",
            alignItems: "flex-end",
            gap: 6,
            padding: "0 8px",
          }}
        >
          {/* Active Tab */}
          <div
            style={{
              height: 32,
              background: "var(--tabBgActive)",
              border: "1px solid var(--tabBorderActive)",
              borderBottom: "none",
              borderRadius: "8px 8px 0 0",
              padding: "0 12px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              minWidth: 140,
              maxWidth: 220,
            }}
          >
            <span
              style={{
                color: "var(--tabTextActive)",
                fontFamily: "var(--fontSecondaryFamily)",
                fontSize: 12,
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              New Tab
            </span>
            <span
              style={{
                color: "var(--tabTextActive)",
                opacity: 0.5,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              ×
            </span>
          </div>

          {/* New Tab Button */}
          <div
            style={{
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--tabText)",
              fontSize: 18,
              borderRadius: 6,
              marginBottom: 2,
              cursor: "pointer",
            }}
          >
            +
          </div>
        </div>

        {/* Window Controls */}
        <div style={{ display: "flex" }}>
          <button
            style={{
              width: 44,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text1)",
              fontSize: 14,
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            −
          </button>
          <button
            style={{
              width: 44,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text1)",
              fontSize: 12,
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            □
          </button>
          <button
            style={{
              width: 44,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text1)",
              fontSize: 14,
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* ========== ADDRESS BAR (matches AddressBar.tsx) ========== */}
      <div
        style={{
          height: 44,
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          padding: "0 8px",
          gap: 4,
        }}
      >
        {/* Navigation Buttons */}
        <div style={{ display: "flex", gap: 2 }}>
          <NavButton disabled>←</NavButton>
          <NavButton disabled>→</NavButton>
          <NavButton>↻</NavButton>
        </div>

        {/* Home Button */}
        <NavButton>⌂</NavButton>

        {/* URL Input */}
        <div
          style={{
            flex: 1,
            height: 32,
            background: "var(--urlBarBg)",
            border: "1px solid var(--urlBarBorder)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 11 }}>🔒</span>
          <span
            style={{
              color: "var(--urlBarText)",
              fontSize: 13,
              flex: 1,
              fontFamily: "var(--fontPrimaryFamily)",
            }}
          >
            mira://newtab
          </span>
        </div>

        {/* Menu Button */}
        <NavButton>⋮</NavButton>
      </div>

      {/* ========== NEWTAB PAGE (matches NewTab.tsx) ========== */}
      <div
        style={{
          height: 360,
          background: "var(--bg)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 48,
          color: "var(--text1)",
          fontFamily: "var(--fontPrimaryFamily)",
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 24,
            background: "var(--surfaceBg)",
            border: "1px solid var(--surfaceBorder)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 60,
            marginBottom: 20,
          }}
        >
          🌐
        </div>

        {/* Welcome Text */}
        <h1
          style={{
            margin: "0 0 4px 0",
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: 0.3,
            color: "var(--text1)",
          }}
        >
          Welcome to Mira
        </h1>

        <p
          style={{
            margin: "0 0 28px 0",
            fontSize: 14,
            color: "var(--text2)",
          }}
        >
          A new way to browse
        </p>

        {/* Search Input */}
        <form style={{ width: "60%", maxWidth: 480, minWidth: 280 }}>
          <input
            type="text"
            placeholder="Search anything..."
            readOnly
            style={{
              width: "100%",
              padding: "12px 18px",
              fontSize: 16,
              borderRadius: 8,
              border: "1px solid var(--urlBarBorder)",
              background: "var(--urlBarBg)",
              color: "var(--urlBarText)",
              fontFamily: "inherit",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </form>

        {/* Quick Links Grid */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 36,
          }}
        >
          <QuickLinkTile />
          <QuickLinkTile />
          <QuickLinkTile />
          <QuickLinkTile />
        </div>
      </div>
    </div>
  );
}

function NavButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      style={{
        width: 28,
        height: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: disabled ? "var(--text3)" : "var(--text1)",
        fontSize: 14,
        borderRadius: 6,
        opacity: disabled ? 0.4 : 1,
        background: "transparent",
        border: "none",
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function QuickLinkTile() {
  return (
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 12,
        background: "var(--surfaceBg)",
        border: "1px solid var(--surfaceBorder)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "var(--tabBg)",
          border: "1px solid var(--tabBorder)",
        }}
      />
    </div>
  );
}
