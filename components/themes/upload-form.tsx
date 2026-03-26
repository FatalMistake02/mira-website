"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface UploadFormProps {
  userId?: string;
  authorName?: string;
}

interface ThemeJson {
  name?: string;
  author?: string;
  version?: string;
  mode?: string;
  fonts?: Record<string, string>;
  colors?: Record<string, string>;
}

export function UploadForm({ userId, authorName }: UploadFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    author_name: authorName || (userId ? "" : "Anonymous"),
    css_content: "",
    version: "1.0.0",
  });
  const [themeMode, setThemeMode] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [jsonFileName, setJsonFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchTags = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("tags")
        .select("id, name, slug")
        .order("name", { ascending: true });
      if (data) setAvailableTags(data);
    };
    fetchTags();
  }, []);

  const processFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".json")) {
        alert("Please upload a .json file.");
        return;
      }
      setJsonFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string) as ThemeJson;
          const themeData = { mode: json.mode, fonts: json.fonts, colors: json.colors };
          setFormData((prev) => ({
            ...prev,
            name: json.name || prev.name,
            author_name: userId ? prev.author_name : json.author || prev.author_name,
            css_content: JSON.stringify(themeData, null, 2),
            version: json.version || prev.version,
          }));
          setThemeMode(json.mode || null);
        } catch {
          alert("Invalid JSON file. Please check the file format.");
        }
      };
      reader.readAsText(file);
    },
    [userId]
  );

  const handleJsonUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { data: theme, error: themeError } = await supabase
        .from("themes")
        .insert({
          name: formData.name,
          author_name: formData.author_name,
          user_id: userId || null,
          css_content: formData.css_content,
          version: formData.version,
          status: "under_review",
        })
        .select()
        .single();

      if (themeError) throw themeError;

      const mode = themeMode?.toLowerCase();
      if (mode === "light" || mode === "dark") {
        const { data: existingTag } = await supabase
          .from("tags")
          .select("id")
          .eq("slug", mode)
          .single();

        let tagId: string;
        if (existingTag) {
          tagId = existingTag.id;
        } else {
          const { data: newTag, error: tagError } = await supabase
            .from("tags")
            .insert({ name: mode.charAt(0).toUpperCase() + mode.slice(1), slug: mode })
            .select()
            .single();
          if (tagError) throw tagError;
          tagId = newTag.id;
        }
        await supabase.from("theme_tags").insert({ theme_id: theme.id, tag_id: tagId });
      }

      for (const tagName of tags.slice(0, 3)) {
        const slug = tagName.toLowerCase().replace(/\s+/g, "-");
        const { data: existingTag } = await supabase
          .from("tags")
          .select("id")
          .eq("slug", slug)
          .single();

        let tagId: string;
        if (existingTag) {
          tagId = existingTag.id;
        } else {
          const { data: newTag, error: tagError } = await supabase
            .from("tags")
            .insert({ name: tagName, slug })
            .select()
            .single();
          if (tagError) continue;
          tagId = newTag.id;
        }
        await supabase.from("theme_tags").insert({ theme_id: theme.id, tag_id: tagId });
      }

      if (userId) {
        router.push(`/profile/${formData.author_name}`);
      } else {
        router.push("/themes");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload theme. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const unselectedTags = availableTags.filter((t) => !tags.includes(t.name));

  return (
    <>
      {/* ── Scoped styles ─────────────────────────────────────────── */}
      <style>{`
        /* ── Drop zone ─────────────────────────────────────── */
        .drop-zone {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 36px 24px;
          border: 2px dashed var(--border, #d1d5db);
          border-radius: 12px;
          background: var(--surface, #fafafa);
          cursor: pointer;
          transition: border-color 0.18s, background 0.18s, transform 0.15s;
          text-align: center;
          outline: none;
        }
        .drop-zone:hover,
        .drop-zone:focus-within {
          border-color: var(--accent, #6366f1);
          background: var(--accent-subtle, #eef2ff);
        }
        .drop-zone.dragging {
          border-color: var(--accent, #6366f1);
          background: var(--accent-subtle, #eef2ff);
          transform: scale(1.012);
        }
        .drop-zone input[type="file"] {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
          width: 100%;
          height: 100%;
        }
        .drop-zone-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: var(--accent-subtle, #eef2ff);
          border: 1.5px solid var(--accent, #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent, #6366f1);
          flex-shrink: 0;
          transition: background 0.18s;
        }
        .drop-zone:hover .drop-zone-icon,
        .drop-zone.dragging .drop-zone-icon {
          background: var(--accent, #6366f1);
          color: #fff;
        }
        .drop-zone-label {
          font-size: 0.875rem;
          color: var(--text-secondary, #6b7280);
          line-height: 1.5;
        }
        .drop-zone-label strong {
          color: var(--accent, #6366f1);
          font-weight: 600;
        }
        .drop-zone-meta {
          font-size: 0.75rem;
          color: var(--text-tertiary, #9ca3af);
        }
        .drop-zone-loaded {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: var(--success-subtle, #f0fdf4);
          border: 1.5px solid var(--success, #22c55e);
          border-radius: 8px;
          font-size: 0.8125rem;
          color: var(--success-text, #166534);
          font-weight: 500;
          max-width: 100%;
        }
        .drop-zone-loaded svg {
          flex-shrink: 0;
          color: var(--success, #22c55e);
        }
        .drop-zone-loaded span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .drop-zone-replace {
          font-size: 0.75rem;
          color: var(--accent, #6366f1);
          text-decoration: underline;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
        }
        .drop-zone-replace:hover { opacity: 0.75; }

        /* ── Tag picker ────────────────────────────────────── */
        .tag-picker {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .tag-selected-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          min-height: 32px;
          align-items: center;
        }
        .tag-selected-row:empty::before {
          content: "No tags selected";
          font-size: 0.8125rem;
          color: var(--text-tertiary, #9ca3af);
          font-style: italic;
        }
        .tag-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px 4px 12px;
          border-radius: 999px;
          background: var(--accent, #6366f1);
          color: #fff;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.01em;
          transition: background 0.15s;
        }
        .tag-pill-remove {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
          border: none;
          cursor: pointer;
          padding: 0;
          color: #fff;
          font-size: 0.75rem;
          line-height: 1;
          transition: background 0.15s;
        }
        .tag-pill-remove:hover { background: rgba(255,255,255,0.45); }

        .tag-available {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .tag-option {
          padding: 4px 12px;
          border-radius: 999px;
          border: 1.5px solid var(--border, #e5e7eb);
          background: var(--surface, #fff);
          color: var(--text-secondary, #374151);
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s, color 0.15s;
          white-space: nowrap;
        }
        .tag-option:hover:not(:disabled) {
          border-color: var(--accent, #6366f1);
          background: var(--accent-subtle, #eef2ff);
          color: var(--accent, #6366f1);
        }
        .tag-option:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .tag-hint {
          font-size: 0.75rem;
          color: var(--text-tertiary, #9ca3af);
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .tag-hint svg { flex-shrink: 0; }
      `}</style>

      <form onSubmit={handleSubmit} className="upload-form">
        {!userId && (
          <div className="upload-warning">
            <p>
              <strong>Note:</strong> You are uploading anonymously. This theme will not be
              linked to you and you will not be able to update it later. After uploading the
              theme will be submitted for review and will not appear on the site until it has
              passed.
            </p>
            <button
              type="button"
              onClick={() => router.push("/themes?signin=true")}
              className="btn btn-ghost"
            >
              Sign in first
            </button>
          </div>
        )}

        {/* ── File chooser ──────────────────────────────────────── */}
        <div className="form-group">
          <label>Import from JSON File</label>

          {jsonFileName ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="drop-zone-loaded">
                {/* check icon */}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="8" fill="currentColor" opacity=".15" />
                  <path
                    d="M5 8.5l2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span title={jsonFileName}>{jsonFileName}</span>
              </div>
              <button
                type="button"
                className="drop-zone-replace"
                onClick={() => {
                  setJsonFileName(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Replace file
              </button>
            </div>
          ) : (
            <div
              className={`drop-zone${isDragging ? " dragging" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
              aria-label="Upload JSON theme file"
            >
              {/* Upload icon */}
              <div className="drop-zone-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 13V7m0 0L7.5 9.5M10 7l2.5 2.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 13.5A3.5 3.5 0 005.5 17h9a3.5 3.5 0 002.5-5.95V11A4 4 0 009.15 7.1"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <p className="drop-zone-label">
                <strong>Click to browse </strong> or drag &amp; drop
              </p>
              <p className="drop-zone-meta">.json files only</p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleJsonUpload}
                tabIndex={-1}
                style={{ pointerEvents: "none" }}
              />
            </div>
          )}
        </div>

        {/* ── Theme name ────────────────────────────────────────── */}
        <div className="form-group">
          <label htmlFor="name">Theme Name *</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="form-input"
          />
        </div>

        {/* ── Author ────────────────────────────────────────────── */}
        <div className="form-group">
          <label htmlFor="author_name">Author *</label>
          <input
            type="text"
            id="author_name"
            value={userId ? formData.author_name : "Anonymous"}
            disabled
            className="form-input"
          />
        </div>

        {/* ── Tags ──────────────────────────────────────────────── */}
        <div className="form-group">
          <label>
            Tags{" "}
            <span style={{ fontWeight: 400, color: "var(--text-tertiary, #9ca3af)" }}>
              (up to 3)
            </span>
          </label>

          <div className="tag-picker">
            {/* Selected pills */}
            <div className="tag-selected-row" aria-label="Selected tags">
              {tags.map((tag, i) => (
                <span key={i} className="tag-pill">
                  {tag}
                  <button
                    type="button"
                    className="tag-pill-remove"
                    onClick={() => setTags(tags.filter((_, idx) => idx !== i))}
                    aria-label={`Remove ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Available options */}
            {tags.length < 3 && unselectedTags.length > 0 && (
              <div className="tag-available" role="group" aria-label="Available tags">
                {unselectedTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    className="tag-option"
                    onClick={() => setTags([...tags, tag.name])}
                    disabled={tags.length >= 3}
                  >
                    + {tag.name}
                  </button>
                ))}
              </div>
            )}

            <p className="tag-hint">
              {/* info icon */}
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="6.5" cy="6.5" r="6" stroke="currentColor" strokeWidth="1.2" />
                <path
                  d="M6.5 6v3.5M6.5 4v.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
              Light / Dark mode will be auto-added from the theme file.
            </p>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? "Uploading…" : "Upload Theme"}
        </button>
      </form>
    </>
  );
}