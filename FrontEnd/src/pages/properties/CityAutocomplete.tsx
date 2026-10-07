import React, { useEffect, useMemo, useState } from 'react';
import { Check, Loader2, MapPin, Plus } from 'lucide-react';
import { api } from '../../services/api';
import type { PropertyLocationCategory } from '../../types';

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  enabled: boolean;
}

export const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  value,
  onChange,
  error,
  enabled,
}) => {
  const [cities, setCities] = useState<PropertyLocationCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setIsLoading(true);
    api.getPropertyLocationCategories('City')
      .then(items => {
        if (!cancelled) setCities(items);
      })
      .catch(() => {
        if (!cancelled) setCities([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const trimmedValue = value.trim();
  const matches = useMemo(() => {
    if (trimmedValue.length < 3) return [];
    const term = trimmedValue.toLocaleLowerCase();
    return cities
      .filter(city => city.name.toLocaleLowerCase().includes(term))
      .sort((left, right) => {
        const leftStarts = left.name.toLocaleLowerCase().startsWith(term);
        const rightStarts = right.name.toLocaleLowerCase().startsWith(term);
        if (leftStarts !== rightStarts) return leftStarts ? -1 : 1;
        return left.name.localeCompare(right.name);
      })
      .slice(0, 8);
  }, [cities, trimmedValue]);

  const exactMatch = cities.some(city => city.name.toLocaleLowerCase() === trimmedValue.toLocaleLowerCase());
  const showMenu = isOpen && trimmedValue.length >= 3;

  const selectCity = (city: PropertyLocationCategory) => {
    onChange(city.name);
    setIsOpen(false);
    setActiveIndex(0);
  };

  return (
    <div className="relative w-full">
      <label htmlFor="property-city-input" className="mb-1.5 block text-sm font-medium text-[#171A2B] dark:text-[#D9DDE8]">
        City *
      </label>
      <div className="relative flex items-center">
        <MapPin className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#8A90A2]" />
        <input
          id="property-city-input"
          type="text"
          value={value}
          required
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showMenu}
          aria-controls="property-city-options"
          aria-activedescendant={showMenu && matches[activeIndex] ? `property-city-${matches[activeIndex].id}` : undefined}
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
              selectCity(matches[activeIndex]);
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
          Search after 3 letters, or type a new city to create it automatically.
        </p>
      )}

      {showMenu && (
        <div
          id="property-city-options"
          role="listbox"
          className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-[#D9DDE8] bg-white p-1.5 shadow-xl dark:border-[#252B5C] dark:bg-[#0E1335]"
        >
          {matches.map((city, index) => (
            <button
              key={city.id}
              id={`property-city-${city.id}`}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={event => event.preventDefault()}
              onClick={() => selectCity(city)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${index === activeIndex ? 'bg-[#FFF0E4] text-[#E66606] dark:bg-[#252B5C] dark:text-[#FF9A52]' : 'text-[#171A2B] hover:bg-[#F8F9FC] dark:text-white dark:hover:bg-[#1A2053]'}`}
            >
              <span className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4" />
                <span className="font-semibold">{city.name}</span>
              </span>
              {city.name.toLocaleLowerCase() === trimmedValue.toLocaleLowerCase() && <Check className="h-4 w-4" />}
            </button>
          ))}

          {!exactMatch && (
            <div className="flex items-start gap-2.5 rounded-lg border-t border-[#E8EAF0] px-3 py-2.5 text-xs text-[#5F667A] dark:border-[#252B5C] dark:text-[#AEB4C7]">
              <Plus className="mt-0.5 h-4 w-4 shrink-0 text-[#FF7817]" />
              <span><strong className="text-[#171A2B] dark:text-white">{trimmedValue}</strong> will be added as a new city when this property is saved.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
