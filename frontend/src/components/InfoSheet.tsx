import React from "react";
import { X, Heart, Star, Share2, FolderPlus, Trash2, Info } from "lucide-react";
import type { LocalMedia } from "../types/media";
import { formatBytes, formatResolution, formatDuration, formatDate } from "../utils/format";

export const InfoSheet: React.FC<{
  media: LocalMedia;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
  onShare: () => void;
  onDelete: () => void;
  onAddToAlbum: () => void;
}> = ({ media, isFavorite, onClose, onToggleFavorite, onShare, onDelete, onAddToAlbum }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="glass-panel-strong w-full max-w-md rounded-t-3xl px-5 pt-4 pb-[calc(20px+env(safe-area-inset-bottom,0px))] section-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-white text-[16px] font-semibold flex items-center gap-2">
            <Info size={16} className="text-white/60" /> {media.filename}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-white/70">
            <X size={15} />
          </button>
        </div>
        <p className="text-white/45 text-[13px] mb-4">
          {formatBytes(media.sizeBytes)} · {formatResolution(media.width, media.height)}
          {media.kind === "video" ? ` · ${formatDuration(media.durationSeconds)}` : ""}
        </p>

        <div className="glass-panel rounded-xl divide-y divide-white/10 mb-4 text-[14px]">
          <Row label="File type" value={media.mimeType || media.extension || "—"} />
          <Row label="File size" value={formatBytes(media.sizeBytes)} />
          <Row label="Resolution" value={formatResolution(media.width, media.height)} />
          {media.kind === "video" && <Row label="Duration" value={formatDuration(media.durationSeconds)} />}
          <Row label="Date" value={formatDate(media.capturedAt)} />
          <Row label="Album" value={media.albumHint || "—"} />
        </div>

        <div className="flex flex-col gap-1">
          <ActionRow icon={Heart} label="Add to Favorites" active={isFavorite} onClick={onToggleFavorite} />
          <ActionRow icon={Share2} label={media.kind === "photo" ? "Share Photo" : "Share Video"} onClick={onShare} />
          <ActionRow icon={FolderPlus} label="Add to Album" onClick={onAddToAlbum} />
          <ActionRow icon={Trash2} label="Delete" danger onClick={onDelete} />
        </div>
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between px-4 py-3">
    <span className="text-white/45">{label}</span>
    <span className="text-white/85 truncate max-w-[60%] text-right">{value}</span>
  </div>
);

const ActionRow: React.FC<{
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
}> = ({ icon: Icon, label, onClick, active, danger }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] transition-colors ${
      danger ? "text-red-400/90" : active ? "text-white" : "text-white/85"
    } hover:bg-white/5`}
  >
    <Icon size={17} className={active ? "fill-white/90" : ""} />
    {label}
  </button>
);
