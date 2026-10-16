import { useCallback, useState } from "react";
import type { LocalMedia, MediaKind } from "../types/media";

const IMAGE_EXT = ["jpg", "jpeg", "png", "gif", "webp", "heic", "bmp"];
const VIDEO_EXT = ["mp4", "mov", "webm", "mkv", "avi", "m4v"];

function extOf(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

function kindOf(ext: string): MediaKind | null {
  if (IMAGE_EXT.includes(ext)) return "photo";
  if (VIDEO_EXT.includes(ext)) return "video";
  return null;
}

/** Stable id from name+size+lastModified so re-imports resolve to the same record. */
function clientIdFor(file: File): string {
  return `${file.name}_${file.size}_${file.lastModified}`;
}

function readImageDimensions(url: string): Promise<{ width?: number; height?: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({});
    img.src = url;
  });
}

function readVideoMeta(url: string): Promise<{ width?: number; height?: number; durationSeconds?: number }> {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () =>
      resolve({ width: v.videoWidth, height: v.videoHeight, durationSeconds: v.duration });
    v.onerror = () => resolve({});
    v.src = url;
  });
}

async function fileToLocalMedia(file: File, albumHint: string): Promise<LocalMedia | null> {
  const extension = extOf(file.name);
  const kind = kindOf(extension);
  if (!kind) return null;

  const url = URL.createObjectURL(file);
  const meta = kind === "photo" ? await readImageDimensions(url) : await readVideoMeta(url);

  return {
    clientId: clientIdFor(file),
    filename: file.name,
    extension,
    mimeType: file.type || (kind === "photo" ? `image/${extension}` : `video/${extension}`),
    kind,
    sizeBytes: file.size,
    width: meta.width,
    height: meta.height,
    durationSeconds: (meta as { durationSeconds?: number }).durationSeconds,
    capturedAt: file.lastModified ? new Date(file.lastModified).toISOString() : undefined,
    albumHint,
    url,
    file,
  };
}

/**
 * Handles bringing local photos/videos into PIXXA.
 *
 * Browsers cannot grant arbitrary, ongoing access to a phone's entire
 * media library the way a native app can. So:
 *   - On browsers that support the File System Access API (Chrome/Edge
 *     desktop & Android) we use `showDirectoryPicker` to let the user
 *     grant access to a real folder, and we read the folder name as the
 *     album hint.
 *   - Everywhere else we fall back to a plain <input type="file" multiple>
 *     picker (webkitdirectory when available), which is the correct,
 *     honest browser-security-respecting fallback.
 */
export function useLocalMedia() {
  const [items, setItems] = useState<LocalMedia[]>([]);
  const [permission, setPermission] = useState<"unrequested" | "granted" | "denied">("unrequested");
  const [loading, setLoading] = useState(false);

  const ingestFiles = useCallback(async (files: File[], albumHint: string) => {
    setLoading(true);
    const results = await Promise.all(files.map((f) => fileToLocalMedia(f, albumHint)));
    const valid = results.filter((r): r is LocalMedia => r !== null);
    setItems((prev) => {
      const existingIds = new Set(prev.map((p) => p.clientId));
      const merged = [...prev, ...valid.filter((v) => !existingIds.has(v.clientId))];
      return merged;
    });
    setLoading(false);
    return valid;
  }, []);

  const requestAccess = useCallback(async (): Promise<LocalMedia[]> => {
    try {
      if ("showDirectoryPicker" in window) {
        // @ts-ignore - experimental API, not yet in default TS lib
        const dirHandle = await (window as any).showDirectoryPicker();
        const files: File[] = [];
        const albumHint = dirHandle.name || "Imported";
        for await (const [, entry] of dirHandle.entries()) {
          if (entry.kind === "file") {
            const file = await entry.getFile();
            files.push(file);
          }
        }
        setPermission("granted");
        return await ingestFiles(files, albumHint);
      }
    } catch (err) {
      // User cancelled the picker, or API unsupported at runtime - fall
      // through to the plain input fallback rather than treating this
      // as a hard denial.
    }
    setPermission("denied");
    return [];
  }, [ingestFiles]);

  const importViaInput = useCallback(
    async (fileList: FileList | null, albumHint = "Imported") => {
      if (!fileList) return [];
      const result = await ingestFiles(Array.from(fileList), albumHint);
      setPermission("granted");
      return result;
    },
    [ingestFiles]
  );

  const removeItem = useCallback((clientId: string) => {
    setItems((prev) => {
      const target = prev.find((p) => p.clientId === clientId);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.clientId !== clientId);
    });
  }, []);

  const supportsDirectoryPicker = typeof window !== "undefined" && "showDirectoryPicker" in window;

  return {
    items,
    permission,
    loading,
    supportsDirectoryPicker,
    requestAccess,
    importViaInput,
    removeItem,
  };
}
