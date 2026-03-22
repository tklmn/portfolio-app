import { useState, useRef, useEffect } from 'react';
import { HiX, HiPlus } from 'react-icons/hi';

/**
 * AutocompleteChipPicker — shared chip input with autocomplete + inline create.
 *
 * Props:
 *  - value: string (comma-separated) or array of strings
 *  - onChange(newValue: string): called with comma-separated string
 *  - suggestions: string[] — all available options for autocomplete
 *  - onCreateNew(name: string): Promise — called when user creates a brand-new item
 *  - placeholder: string
 */
export default function AutocompleteChipPicker({ value, onChange, suggestions = [], onCreateNew, placeholder = 'Add...' }) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const chips = (typeof value === 'string' ? value : '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const filtered = suggestions.filter(
    (s) => !chips.includes(s) && s.toLowerCase().includes(input.toLowerCase())
  );

  const exactMatch = suggestions.some((s) => s.toLowerCase() === input.trim().toLowerCase());
  const showCreate = input.trim().length > 0 && !exactMatch && !chips.includes(input.trim());

  const addChip = (chip) => {
    if (!chip || chips.includes(chip)) return;
    const next = [...chips, chip].join(',');
    onChange(next);
    setInput('');
    setOpen(false);
    inputRef.current?.focus();
  };

  const removeChip = (chip) => {
    const next = chips.filter((c) => c !== chip).join(',');
    onChange(next);
  };

  const handleCreate = async () => {
    const name = input.trim();
    if (!name || creating) return;
    setCreating(true);
    try {
      if (onCreateNew) await onCreateNew(name);
      addChip(name);
    } finally {
      setCreating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered.length > 0) {
        addChip(filtered[0]);
      } else if (showCreate) {
        handleCreate();
      }
    }
    if (e.key === 'Backspace' && input === '' && chips.length > 0) {
      removeChip(chips[chips.length - 1]);
    }
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className="flex flex-wrap items-center gap-1.5 min-h-[42px] px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {chips.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
          >
            {chip}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeChip(chip); }}
              className="hover:text-red-500 transition-colors"
            >
              <HiX size={12} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={chips.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[80px] bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
        />
      </div>

      {open && (filtered.length > 0 || showCreate) && (
        <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => addChip(item)}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              {item}
            </button>
          ))}
          {showCreate && (
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="w-full text-left px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-1.5 font-medium border-t border-gray-100 dark:border-gray-700"
            >
              <HiPlus size={14} />
              Create &quot;{input.trim()}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
