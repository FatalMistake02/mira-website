"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchBarProps {
  initialValue?: string;
}

export function SearchBar({ initialValue = "" }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasInteracted = useRef(false);

  // Debounced search - only after user interaction and if value actually changed
  useEffect(() => {
    if (!hasInteracted.current) return;

    const currentSearch = searchParams.get("search") || "";
    if (query === currentSearch) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("search", query);
      } else {
        params.delete("search");
      }
      router.push(`/themes?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, router, searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    hasInteracted.current = true;
    setQuery(e.target.value);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search themes..."
        className="search-input"
      />
    </div>
  );
}
