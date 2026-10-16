import React from "react";
import { Image, Film, Clapperboard, LayoutGrid, User } from "lucide-react";
import type { Section } from "../App";

const NAV: { key: Section; label: string; icon: React.ElementType }[] = [
  { key: "photos", label: "Photos", icon: Image },
  { key: "videos", label: "Videos", icon: Film },
  { key: "reels", label: "Reels", icon: Clapperboard },
  { key: "feed", label: "Feed", icon: LayoutGrid },
  { key: "myspace", label: "My Space", icon: User },
];

export const BottomNav: React.FC<{ active: Section; onSelect: (s: Section) => void }> = ({
  active,
  onSelect,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-[calc(10px+env(safe-area-inset-bottom,0px))] pt-2">
      <div className="glass-panel-strong max-w-md mx-auto rounded-2xl flex justify-between px-2 py-2 shadow-2xl">
        {NAV.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`flex flex-col items-center gap-1 flex-1 py-1.5 rounded-xl transition-colors ${
                isActive ? "text-white" : "text-white/45"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
              <span className="text-[10px] leading-none">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
