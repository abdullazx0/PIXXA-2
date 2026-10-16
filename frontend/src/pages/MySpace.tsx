import React, { useEffect, useState } from "react";
import {
  User,
  ChevronRight,
  Clock,
  FolderOpen,
  Clock3,
  Trash2,
  HardDrive,
  Settings as SettingsIcon,
  Heart,
} from "lucide-react";
import { useMedia } from "../context/MediaContext";
import { fetchWatchTimeSummary, localWatchDisplay } from "../api/social";
import { formatBytes } from "../utils/format";

const DEVICE_QUOTA_BYTES = 128 * 1024 * 1024 * 1024; // illustrative local "storage" bar denominator

export const MySpace: React.FC<{ onOpenAlbums: () => void }> = ({ onOpenAlbums }) => {
  const { items, photos, videos, favoriteIds, recentlyDeleted, backendOk } = useMedia();
  const [watchTime, setWatchTime] = useState<string>("0h 0m");
  const [panel, setPanel] = useState<null | "recent" | "deleted" | "storage" | "settings">(null);

  useEffect(() => {
    setWatchTime(localWatchDisplay());
    if (backendOk) {
      fetchWatchTimeSummary()
        .then((s) => setWatchTime(s.total_display))
        .catch(() => {});
    }
  }, [backendOk]);

  const totalBytes = items.reduce((sum, i) => sum + (i.sizeBytes || 0), 0);
  const usedPct = Math.min(100, (totalBytes / DEVICE_QUOTA_BYTES) * 100);
  const recentItems = [...items].slice(-30).reverse();

  return (
    <div className="pb-28">
      <div className="pt-[calc(18px+env(safe-area-inset-top,0px))] px-4 pb-2 flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-semibold text-white tracking-tight">My Space</h1>
          <p className="text-white/45 text-[13px] mt-0.5">Your gallery, your preferences</p>
        </div>
        <button className="w-9 h-9 rounded-full glass-panel flex items-center justify-center text-white/80" onClick={() => setPanel("settings")}>
          <SettingsIcon size={16} />
        </button>
      </div>

      <div className="flex items-center gap-3 px-4 py-4">
        <div className="w-14 h-14 rounded-full glass-panel-strong flex items-center justify-center">
          <User size={22} className="text-white/70" />
        </div>
        <div>
          <p className="text-white text-[15px] font-medium">User</p>
          <p className="text-white/40 text-[12px]">Your gallery, your space</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 mb-4">
        <StatCard label="Photos" value={photos.length} />
        <StatCard label="Videos" value={videos.length} />
        <StatCard label="Favorites" value={favoriteIds.size} icon={Heart} />
      </div>

      <div className="flex flex-col gap-2 px-4">
        <Row icon={Clock3} label="Watch Time" trailing={watchTime} />
        <Row icon={FolderOpen} label="Albums" trailing="Manage" onClick={onOpenAlbums} />
        <Row icon={Clock} label="Recently Added" trailing={`${recentItems.length} items`} onClick={() => setPanel("recent")} />
        <Row icon={Trash2} label="Recently Deleted" trailing={`${recentlyDeleted.length} items`} onClick={() => setPanel("deleted")} />
        <Row icon={HardDrive} label="Storage" trailing={formatBytes(totalBytes)} onClick={() => setPanel("storage")} />
        <Row icon={SettingsIcon} label="Settings" onClick={() => setPanel("settings")} />
      </div>

      {panel && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60" onClick={() => setPanel(null)}>
          <div
            className="glass-panel-strong w-full max-w-md rounded-t-3xl px-5 pt-4 pb-[calc(24px+env(safe-area-inset-bottom,0px))] section-fade-in max-h-[75vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {panel === "recent" && (
              <>
                <SheetTitle title="Recently Added" onClose={() => setPanel(null)} />
                <ThumbList items={recentItems} empty="No media yet." />
              </>
            )}
            {panel === "deleted" && (
              <>
                <SheetTitle title="Recently Deleted" onClose={() => setPanel(null)} />
                <p className="text-white/35 text-[12px] mb-3 -mt-2">
                  Items removed from PIXXA. Browsers can't restore or permanently erase original device files —
                  this list only reflects what PIXXA can track locally.
                </p>
                <ThumbList items={recentlyDeleted} empty="Nothing deleted." />
              </>
            )}
            {panel === "storage" && (
              <>
                <SheetTitle title="Storage" onClose={() => setPanel(null)} />
                <p className="text-white/70 text-[14px] mb-2">
                  {formatBytes(totalBytes)} of {formatBytes(DEVICE_QUOTA_BYTES)}
                </p>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mb-4">
                  <div className="h-full bg-white" style={{ width: `${usedPct}%` }} />
                </div>
                <p className="text-white/35 text-[12px]">
                  This reflects the media currently imported into PIXXA in this session, not your device's total storage.
                </p>
              </>
            )}
            {panel === "settings" && (
              <>
                <SheetTitle title="Settings" onClose={() => setPanel(null)} />
                <div className="flex flex-col gap-1">
                  <SettingsRow label="Backend sync" value={backendOk ? "Connected" : "Offline (local only)"} />
                  <SettingsRow label="Media storage" value="On this device only" />
                  <SettingsRow label="Cloud upload" value="Never" />
                  <SettingsRow label="App version" value="1.0.0" />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; icon?: React.ElementType }> = ({ label, value }) => (
  <div className="glass-panel rounded-xl py-3 text-center">
    <p className="text-white text-[18px] font-semibold">{value}</p>
    <p className="text-white/45 text-[11.5px] mt-0.5">{label}</p>
  </div>
);

const Row: React.FC<{ icon: React.ElementType; label: string; trailing?: string; onClick?: () => void }> = ({
  icon: Icon,
  label,
  trailing,
  onClick,
}) => (
  <button onClick={onClick} className="flex items-center gap-3 glass-panel rounded-xl px-4 py-3.5 text-left">
    <Icon size={17} className="text-white/70" />
    <span className="flex-1 text-white/90 text-[14.5px]">{label}</span>
    {trailing && <span className="text-white/40 text-[12.5px]">{trailing}</span>}
    <ChevronRight size={15} className="text-white/30" />
  </button>
);

const SheetTitle: React.FC<{ title: string; onClose: () => void }> = ({ title, onClose }) => (
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-white text-[16px] font-semibold">{title}</h3>
    <button onClick={onClose} className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-white/70">
      ✕
    </button>
  </div>
);

const ThumbList: React.FC<{ items: { clientId: string; url: string; kind: string; filename: string }[]; empty: string }> = ({
  items,
  empty,
}) => (
  <>
    {items.length === 0 ? (
      <p className="text-white/40 text-[13px] text-center py-8">{empty}</p>
    ) : (
      <div className="grid grid-cols-4 gap-2">
        {items.map((i) => (
          <div key={i.clientId} className="aspect-square rounded-lg overflow-hidden bg-white/5">
            {i.kind === "photo" ? (
              <img src={i.url} className="w-full h-full object-cover" />
            ) : (
              <video src={i.url} className="w-full h-full object-cover" muted />
            )}
          </div>
        ))}
      </div>
    )}
  </>
);

const SettingsRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between px-1 py-3 border-b border-white/8 last:border-0">
    <span className="text-white/75 text-[14px]">{label}</span>
    <span className="text-white/40 text-[13px]">{value}</span>
  </div>
);
