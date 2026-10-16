import React, { useState } from "react";
import { X, Link2, MoreHorizontal } from "lucide-react";
import type { LocalMedia } from "../types/media";
import { formatBytes, formatDuration } from "../utils/format";

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor">
    <path d="M12.02 2C6.5 2 2 6.5 2 12.02c0 1.98.58 3.83 1.58 5.4L2 22l4.72-1.53a9.9 9.9 0 0 0 5.3 1.53h.01c5.52 0 10.02-4.5 10.02-10.02C22.04 6.5 17.55 2 12.02 2zm0 18.15h-.01a8.1 8.1 0 0 1-4.13-1.13l-.3-.17-3.05 1 1-2.97-.19-.31a8.1 8.1 0 0 1-1.24-4.35c0-4.5 3.66-8.16 8.17-8.16 4.5 0 8.16 3.66 8.16 8.17 0 4.5-3.66 8.15-8.16 8.15zm4.48-6.08c-.24-.12-1.44-.71-1.66-.8-.22-.08-.39-.12-.55.12-.16.24-.63.8-.78.96-.14.16-.29.18-.53.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.5.11-.11.24-.29.36-.44.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.8-.2-.48-.4-.42-.55-.42-.14 0-.3 0-.46 0-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.01 0 1.19.87 2.34.99 2.5.12.16 1.66 2.53 4.02 3.45 2.36.92 2.36.61 2.79.57.43-.04 1.44-.59 1.64-1.15.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.7}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);

export const ShareSheet: React.FC<{ media: LocalMedia; onClose: () => void }> = ({ media, onClose }) => {
  const [note, setNote] = useState("");

  const shareNative = async () => {
    const canShare =
      typeof navigator.share === "function" && (!navigator.canShare || navigator.canShare({ files: [media.file] }));
    if (!canShare) {
      setNote("Native sharing needs a secure (HTTPS) page or the installed app. Your browser blocked it here.");
      return;
    }
    try {
      await navigator.share({ files: [media.file], title: media.filename });
      onClose();
    } catch {
      /* user cancelled the share sheet */
    }
  };

  // A blob: URL only works inside this tab, so we copy the filename instead.
  const copyName = async () => {
    try {
      await navigator.clipboard.writeText(media.filename);
      setNote("Filename copied.");
    } catch {
      setNote("Copy isn't available on this page (needs HTTPS).");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="glass-panel-strong w-full max-w-md rounded-t-3xl px-5 pt-4 pb-[calc(20px+env(safe-area-inset-bottom,0px))] section-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-[16px] font-semibold">Share</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-white/70">
            <X size={15} />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5 glass-panel rounded-xl p-3">
          {media.kind === "photo" ? (
            <img src={media.url} className="w-11 h-11 rounded-lg object-cover" />
          ) : (
            <video src={media.url} className="w-11 h-11 rounded-lg object-cover" />
          )}
          <div className="min-w-0">
            <p className="text-white text-[13px] truncate">{media.filename}</p>
            <p className="text-white/45 text-[12px]">
              {formatBytes(media.sizeBytes)}
              {media.kind === "video" ? ` · ${formatDuration(media.durationSeconds)}` : ""}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 text-center mb-2">
          <button onClick={shareNative} className="flex flex-col items-center gap-2 text-white/85">
            <span className="w-14 h-14 rounded-2xl glass-panel flex items-center justify-center">
              <WhatsAppIcon />
            </span>
            <span className="text-[11px] text-white/60">WhatsApp</span>
          </button>
          <button onClick={shareNative} className="flex flex-col items-center gap-2 text-white/85">
            <span className="w-14 h-14 rounded-2xl glass-panel flex items-center justify-center">
              <InstagramIcon />
            </span>
            <span className="text-[11px] text-white/60">Instagram</span>
          </button>
          <button onClick={copyName} className="flex flex-col items-center gap-2 text-white/85">
            <span className="w-14 h-14 rounded-2xl glass-panel flex items-center justify-center">
              <Link2 size={20} />
            </span>
            <span className="text-[11px] text-white/60">Copy Name</span>
          </button>
          <button onClick={shareNative} className="flex flex-col items-center gap-2 text-white/85">
            <span className="w-14 h-14 rounded-2xl glass-panel flex items-center justify-center">
              <MoreHorizontal size={20} />
            </span>
            <span className="text-[11px] text-white/60">More</span>
          </button>
        </div>
        <p className="text-white/45 text-[11.5px] text-center mt-3 min-h-[16px]">{note}</p>
        <p className="text-white/30 text-[11px] text-center mt-1">
          Uses your device's native share sheet. Your media is never uploaded to PIXXA's servers.
        </p>
      </div>
    </div>
  );
};
