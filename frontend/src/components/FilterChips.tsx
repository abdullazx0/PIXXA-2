import React from "react";

export function FilterChips<T extends string>({
  options,
  active,
  onChange,
}: {
  options: { key: T; label: string }[];
  active: T;
  onChange: (key: T) => void;
}) {
  return (
    <div data-no-swipe className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-3">
      {options.map((opt) => {
        const isActive = opt.key === active;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={`glass-chip whitespace-nowrap text-[13px] font-medium px-4 py-1.5 rounded-full transition-colors ${
              isActive ? "glass-chip-active" : "text-white/75"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
