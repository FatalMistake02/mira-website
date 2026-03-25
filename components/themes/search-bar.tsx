"use client";

import { useState } from "react";

interface SearchBarProps {
  initialValue?: string;
  onSearch: (query: string) => void;
}

export function SearchBar({ initialValue = "", onSearch }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search themes..."
        className="search-input"
      />
      <button type="submit" className="btn btn-primary search-button">
        Search
      </button>
    </form>
  );
}
