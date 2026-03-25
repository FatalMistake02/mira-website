"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Theme } from "@/lib/themes/types";

interface EditThemeFormProps {
  theme: Theme;
}

export function EditThemeForm({ theme }: EditThemeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: theme.name,
    description: theme.description || "",
    css_content: theme.css_content,
    version: theme.version,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Update theme
      const { error: themeError } = await supabase
        .from("themes")
        .update({
          name: formData.name,
          description: formData.description,
          css_content: formData.css_content,
          version: formData.version,
          updated_at: new Date().toISOString(),
        })
        .eq("id", theme.id);

      if (themeError) throw themeError;

      // Save version history
      await supabase.from("versions").insert({
        theme_id: theme.id,
        version: formData.version,
        css_content: formData.css_content,
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

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          className="form-textarea"
        />
      </div>

      <div className="form-group">
        <label htmlFor="css_content">CSS Content *</label>
        <textarea
          id="css_content"
          value={formData.css_content}
          onChange={(e) =>
            setFormData({ ...formData, css_content: e.target.value })
          }
          rows={10}
          required
          className="form-textarea"
        />
      </div>

      <div className="form-group">
        <label htmlFor="version">Version *</label>
        <input
          type="text"
          id="version"
          value={formData.version}
          onChange={(e) =>
            setFormData({ ...formData, version: e.target.value })
          }
          required
          className="form-input"
          placeholder="1.0.0"
        />
      </div>

      <div className="form-actions">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
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
