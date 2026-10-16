export type MediaKind = "photo" | "video";

/**
 * A local media item. `file`/`url` are populated client-side from the
 * File System Access API or a <input type="file"> import; PIXXA never
 * sends the actual bytes to the backend, only this metadata.
 */
export interface LocalMedia {
  clientId: string;
  filename: string;
  extension: string;
  mimeType: string;
  kind: MediaKind;
  sizeBytes: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  capturedAt?: string;
  albumHint: string;
  url: string; // object URL for this session
  file: File;
}

export interface AlbumSummary {
  id?: number;
  name: string;
  isSystem: boolean;
  itemCount: number;
}

export type FilterKey = "all" | "albums" | "favorites" | "recent";
export type FeedFilterKey = "all" | "photos" | "videos" | "favorites";
