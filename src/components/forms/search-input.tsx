"use client";

import { SearchIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/fields";
import { useEffect, useRef, useState } from "react";

interface SearchInputProps {
  label: string;
  placeholder?: string;
  initialValue: string;
  onSearch: (value: string) => void;
}

/**
 * Debounced search box. It owns its text while typing; remount it (via `key`) to reset it.
 */
export function SearchInput({ label, placeholder, initialValue, onSearch }: SearchInputProps) {
  const [text, setText] = useState(initialValue);
  const committed = useRef(initialValue);
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  });

  useEffect(() => {
    if (text === committed.current) return;
    const timer = setTimeout(() => {
      committed.current = text;
      onSearchRef.current(text.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [text]);

  return (
    <div className="relative min-w-0 flex-1 sm:max-w-xs lg:w-60 lg:flex-none">
      <label htmlFor="search" className="sr-only">
        {label}
      </label>
      <SearchIcon className="text-ink-3 pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2" />
      <Input
        id="search"
        type="search"
        value={text}
        placeholder={placeholder}
        onChange={(event) => setText(event.target.value)}
        className="pl-8"
      />
    </div>
  );
}
