import { useEffect, useMemo, useState } from "react";
import locations from "../data/locations.json";

export default function LocationSearch({
  value,
  onChange,
  placeholder = "Enter city or country"
}) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(-1);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  const results = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return [];
    return locations
      .filter((l) => l.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query]);

  function handleSelect(item) {
    setQuery(item.name);
    setOpen(false);
    setIndex(-1);
    onChange && onChange(item.name);
  }

  function onKeyDown(e) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (index >= 0 && results[index]) handleSelect(results[index]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="position-relative" style={{ minWidth: 200 }}>
      <input
        id="location"
        name="wsw-location-input"
        className="form-control"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          onChange && onChange(e.target.value);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
        aria-autocomplete="list"
        aria-expanded={open}
        autoComplete="off"
      />

      {open && results.length > 0 && (
        <div
          className="list-group position-absolute w-100 shadow-sm"
          style={{ zIndex: 2000 }}
        >
          {results.map((r, i) => (
            <button
              key={r.id}
              type="button"
              className={`list-group-item list-group-item-action ${
                i === index ? "active" : ""
              }`}
              onMouseDown={() => handleSelect(r)}
            >
              <div className="fw-semibold">{r.name}</div>
              <small className="text-muted">
                lat: {r.lat}, lon: {r.lon}
              </small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
