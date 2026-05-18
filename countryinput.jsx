/**
 * CountryInput — filterable country selector.
 * - Shows a dropdown while the user types.
 * - Enter key selects the first (or only highlighted) result.
 * - Click on a list item selects that country.
 * - Clears input after selection.
 * - Calls onSelect(country) with the full country object.
 */

import { useState, useRef, useEffect } from "react";

function normalize(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function CountryInput({ countries, onSelect, disabled = false, placeholder = "Escribí un país…" }) {
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const normalizedQuery = normalize(query.trim());

  const filtered = query.trim().length < 1
    ? []
    : countries
        .filter(c => {
          const searchable = normalize([
            c.name,
            c.englishName,
            c.officialName,
            c.code2,
            c.code3,
            ...(c.aliases ?? []),
          ].join(" "));
          return searchable.includes(normalizedQuery);
        })
        .slice(0, 8); // cap dropdown to 8 items

  // Keep highlighted index in bounds when list changes
  useEffect(() => {
    setHighlighted(0);
    setOpen(filtered.length > 0);
  }, [filtered.length, query]);

  function select(country) {
    if (disabled) return;
    onSelect(country);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlighted]) select(filtered[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  // Scroll highlighted item into view
  useEffect(() => {
    if (listRef.current) {
      const item = listRef.current.children[highlighted];
      if (item) item.scrollIntoView({ block: "nearest" });
    }
  }, [highlighted]);

  return (
    <div className="country-input-wrapper" style={{ position: "relative" }}>
      <input
        ref={inputRef}
        className="country-input"
        type="text"
        value={query}
        placeholder={disabled ? "¡Ya ganaste!" : placeholder}
        disabled={disabled}
        autoComplete="off"
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => filtered.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)} // slight delay to allow click
      />
      {open && (
        <ul ref={listRef} className="country-dropdown">
          {filtered.map((c, i) => (
            <li
              key={c.code3}
              className={`country-option ${i === highlighted ? "highlighted" : ""}`}
              onMouseDown={() => select(c)} // mouseDown fires before blur
              onMouseEnter={() => setHighlighted(i)}
            >
              <img
                src={c.flagPng}
                alt={c.name}
                className="flag-mini"
                loading="lazy"
              />
              <span>{c.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
