import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { filterRussianCities, isRussianCity } from "./data/russianCities";

type CityAutocompleteProps = {
  value: string;
  onChange: (city: string) => void;
  className?: string;
  placeholder?: string;
};

export function CityAutocomplete({ value, onChange, className = "", placeholder = "Город" }: CityAutocompleteProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (!open) setQuery(value);
  }, [value, open]);

  const suggestions = useMemo(() => {
    const list = filterRussianCities(query, 50);
    const trimmed = value.trim();
    if (trimmed && !isRussianCity(trimmed) && !list.includes(trimmed)) {
      return [trimmed, ...list];
    }
    return list;
  }, [query, value]);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
    setQuery(value);
  }, [value]);

  const pick = useCallback(
    (city: string) => {
      onChange(city);
      setQuery(city);
      setOpen(false);
      setActiveIndex(-1);
    },
    [onChange],
  );

  useEffect(() => {
    if (!open) return;
    const onDocPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("pointerdown", onDocPointer);
    return () => document.removeEventListener("pointerdown", onDocPointer);
  }, [open, close]);

  const onBlur = () => {
    window.setTimeout(() => {
      if (!open) return;
      const trimmed = query.trim();
      if (trimmed && isRussianCity(trimmed)) {
        pick(trimmed);
        return;
      }
      close();
    }, 120);
  };

  return (
    <div ref={rootRef} className={`city-autocomplete ${open ? "open" : ""}`}>
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        value={open ? query : value}
        placeholder={placeholder}
        className={className}
        onFocus={() => {
          setQuery(value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onBlur={onBlur}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            close();
            return;
          }
          if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            setOpen(true);
            return;
          }
          if (!open || !suggestions.length) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => (i + 1) % suggestions.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
          } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            pick(suggestions[activeIndex]);
          }
        }}
      />
      {open && suggestions.length > 0 ? (
        <ul id={listId} className="city-autocomplete-list" role="listbox">
          {suggestions.map((city, index) => (
            <li key={city} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                className={`city-autocomplete-option${index === activeIndex ? " active" : ""}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(city)}
              >
                {city}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
