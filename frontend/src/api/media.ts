import { api } from "./client";
import type { LocalMedia } from "../types/media";

export async function bulkRegisterMedia(items: LocalMedia[]) {
  const payload = items.map((m) => ({
    client_id: m.clientId,
    filename: m.filename,
    extension: m.extension,
    mime_type: m.mimeType,
    kind: m.kind,
    size_bytes: m.sizeBytes,
    width: m.width,
    height: m.height,
    duration_seconds: m.durationSeconds,
    captured_at: m.capturedAt,
    album_hint: m.albumHint,
  }));
  const { data } = await api.post("/media/bulk_register/", payload);
  return data;
}

export async function deleteMediaRecord(clientIdOrDbId: number) {
  await api.delete(`/media/${clientIdOrDbId}/`);
}

export async function getMediaStats() {
  const { data } = await api.get("/media/stats/");
  return data as { photos: number; videos: number; total_bytes: number };
}
