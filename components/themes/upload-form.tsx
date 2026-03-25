"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ThemePreview } from "./theme-preview";

interface UploadFormProps {
  userId?: string;
  authorName?: string;
  onAnonymousWarning?: () => void;
}

export function UploadForm({ userId, authorName, onAnonymousWarning }: UploadFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    author_name: authorName || "",
    css_content: "",
    preview_image: null as File | null,
    tags: [] as string[],
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, preview_image: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Upload image if provided
      let preview_image_url = null;
      if (formData.preview_image) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("theme-previews")
          .upload(`${Date.now()}-${formData.preview_image.name}`, formData.preview_image);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("theme-previews")
          .getPublicUrl(uploadData.path);

        preview_image_url = urlData.publicUrl;
      }

      // Create theme
      const { data: theme, error: themeError } = await supabase
        .from("themes")
        .insert({
          name: formData.name,
          description: formData.description,
          author_name: formData.author_name,
          user_id: userId || null,
          css_content: formData.css_content,
          preview_image_url,
          version: "1.0.0",
        })
        .select()
        .single();

      if (themeError) throw themeError;

      // Add tags
      if (formData.tags.length > 0 && theme) {
        for (const tagName of formData.tags) {
          // Check if tag exists
          const { data: existingTag } = await supabase
            .from("tags")
            .select("id")
            .eq("name", tagName)
            .single();

          let tagId;
          if (existingTag) {
            tagId = existingTag.id;
          } else {
            // Create new tag
            const { data: newTag } = await supabase
              .from("tags")
              .insert({
                name: tagName,
                slug: tagName.toLowerCase().replace(/\s+/g, "-"),
              })
              .select()
              .single();
            tagId = newTag?.id;
          }

          if (tagId) {
            await supabase.from("theme_tags").insert({
              theme_id: theme.id,
              tag_id: tagId,
            });
          }
        }
      }

      router.push(`/themes/${theme.id}`);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload theme. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      {!userId && (
        <div className="upload-warning">
          <p>
            <strong>Note:</strong> You are uploading anonymously. Sign in to edit
            this theme later.
          </p>
          <button
            type="button"
            onClick={onAnonymousWarning}
            className="btn btn-ghost"
          >
            Sign in first
          </button>
        </div>
      )}

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
        <label htmlFor="author_name">Author Name *</label>
        <input
          type="text"
          id="author_name"
          value={formData.author_name}
          onChange={(e) =>
            setFormData({ ...formData, author_name: e.target.value })
          }
          required
          className="form-input"
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
          placeholder="/* Paste your CSS here */"
        />
      </div>

      <div className="form-group">
        <label htmlFor="preview_image">Preview Image</label>
        <input
          type="file"
          id="preview_image"
          accept="image/*"
          onChange={handleImageChange}
          className="form-file"
        />
        {previewUrl && (
          <div className="preview-image-container">
            <img
              src={previewUrl}
              alt="Preview"
              className="preview-image"
            />
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags (comma-separated)</label>
        <input
          type="text"
          id="tags"
          onChange={(e) =>
            setFormData({
              ...formData,
              tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
            })
          }
          className="form-input"
          placeholder="dark, minimalist, blue"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary"
      >
        {isSubmitting ? "Uploading..." : "Upload Theme"}
      </button>
    </form>
  );
}
