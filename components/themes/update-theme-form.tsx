"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Theme } from "@/lib/themes/types";

interface UpdateThemeFormProps {
  theme: Theme;
}

interface ThemeJson {
  name?: string;
  author?: string;
  version?: string;
  mode?: string;
  fonts?: Record<string, string>;
  colors?: Record<string, string>;
}

export function UpdateThemeForm({ theme }: UpdateThemeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jsonFileName, setJsonFileName] = useState<string | null>(null);
  const [newVersion, setNewVersion] = useState<string>(theme.version);
  const [newCssContent, setNewCssContent] = useState<string>(theme.css_content);

  const handleJsonUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setJsonFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string) as ThemeJson;

        // Extract theme data (mode, fonts, colors) from the JSON
        const themeData = {
          mode: json.mode,
          fonts: json.fonts,
          colors: json.colors,
        };

        setNewCssContent(JSON.stringify(themeData, null, 2));
        setNewVersion(json.version || theme.version);
      } catch (error) {
        console.error("Failed to parse JSON:", error);
        alert("Invalid JSON file. Please check the file format.");
      }
    };
    reader.readAsText(file);
  }, [theme.version]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Update theme - only css_content and version
      const { error: themeError } = await supabase
        .from("themes")
        .update({
          css_content: newCssContent,
          version: newVersion,
          updated_at: new Date().toISOString(),
        })
        .eq("id", theme.id);

      if (themeError) throw themeError;

      // Save version history
      await supabase.from("versions").insert({
        theme_id: theme.id,
        version: newVersion,
        css_content: newCssContent,
      });

      router.push(`/themes/${theme.id}`);
      router.refresh();
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update theme. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this theme?")) return;

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("themes").delete().eq("id", theme.id);

      if (error) throw error;

      router.push("/themes");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete theme.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      {/* Locked Name Field */}
      <div className="form-group">
        <label htmlFor="name">Theme Name</label>
        <input
          type="text"
          id="name"
          value={theme.name}
          disabled
          className="form-input"
          style={{ opacity: 0.6, cursor: "not-allowed" }}
        />
        <small className="form-hint">Name cannot be changed</small>
      </div>

      {/* Locked Author Field */}
      <div className="form-group">
        <label htmlFor="author">Author</label>
        <input
          type="text"
          id="author"
          value={theme.author_name}
          disabled
          className="form-input"
          style={{ opacity: 0.6, cursor: "not-allowed" }}
        />
        <small className="form-hint">Author cannot be changed</small>
      </div>

      {/* Current Version Display */}
      <div className="form-group">
        <label htmlFor="current-version">Current Version</label>
        <input
          type="text"
          id="current-version"
          value={theme.version}
          disabled
          className="form-input"
          style={{ opacity: 0.6, cursor: "not-allowed" }}
        />
      </div>

      {/* JSON File Upload */}
      <div className="form-group">
        <label htmlFor="json-file">Upload New Theme JSON *</label>
        <input
          type="file"
          id="json-file"
          accept=".json,application/json"
          onChange={handleJsonUpload}
          required
          className="form-input"
        />
        {jsonFileName && (
          <small className="form-hint">Selected: {jsonFileName}</small>
        )}
        <small className="form-hint">
          Upload a JSON file to update the theme colors, fonts, and version
        </small>
      </div>

      {/* New Version (read-only, extracted from JSON) */}
      <div className="form-group">
        <label htmlFor="new-version">New Version (from JSON)</label>
        <input
          type="text"
          id="new-version"
          value={newVersion}
          disabled
          className="form-input"
          style={{ opacity: 0.6, cursor: "not-allowed" }}
        />
        <small className="form-hint">
          Version will be updated from the uploaded JSON file
        </small>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          disabled={isSubmitting || !jsonFileName}
          className="btn btn-primary"
        >
          {isSubmitting ? "Updating..." : "Update Theme"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isSubmitting}
          className="btn btn-danger"
        >
          Delete Theme
        </button>
      </div>
    </form>
  );
}
