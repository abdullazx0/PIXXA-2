import axios from "axios";

const DEVICE_KEY = "pixxa_device_id";

function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = "dev-" + crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    `${window.location.protocol === "https:" ? "http:" : window.location.protocol}//${window.location.hostname}:8000/api`,
  headers: {
    "X-Device-Id": getOrCreateDeviceId(),
  },
});

/** True once we've confirmed the Django backend is reachable. */
export async function backendAvailable(): Promise<boolean> {
  try {
    await api.get("/media/stats/", { timeout: 2500 });
    return true;
  } catch {
    return false;
  }
}
