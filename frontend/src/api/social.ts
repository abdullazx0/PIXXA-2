import { api } from "./client";

export async function toggleFavorite(mediaClientId: string) {
  const { data } = await api.post("/favorites/toggle/", { media_client_id: mediaClientId });
  return data.favorited as boolean;
}

export async function toggleLike(mediaClientId: string) {
  const { data } = await api.post("/likes/toggle/", { media_client_id: mediaClientId });
  return data.liked as boolean;
}

export async function fetchFavoriteIds(): Promise<string[]> {
  const { data } = await api.get("/favorites/");
  return (data.results ?? data).map((f: any) => f.media_client_id);
}

export async function fetchLikedIds(): Promise<string[]> {
  const { data } = await api.get("/likes/");
  return (data.results ?? data).map((l: any) => l.media_client_id);
}

export async function fetchAlbums() {
  const { data } = await api.get("/albums/");
  return (data.results ?? data) as { id: number; name: string; is_system: boolean; item_count: number }[];
}

export async function createAlbum(name: string) {
  const { data } = await api.post("/albums/", { name, is_system: false });
  return data;
}

export async function addToAlbum(albumId: number, mediaClientId: string) {
  await api.post(`/albums/${albumId}/add_item/`, { media_client_id: mediaClientId });
}

export async function logWatchTime(source: "videos" | "reels" | "feed", mediaClientId: string, seconds: number) {
  if (seconds < 1) return;
  try {
    const prev = Number(localStorage.getItem(LOCAL_WATCH_KEY) || 0);
    localStorage.setItem(LOCAL_WATCH_KEY, String(prev + seconds));
  } catch {
    /* storage unavailable */
  }
  try {
    await api.post("/analytics/watchtime/", { source, media_client_id: mediaClientId, seconds });
  } catch {
    /* backend offline - local total above still counts */
  }
}

export const LOCAL_WATCH_KEY = "pixxa_watch_seconds";

export function localWatchDisplay(): string {
  let s = 0;
  try {
    s = Number(localStorage.getItem(LOCAL_WATCH_KEY) || 0);
  } catch {
    /* ignore */
  }
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m`;
}

export async function fetchWatchTimeSummary() {
  const { data } = await api.get("/analytics/watchtime/summary/");
  return data as {
    total_seconds: number;
    today_seconds: number;
    week_seconds: number;
    total_display: string;
    today_display: string;
    week_display: string;
  };
}
