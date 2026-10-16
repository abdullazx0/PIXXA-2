import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, FolderOpen } from "lucide-react";
import { useMedia } from "../context/MediaContext";
import { useMediaOverlays } from "../hooks/useMediaOverlays";
import { fetchAlbums, createAlbum } from "../api/social";
import { MediaGrid } from "../components/MediaGrid";
import { MediaViewer } from "../components/MediaViewer";
import { ShareSheet } from "../components/ShareSheet";
import { InfoSheet } from "../components/InfoSheet";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { AlbumPickerSheet } from "../components/AlbumPickerSheet";
import { EmptyState } from "../components/EmptyState";
import type { LocalMedia } from "../types/media";

interface AlbumTile {
  name: string;
  count: number;
  cover?: LocalMedia;
  items: LocalMedia[];
}

export const Albums: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { items, isFavorite, isLiked, onToggleFavorite, onToggleLike } = useMedia();
  const [openAlbum, setOpenAlbum] = useState<AlbumTile | null>(null);
  const [remoteAlbums, setRemoteAlbums] = useState<{ id: number; name: string; item_count: number }[]>([]);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchAlbums()
      .then(setRemoteAlbums)
      .catch(() => setRemoteAlbums([]));
  }, []);

  // Real, folder-derived albums built from each item's actual album hint
  // (the picked directory's name, e.g. "Camera", "WhatsApp Images"), plus
  // the two virtual collections every gallery has.
  const folderAlbums = useMemo(() => {
    const map = new Map<string, LocalMedia[]>();
    for (const item of items) {
      const key = item.albumHint || "Imported";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    const tiles: AlbumTile[] = Array.from(map.entries()).map(([name, list]) => ({
      name,
      count: list.length,
      cover: list[0],
      items: list,
    }));

    const favItems = items.filter((i) => isFavorite(i.clientId));
    const recentItems = [...items].slice(-30).reverse();

    return [
      { name: "Favorites", count: favItems.length, cover: favItems[0], items: favItems },
      { name: "Recent", count: recentItems.length, cover: recentItems[0], items: recentItems },
      ...tiles,
    ];
  }, [items, isFavorite]);

  const overlays = useMediaOverlays(openAlbum?.items ?? []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await createAlbum(newName.trim());
      setRemoteAlbums(await fetchAlbums());
    } catch {
      /* backend unavailable */
    }
    setNewName("");
    setCreating(false);
  };

  if (openAlbum) {
    return (
      <div className="min-h-[100dvh] bg-black pb-28">
        <div className="flex items-center gap-3 px-4 pt-[calc(16px+env(safe-area-inset-top,0px))] pb-3">
          <button onClick={() => setOpenAlbum(null)} className="w-9 h-9 rounded-full glass-panel flex items-center justify-center text-white">
            <ArrowLeft size={17} />
          </button>
          <div>
            <h1 className="text-white text-[19px] font-semibold">{openAlbum.name}</h1>
            <p className="text-white/45 text-[12px]">{openAlbum.count} items</p>
          </div>
        </div>
        {openAlbum.items.length === 0 ? (
          <EmptyState icon={FolderOpen} title="This album is empty" />
        ) : (
          <MediaGrid items={openAlbum.items} onOpen={overlays.openViewer} />
        )}

        {overlays.current && (
          <MediaViewer
            media={overlays.current}
            index={overlays.viewerIndex!}
            total={openAlbum.items.length}
            isFavorite={isFavorite(overlays.current.clientId)}
            isLiked={isLiked(overlays.current.clientId)}
            onClose={() => overlays.setViewerIndex(null)}
            onToggleFavorite={() => onToggleFavorite(overlays.current!.clientId)}
            onToggleLike={() => onToggleLike(overlays.current!.clientId)}
            onShare={() => overlays.setShareTarget(overlays.current)}
            onInfo={() => overlays.setInfoTarget(overlays.current)}
            onDelete={() => overlays.setDeleteTarget(overlays.current)}
          />
        )}
        {overlays.shareTarget && <ShareSheet media={overlays.shareTarget} onClose={() => overlays.setShareTarget(null)} />}
        {overlays.infoTarget && (
          <InfoSheet
            media={overlays.infoTarget}
            isFavorite={isFavorite(overlays.infoTarget.clientId)}
            onClose={() => overlays.setInfoTarget(null)}
            onToggleFavorite={() => onToggleFavorite(overlays.infoTarget!.clientId)}
            onShare={() => overlays.setShareTarget(overlays.infoTarget)}
            onDelete={() => overlays.setDeleteTarget(overlays.infoTarget)}
            onAddToAlbum={() => overlays.setAlbumSheetFor(overlays.infoTarget)}
          />
        )}
        {overlays.albumSheetFor && (
          <AlbumPickerSheet mediaClientId={overlays.albumSheetFor.clientId} onClose={() => overlays.setAlbumSheetFor(null)} />
        )}
        {overlays.deleteTarget && (
          <ConfirmDialog
            title="Delete this item?"
            message={overlays.deleteTarget.filename}
            onCancel={() => overlays.setDeleteTarget(null)}
            onConfirm={overlays.confirmDelete}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-black pb-28">
      <div className="flex items-center justify-between px-4 pt-[calc(16px+env(safe-area-inset-top,0px))] pb-1">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="w-9 h-9 rounded-full glass-panel flex items-center justify-center text-white">
            <ArrowLeft size={17} />
          </button>
          <div>
            <h1 className="text-white text-[22px] font-semibold">Albums</h1>
            <p className="text-white/45 text-[12px]">{folderAlbums.length} Albums</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 px-4 py-3">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New album name"
          className="flex-1 glass-panel rounded-xl px-4 py-2.5 text-[14px] text-white placeholder-white/35 outline-none"
        />
        <button
          disabled={creating || !newName.trim()}
          onClick={handleCreate}
          className="w-11 h-11 rounded-xl bg-white text-black flex items-center justify-center disabled:opacity-40"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4">
        {folderAlbums.map((album) => (
          <button
            key={album.name}
            onClick={() => setOpenAlbum(album)}
            className="glass-panel rounded-2xl overflow-hidden text-left"
          >
            <div className="w-full aspect-[4/3] bg-white/5">
              {album.cover ? (
                <img src={album.cover.url} className="w-full h-full object-cover grayscale-[0.15]" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FolderOpen size={22} className="text-white/30" />
                </div>
              )}
            </div>
            <div className="px-3 py-2">
              <p className="text-white text-[13.5px] font-medium truncate">{album.name}</p>
              <p className="text-white/45 text-[11.5px]">{album.count} items</p>
            </div>
          </button>
        ))}
      </div>

      {remoteAlbums.length > 0 && (
        <div className="px-4 mt-5">
          <p className="text-white/40 text-[12px] mb-2 uppercase tracking-wide">My Albums</p>
          <div className="flex flex-col gap-1">
            {remoteAlbums.map((a) => (
              <div key={a.id} className="flex items-center gap-3 glass-panel rounded-xl px-3 py-3">
                <span className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                  <FolderOpen size={15} className="text-white/70" />
                </span>
                <span className="flex-1 text-white/90 text-[14px]">{a.name}</span>
                <span className="text-white/40 text-[12px]">{a.item_count} items</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
