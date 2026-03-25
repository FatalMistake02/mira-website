"use client";

import type { Tag } from "@/lib/themes/types";

interface ThemeFiltersProps {
  tags: Tag[];
  selectedTag?: string;
  sortBy: "newest" | "popular" | "name";
  onTagChange: (tag: string | undefined) => void;
  onSortChange: (sort: "newest" | "popular" | "name") => void;
}

export function ThemeFilters({
  tags,
  selectedTag,
  sortBy,
  onTagChange,
  onSortChange,
}: ThemeFiltersProps) {
  return (
    <div className="theme-filters">
      <div className="filter-group">
        <label className="filter-label">Sort by</label>
        <select
          value={sortBy}
          onChange={(e) =>
            onSortChange(e.target.value as "newest" | "popular" | "name")
          }
          className="filter-select"
        >
          <option value="newest">Newest</option>
          <option value="popular">Most Popular</option>
          <option value="name">Name</option>
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Category</label>
        <div className="tag-filter-list">
          <button
            onClick={() => onTagChange(undefined)}
            className={`tag-filter ${!selectedTag ? "active" : ""}`}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => onTagChange(tag.slug)}
              className={`tag-filter ${selectedTag === tag.slug ? "active" : ""}`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
