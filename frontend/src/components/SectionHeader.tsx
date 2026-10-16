import React from "react";
import { Search, MoreVertical, X } from "lucide-react";

export const SectionHeader: React.FC<{
  title: string;
  countLabel?: string;
  subtitle?: string;
  search: string;
  onSearch: (v: string) => void;
  searchOpen: boolean;
  onToggleSearch: () => void;
  onMore?: () => void;
}> = ({ title, countLabel, subtitle, search, onSearch, searchOpen, onToggleSearch, onMore }) => {
  return (
    <div className="pt-[calc(18px+env(safe-area-inset-top,0px))] px-4 pb-2">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-semibold text-white leading-tight tracking-tight">{title}</h1>
          {countLabel && <p className="text-white/45 text-[13px] mt-0.5">{countLabel}</p>}
          {subtitle && <p className="text-white/45 text-[13px] mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onToggleSearch}
            className="w-9 h-9 rounded-full glass-panel flex items-center justify-center text-white/80"
          >
            {searchOpen ? <X size={16} /> : <Search size={16} />}
          </button>
          {onMore && (
            <button onClick={onMore} className="w-9 h-9 rounded-full glass-panel flex items-center justify-center text-white/80">
              <MoreVertical size={16} />
            </button>
          )}
        </div>
      </div>
      {searchOpen && (
        <input
          autoFocus
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by filename, extension, album…"
          className="mt-3 w-full glass-panel rounded-xl px-4 py-2.5 text-[14px] text-white placeholder-white/35 outline-none"
        />
      )}
    </div>
  );
};
