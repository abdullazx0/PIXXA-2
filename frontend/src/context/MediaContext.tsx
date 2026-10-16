import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { LocalMedia } from "../types/media";
import { useLocalMedia } from "../hooks/useLocalMedia";
import { backendAvailable } from "../api/client";
import { bulkRegisterMedia } from "../api/media";
import { toggleFavorite, toggleLike, fetchFavoriteIds, fetchLikedIds } from "../api/social";

interface MediaContextValue {
  items: LocalMedia[];
  permission: "unrequested" | "granted" | "denied";
  loading: boolean;
  supportsDirectoryPicker: boolean;
  requestAccess: () => Promise<void>;
  importViaInput: (files: FileList | null, albumHint?: string) => Promise<void>;
  removeItem: (clientId: string) => void;

  backendOk: boolean;
  favoriteIds: Set<string>;
  likedIds: Set<string>;
  isFavorite: (clientId: string) => boolean;
  isLiked: (clientId: string) => boolean;
  onToggleFavorite: (clientId: string) => Promise<void>;
  onToggleLike: (clientId: string) => Promise<void>;

  photos: LocalMedia[];
  videos: LocalMedia[];
  recentlyDeleted: LocalMedia[];
  deletedRecordId: (clientId: string) => void;
}

const MediaContext = createContext<MediaContextValue | null>(null);

const FAV_KEY = "pixxa_favorites";
const LIKE_KEY = "pixxa_likes";

function loadSet(key: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || "[]"));
  } catch {
    return new Set();
  }
}

function saveSet(key: string, set: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    /* storage unavailable */
  }
}

export const MediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const local = useLocalMedia();
  const [backendOk, setBackendOk] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => loadSet(FAV_KEY));
  const [likedIds, setLikedIds] = useState<Set<string>>(() => loadSet(LIKE_KEY));
  const [recentlyDeleted, setRecentlyDeleted] = useState<LocalMedia[]>([]);

  useEffect(() => {
    backendAvailable().then(async (ok) => {
      setBackendOk(ok);
      if (ok) {
        try {
          const [favs, likes] = await Promise.all([fetchFavoriteIds(), fetchLikedIds()]);
          setFavoriteIds((prev) => new Set([...prev, ...favs]));
          setLikedIds((prev) => new Set([...prev, ...likes]));
        } catch {
          /* non-fatal - app still works locally */
        }
      }
    });
  }, []);

  useEffect(() => saveSet(FAV_KEY, favoriteIds), [favoriteIds]);
  useEffect(() => saveSet(LIKE_KEY, likedIds), [likedIds]);

  // Whenever new local media is imported, register its metadata with the
  // Django backend (metadata only - never the file bytes).
  useEffect(() => {
    if (backendOk && local.items.length > 0) {
      bulkRegisterMedia(local.items).catch(() => {});
    }
  }, [backendOk, local.items]);

  const onToggleFavorite = useCallback(
    async (clientId: string) => {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.has(clientId) ? next.delete(clientId) : next.add(clientId);
        return next;
      });
      if (backendOk) {
        try {
          await toggleFavorite(clientId);
        } catch {
          /* keep optimistic local state even if sync fails */
        }
      }
    },
    [backendOk]
  );

  const onToggleLike = useCallback(
    async (clientId: string) => {
      setLikedIds((prev) => {
        const next = new Set(prev);
        next.has(clientId) ? next.delete(clientId) : next.add(clientId);
        return next;
      });
      if (backendOk) {
        try {
          await toggleLike(clientId);
        } catch {
          /* keep optimistic local state even if sync fails */
        }
      }
    },
    [backendOk]
  );

  const deletedRecordId = useCallback(
    (clientId: string) => {
      const target = local.items.find((i) => i.clientId === clientId);
      if (target) setRecentlyDeleted((prev) => [target, ...prev].slice(0, 50));
      local.removeItem(clientId);
    },
    [local]
  );

  const photos = useMemo(() => local.items.filter((i) => i.kind === "photo"), [local.items]);
  const videos = useMemo(() => local.items.filter((i) => i.kind === "video"), [local.items]);

  const requestAccess = useCallback(async () => {
    await local.requestAccess();
  }, [local]);

  const importViaInput = useCallback(
    async (files: FileList | null, albumHint = "Imported") => {
      await local.importViaInput(files, albumHint);
    },
    [local]
  );

  const value: MediaContextValue = {
    items: local.items,
    permission: local.permission,
    loading: local.loading,
    supportsDirectoryPicker: local.supportsDirectoryPicker,
    requestAccess,
    importViaInput,
    removeItem: local.removeItem,
    backendOk,
    favoriteIds,
    likedIds,
    isFavorite: (id) => favoriteIds.has(id),
    isLiked: (id) => likedIds.has(id),
    onToggleFavorite,
    onToggleLike,
    photos,
    videos,
    recentlyDeleted,
    deletedRecordId,
  };

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
};

export function useMedia() {
  const ctx = useContext(MediaContext);
  if (!ctx) throw new Error("useMedia must be used within MediaProvider");
  return ctx;
}
