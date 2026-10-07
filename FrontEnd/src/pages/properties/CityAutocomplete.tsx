import React, { useEffect, useMemo, useState } from 'react';
import { Check, Globe2, Loader2, MapPin, Plus } from 'lucide-react';
import { api } from '../../services/api';
import type { PropertyLocationCategory, PropertyLocationKind } from '../../types';

interface LocationCategoryAutocompleteProps {
  kind: PropertyLocationKind;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const LocationCategoryAutocomplete: React.FC<LocationCategoryAutocompleteProps> = ({
  kind,
  value,
  onChange,
  error,
}) => {
  const [items, setItems] = useState<PropertyLocationCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputId = `property-${kind.toLowerCase()}-input`;
  const optionsId = `property-${kind.toLowerCase()}-options`;
  const Icon = kind === 'Country' ? Globe2 : MapPin;

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    api.getPropertyLocationCategories(kind)
      .then(items => {
        if (!cancelled) setItems(items);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [kind]);

  const trimmedValue = value.trim();
  const matches = useMemo(() => {
    if (trimmedValue.length < 3) return [];
    const term = trimmedValue.toLocaleLowerCase();
    return items
      .filter(item => item.name.toLocaleLowerCase().includes(term))
      .sort((left, right) => {
        const leftStarts = left.name.toLocaleLowerCase().startsWith(term);
        const rightStarts = right.name.toLocaleLowerCase().startsWith(term);
        if (leftStarts !== rightStarts) return leftStarts ? -1 : 1;
        return left.name.localeCompare(right.name);
      })
      .slice(0, 8);
  }, [items, trimmedValue]);

  const exactMatch = items.some(item => item.name.toLocaleLowerCase() === trimmedValue.toLocaleLowerCase());
  const showMenu = isOpen && trimmedValue.length >= 3;

  const selectItem = (item: PropertyLocationCategory) => {
    onChange(item.name);
    setIsOpen(false);
    setActiveIndex(0);
  };

  return (
    <div className="relative w-full">
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-[#171A2B] dark:text-[#D9DDE8]">
        {kind} *
      </label>
      <div className="relative flex items-center">
        <Icon className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#8A90A2]" />
        <input
          id={inputId}
          type="text"
          value={value}
          required
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showMenu}
          aria-controls={optionsId}
          aria-activedescendant={showMenu && matches[activeIndex] ? `${inputId}-${matches[activeIndex].id}` : undefined}
          aria-invalid={Boolean(error)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
          onChange={event => {
            onChange(event.target.value);
            setActiveIndex(0);
            setIsOpen(true);
          }}
          onKeyDown={event => {
            if (!showMenu || matches.length === 0) return;
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setActiveIndex(index => (index + 1) % matches.length);
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              setActiveIndex(index => (index - 1 + matches.length) % matches.length);
            } else if (event.key === 'Enter') {
              event.preventDefault();
              selectItem(matches[activeIndex]);
            } else if (event.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          placeholder="Type at least 3 letters..."
          className={`h-11 w-full rounded-lg border bg-white pl-10 pr-10 text-[#171A2B] outline-none transition-colors placeholder:text-[#8A90A2] focus:border-[#FF7817] focus:ring-2 focus:ring-[#FF7817] dark:bg-[#0B1030] dark:text-white ${error ? 'border-rose-500' : 'border-[#D9DDE8] dark:border-[#252B5C]'}`}
        />
        {isLoading && <Loader2 className="absolute right-3.5 h-4 w-4 animate-spin text-[#FF7817]" />}
      </div>

      {error ? (
        <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>
      ) : (
        <p className="mt-1 text-xs text-[#8A90A2]">
          Search after 3 letters, or type a new {kind.toLowerCase()} to create it automatically.
        </p>
      )}

      {showMenu && (
        <div
          id={optionsId}
          role="listbox"
          className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-[#D9DDE8] bg-white p-1.5 shadow-xl dark:border-[#252B5C] dark:bg-[#0E1335]"
        >
          {matches.map((item, index) => (
            <button
              key={item.id}
              id={`${inputId}-${item.id}`}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={event => event.preventDefault()}
              onClick={() => selectItem(item)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${index === activeIndex ? 'bg-[#FFF0E4] text-[#E66606] dark:bg-[#252B5C] dark:text-[#FF9A52]' : 'text-[#171A2B] hover:bg-[#F8F9FC] dark:text-white dark:hover:bg-[#1A2053]'}`}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="h-4 w-4" />
                <span className="font-semibold">{item.name}</span>
              </span>
              {item.name.toLocaleLowerCase() === trimmedValue.toLocaleLowerCase() && <Check className="h-4 w-4" />}
            </button>
          ))}

          {!exactMatch && (
            <div className="flex items-start gap-2.5 rounded-lg border-t border-[#E8EAF0] px-3 py-2.5 text-xs text-[#5F667A] dark:border-[#252B5C] dark:text-[#AEB4C7]">
              <Plus className="mt-0.5 h-4 w-4 shrink-0 text-[#FF7817]" />
              <span><strong className="text-[#171A2B] dark:text-white">{trimmedValue}</strong> will be added as a new {kind.toLowerCase()} when this property is saved.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
