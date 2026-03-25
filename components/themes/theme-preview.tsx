"use client";

interface ThemePreviewProps {
  cssContent: string;
}

export function ThemePreview({ cssContent }: ThemePreviewProps) {
  return (
    <div className="theme-preview">
      <style>{cssContent}</style>
      <div className="theme-preview-frame">
        <div className="preview-header">Header</div>
        <div className="preview-content">
          <div className="preview-sidebar">Sidebar</div>
          <div className="preview-main">Main Content</div>
        </div>
      </div>
    </div>
  );
}
