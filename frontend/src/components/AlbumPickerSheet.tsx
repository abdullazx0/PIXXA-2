import React, { useEffect, useState } from "react";
import { X, Plus, FolderOpen } from "lucide-react";
import { fetchAlbums, createAlbum, addToAlbum } from "../api/social";

export const AlbumPickerSheet: React.FC<{ mediaClientId: string; onClose: () => void }> = ({ mediaClientId, onClose }) => {
  const [albums, setAlbums] = useState<{ id: number; name: string; item_count: number }[]>([]);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchAlbums()
      .then(setAlbums)
      .catch(() => setAlbums([]));
  }, []);

  const pick = async (albumId: number) => {
    setBusy(true);
    try {
      await addToAlbum(albumId, mediaClientId);
    } catch {
      /* backend unavailable - non-fatal */
    }
    setBusy(false);
    onClose();
  };

  const createAndPick = async () => {
    if (!newName.trim()) return;
    setBusy(true);
    try {
      const album = await createAlbum(newName.trim());
      await addToAlbum(album.id, mediaClientId);
    } catch {
      /* backend unavailable - non-fatal */
    }
    setBusy(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[65] flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="glass-panel-strong w-full max-w-md rounded-t-3xl px-5 pt-4 pb-[calc(20px+env(safe-area-inset-bottom,0px))] section-fade-in max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-[16px] font-semibold">Add to Album</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-white/70">
            <X size={15} />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New album name"
            className="flex-1 glass-panel rounded-xl px-4 py-2.5 text-[14px] text-white placeholder-white/35 outline-none"
          />
          <button
            disabled={busy || !newName.trim()}
            onClick={createAndPick}
            className="w-11 h-11 rounded-xl bg-white text-black flex items-center justify-center disabled:opacity-40"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          {albums.length === 0 && <p className="text-white/40 text-[13px] text-center py-6">No albums yet.</p>}
          {albums.map((a) => (
            <button
              key={a.id}
              disabled={busy}
              onClick={() => pick(a.id)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 text-left"
            >
              <span className="w-9 h-9 rounded-lg glass-panel flex items-center justify-center">
                <FolderOpen size={15} className="text-white/70" />
              </span>
              <span className="flex-1 text-white/90 text-[14px]">{a.name}</span>
              <span className="text-white/40 text-[12px]">{a.item_count}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
