import React from "react";
import { Play, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import type { LocalMedia } from "../types/media";
import { formatDuration } from "../utils/format";

export const MediaGrid: React.FC<{
  items: LocalMedia[];
  onOpen: (item: LocalMedia) => void;
  showFilename?: boolean;
}> = ({ items, onOpen, showFilename }) => {
  return (
    <div className="grid grid-cols-3 gap-[3px] px-[3px]">
      {items.map((item) => (
        <button
          key={item.clientId}
          onClick={() => onOpen(item)}
          className="relative aspect-square bg-white/5 overflow-hidden group"
        >
          {item.kind === "photo" ? (
            <img
              src={item.url}
              alt={item.filename}
              loading="lazy"
              className="w-full h-full object-cover grayscale-[0.15] group-active:scale-95 transition-transform"
            />
          ) : (
            <>
              <video src={item.url} className="w-full h-full object-cover grayscale-[0.15]" preload="metadata" muted />
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <Play size={18} className="text-white/90 fill-white/90" />
              </div>
              <span className="absolute bottom-1 right-1.5 text-[10px] text-white bg-black/55 rounded px-1 py-0.5 flex items-center gap-1">
                {formatDuration(item.durationSeconds)}
              </span>
            </>
          )}
          {showFilename && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent pt-4 pb-1 px-1.5">
              <p className="text-[9.5px] text-white/85 truncate flex items-center gap-0.5">
                {item.kind === "photo" ? <ImageIcon size={9} /> : <VideoIcon size={9} />}
                {item.filename}
              </p>
            </div>
          )}
        </button>
      ))}
    </div>
  );
};
