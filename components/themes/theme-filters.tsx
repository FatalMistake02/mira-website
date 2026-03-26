"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Tag } from "@/lib/themes/types";

interface ThemeFiltersProps {
  tags: Tag[];
  selectedTag?: string;
  sortBy: "newest" | "popular" | "name";
}

export function ThemeFilters({
  tags,
  selectedTag,
  sortBy,
}: ThemeFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTagChange = (tag: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tag) {
      params.set("tag", tag);
    } else {
      params.delete("tag");
    }
    router.push(`/themes?${params.toString()}`);
  };

  const handleSortChange = (sort: "newest" | "popular" | "name") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    router.push(`/themes?${params.toString()}`);
  };

  return (
    <div className="theme-filters">
      <div className="filter-group">
        <label className="filter-label">Sort by</label>
        <select
          value={sortBy}
          onChange={(e) =>
            handleSortChange(e.target.value as "newest" | "popular" | "name")
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
            onClick={() => handleTagChange(undefined)}
            className={`tag-filter ${!selectedTag ? "active" : ""}`}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleTagChange(tag.slug)}
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
