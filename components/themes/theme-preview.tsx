"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight, RotateCw, Bookmark, ChevronDown } from "lucide-react";
import Image from "next/image";

interface ThemePreviewProps {
  cssContent: string;
}

interface ThemeData {
  mode?: string;
  fonts?: Record<string, string>;
  colors?: Record<string, string>;
}

export function ThemePreview({ cssContent }: ThemePreviewProps) {
  const theme = useMemo<ThemeData>(() => {
    try {
      return JSON.parse(cssContent);
    } catch {
      return {};
    }
  }, [cssContent]);

  const colors = theme.colors || {};
  const fonts = theme.fonts || {};

  // Build CSS variables from theme data with defaults matching default_dark.json
  const cssVars = {
    // Background
    "--bg": colors.bg || "#141414",
    
    // Tab colors
    "--tabBg": colors.tabBg || "#1d1d1d",
    "--tabBgHover": colors.tabBgHover || "#272727",
    "--tabBgActive": colors.tabBgActive || "#313131",
    "--tabText": colors.tabText || "#e8e8e8",
    "--tabTextHover": colors.tabTextHover || "#f2f2f2",
    "--tabTextActive": colors.tabTextActive || "#ffffff",
    "--tabBorder": colors.tabBorder || "#353535",
    "--tabBorderHover": colors.tabBorderHover || "#464646",
    "--tabBorderActive": colors.tabBorderActive || "#595959",
    
    // Text colors
    "--text1": colors.text1 || "#e8e8e8",
    "--text2": colors.text2 || "#b9b9b9",
    "--text3": colors.text3 || "#8f8f8f",
    
    // URL bar colors
    "--urlBarBg": colors.urlBarBg || "#181818",
    "--urlBarBgHover": colors.urlBarBgHover || "#202020",
    "--urlBarBgActive": colors.urlBarBgActive || "#282828",
    "--urlBarText": colors.urlBarText || "#efefef",
    "--urlBarTextPlaceholder": colors.urlBarTextPlaceholder || "#8b8b8b",
    "--urlBarBorder": colors.urlBarBorder || "#3a3a3a",
    "--urlBarBorderHover": colors.urlBarBorderHover || "#4b4b4b",
    "--urlBarBorderActive": colors.urlBarBorderActive || "#5f5f5f",
    
    // Surface colors
    "--surfaceBg": colors.surfaceBg || "#1d1d1d",
    "--surfaceBgHover": colors.surfaceBgHover || "#272727",
    "--surfaceBgActive": colors.surfaceBgActive || "#313131",
    "--surfaceText": colors.surfaceText || "#e8e8e8",
    "--surfaceTextHover": colors.surfaceTextHover || "#f2f2f2",
    "--surfaceTextActive": colors.surfaceTextActive || "#ffffff",
    "--surfaceBorder": colors.surfaceBorder || "#353535",
    "--surfaceBorderHover": colors.surfaceBorderHover || "#464646",
    "--surfaceBorderActive": colors.surfaceBorderActive || "#595959",
    
    // Nav button colors
    "--navButtonBg": colors.navButtonBg || "transparent",
    "--navButtonBgHover": colors.navButtonBgHover || "#ffffff1a",
    "--navButtonBgActive": colors.navButtonBgActive || "#ffffff2e",
    "--navButtonText": colors.navButtonText || "#ededed",
    "--navButtonTextHover": colors.navButtonTextHover || "#f6f6f6",
    "--navButtonTextActive": colors.navButtonTextActive || "#ffffff",
    "--navButtonBorder": colors.navButtonBorder || "#4a4a4a",
    "--navButtonBorderHover": colors.navButtonBorderHover || "#5b5b5b",
    "--navButtonBorderActive": colors.navButtonBorderActive || "#6f6f6f",
    
    // Download button colors
    "--downloadButtonBg": colors.downloadButtonBg || "#2a2a2a",
    "--downloadButtonBgHover": colors.downloadButtonBgHover || "#353535",
    "--downloadButtonBgActive": colors.downloadButtonBgActive || "#404040",
    "--downloadButtonText": colors.downloadButtonText || "#ededed",
    "--downloadButtonTextHover": colors.downloadButtonTextHover || "#f6f6f6",
    "--downloadButtonTextActive": colors.downloadButtonTextActive || "#ffffff",
    "--downloadButtonBorder": colors.downloadButtonBorder || "#4a4a4a",
    "--downloadButtonBorderHover": colors.downloadButtonBorderHover || "#5b5b5b",
    "--downloadButtonBorderActive": colors.downloadButtonBorderActive || "#6f6f6f",
    
    // Field colors
    "--fieldBg": colors.fieldBg || "#181818",
    "--fieldBgHover": colors.fieldBgHover || "#202020",
    "--fieldBgActive": colors.fieldBgActive || "#282828",
    "--fieldText": colors.fieldText || "#efefef",
    "--fieldTextPlaceholder": colors.fieldTextPlaceholder || "#8b8b8b",
    "--fieldBorder": colors.fieldBorder || "#3a3a3a",
    "--fieldBorderHover": colors.fieldBorderHover || "#4b4b4b",
    "--fieldBorderActive": colors.fieldBorderActive || "#5f5f5f",
    
    // Settings colors
    "--settingsCardBg": colors.settingsCardBg || "#1d1d1d",
    "--settingsCardBorder": colors.settingsCardBorder || "#353535",
    "--settingsCardText": colors.settingsCardText || "#e8e8e8",
    "--settingsCardDescription": colors.settingsCardDescription || "#b9b9b9",
    "--settingsTabsBg": colors.settingsTabsBg || "#202020",
    "--settingsTabsBorder": colors.settingsTabsBorder || "#3f3f3f",
    "--settingsRowBg": colors.settingsRowBg || "#232323",
    "--settingsRowBgHover": colors.settingsRowBgHover || "#2c2c2c",
    "--settingsRowBorder": colors.settingsRowBorder || "#3f3f3f",
    "--settingsRowBorderHover": colors.settingsRowBorderHover || "#525252",
    
    // Context menu colors
    "--contextMenuBg": colors.contextMenuBg || "#202020",
    "--contextMenuBgHover": colors.contextMenuBgHover || "#2b2b2b",
    "--contextMenuBgActive": colors.contextMenuBgActive || "#363636",
    "--contextMenuText": colors.contextMenuText || "#efefef",
    "--contextMenuTextHover": colors.contextMenuTextHover || "#ffffff",
    "--contextMenuBorder": colors.contextMenuBorder || "#474747",
    "--contextMenuDivider": colors.contextMenuDivider || "#5f5f5f",
    "--contextMenuShadow": colors.contextMenuShadow || "0 16px 38px rgba(0, 0, 0, 0.46)",
    
    // Accent colors
    "--accentPrimary": colors.accentPrimary || "#8f8f85",
    "--accentPrimarySoft": colors.accentPrimarySoft || "#77776f",
    "--accentText": colors.accentText || "#cfcfc8",
    
    // Layout values
    "--layoutControlRadius": "6px",
    "--layoutInputRadius": "6px",
    "--layoutPanelRadius": "8px",
    "--layoutTabRadius": "8px",
    "--layoutTabHeight": "34px",
    "--layoutTabGap": "6px",
    "--layoutNavButtonHeight": "30px",
    "--layoutAddressBarPaddingY": "6px",
    "--layoutTopBarHeight": "38px",
    "--layoutBorderWidth": "1px",
    
    // Fonts
    "--fontPrimaryFamily": fonts.fontPrimaryFamily || "'Segoe UI'",
    "--fontSecondaryFamily": fonts.fontSecondaryFamily || "'Segoe UI'",
    "--fontPrimaryWeight": fonts.fontPrimaryWeight || "400",
    "--fontSecondaryWeight": fonts.fontSecondaryWeight || "300",
    "--fontPrimaryFallbackFamily": "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    "--fontSecondaryFallbackFamily": "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  } as React.CSSProperties;

  const fontFamily = fonts.fontPrimaryFamily || "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif";

  return (
    <div className="mira-browser-preview" style={cssVars}>
      {/* Top Bar with Tabs */}
      <div className="mira-top-bar">
        {/* Brand */}
        <div className="mira-brand">
          <Image src="/assets/mira_icon.png" alt="Mira" width={16} height={16} className="mira-brand-icon-img" />
          <Image src="/assets/mira.png" alt="Mira" width={50} height={25} className="mira-brand-wordmark" />
        </div>

        {/* Tabs */}
        <div className="mira-tabs-container">
          {/* Active Tab */}
          <div className="mira-tab mira-tab-active">
            <span className="mira-tab-title">New Tab</span>
            <button className="mira-tab-close">×</button>
          </div>
          {/* New Tab Button */}
          <button className="mira-new-tab-btn">+</button>
        </div>

        {/* Window Controls */}
        <div className="mira-window-controls">
          <button className="mira-window-btn">−</button>
          <button className="mira-window-btn">□</button>
          <button className="mira-window-btn mira-window-btn-close">×</button>
        </div>
      </div>

      {/* Address Bar */}
      <div className="mira-address-bar">
        {/* Navigation Buttons */}
        <div className="mira-nav-buttons">
          <button className="mira-nav-btn" disabled>
            <ChevronLeft size={16} strokeWidth={2.1} />
          </button>
          <button className="mira-nav-btn" disabled>
            <ChevronRight size={16} strokeWidth={2.1} />
          </button>
          <button className="mira-nav-btn">
            <RotateCw size={16} strokeWidth={1.9} />
          </button>
        </div>

        {/* URL Input */}
        <div className="mira-url-container">
          <input
            type="text"
            className="mira-url-input"
            defaultValue="mira://newtab"
            readOnly
          />
          <button className="mira-bookmark-btn">
            <Bookmark size={14} strokeWidth={1.9} />
          </button>
        </div>

        {/* Menu Button */}
        <button className="mira-menu-btn">
          <ChevronDown size={16} strokeWidth={2.1} />
        </button>
      </div>

      {/* New Tab Content */}
      <div 
        className="mira-content"
        style={{ fontFamily }}
      >
        <div className="mira-newtab-content">
          {/* Logo */}
          <div className="mira-logo-container">
            <Image 
              src="/assets/mira_logo.png" 
              alt="Mira logo" 
              width={180} 
              height={180}
              className="mira-logo"
              priority
            />
          </div>
          
          <h1 className="mira-title">Welcome to Mira</h1>
          
          {/* Search Box */}
          <div className="mira-search-box">
            <input
              type="text"
              className="mira-search-input"
              placeholder="Search anything..."
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
}
