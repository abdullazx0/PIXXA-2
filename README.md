# PIXXA — Private Gallery

A premium, black-and-white glassmorphism gallery for the photos and videos on **your** device.
Photos · Videos · Reels · Feed · My Space. No camera, no cloud upload.

- **Frontend:** React + TypeScript + Vite + Tailwind + Lucide
- **Backend:** Django + Django REST Framework (SQLite in dev, PostgreSQL-ready)
- **Privacy:** media files never leave the device. Django only stores *metadata and app state*
  (filenames, sizes, favorites, likes, albums, watch time).

## Project structure

```
PIXXA/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   └── pixxa/
│       ├── config/            settings, urls, wsgi
│       └── apps/
│           ├── media/         MediaMetadata (+ bulk_register, stats)
│           ├── albums/        Album, AlbumItem
│           ├── favorites/     Favorite, Like
│           └── analytics/     WatchTimeEntry, UserPreference
├── frontend/
│   └── src/
│       ├── api/               axios client + endpoint helpers
│       ├── context/           MediaContext (items, favorites, likes)
│       ├── hooks/             useLocalMedia, useSwipeNav, useIntersectionPlay, useWatchTime, useMediaOverlays
│       ├── components/        BottomNav, MediaGrid, MediaViewer, ShareSheet, InfoSheet, ...
│       └── pages/             Onboarding, Photos, Videos, Reels, Feed, Albums, MySpace
└── .vscode/                   tasks to run both servers
```

## Setup (VS Code)

Open the `PIXXA` folder in VS Code.

### 1. Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

### 2. Frontend
```bash
cd frontend
cp .env.example .env             # optional; defaults to http://127.0.0.1:8000/api
npm install
npm run dev                      # http://localhost:5173
```

Or run both from VS Code: **Terminal → Run Task → "Run PIXXA (backend + frontend)"**.

If the backend is offline, the app still works locally (favorites/likes stay in memory for the session);
the Settings panel in My Space shows the sync status.

## Database

SQLite (`backend/db.sqlite3`) is created by `migrate`. For PostgreSQL, install `psycopg[binary]`,
and replace `DATABASES` in `pixxa/config/settings.py` with the `django.db.backends.postgresql`
engine using environment variables. Also set `PIXXA_SECRET_KEY`, `PIXXA_DEBUG=0`, restrict
`ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`.

## API

Every request carries an `X-Device-Id` header (random ID generated once in the browser); all data is
scoped to it, so no login is required.

| Endpoint | Purpose |
|---|---|
| `GET/POST /api/media/`, `POST /api/media/bulk_register/`, `GET /api/media/stats/` | media metadata (filters: `kind`, `search`, `album`) |
| `GET/POST /api/albums/`, `POST /api/albums/{id}/add_item/`, `remove_item/`, `GET items/` | albums |
| `GET /api/favorites/`, `POST /api/favorites/toggle/` | favorites |
| `GET /api/likes/`, `POST /api/likes/toggle/` | likes (separate from favorites) |
| `POST /api/analytics/watchtime/`, `GET /api/analytics/watchtime/summary/` | watch time (today / week / total) |
| `GET/POST /api/analytics/preferences/` | key/value preferences |

## How media access works (important)

Browsers cannot silently read a phone's whole gallery. PIXXA does the honest thing:

- **Chrome/Edge (desktop & Android):** "Allow Access" opens the File System Access folder picker.
  The folder name becomes the album (e.g. *Camera*, *WhatsApp Images*).
- **Other browsers (Safari, Firefox):** falls back to a multi-file picker (`<input type="file">`).
- Real filename, size, resolution, duration and modified date are read from the file itself. Nothing is invented.
- Imported media lives in memory for the session (object URLs) — re-select your folder on next launch.
  Favorites/likes/watch time persist via Django.
- **Delete / Recently Deleted:** removes the item from PIXXA only. Browsers cannot delete or restore original
  device files, and the UI says so.
- **Share:** uses the native Web Share API; nothing is uploaded to the server.

## Using PIXXA on your phone (same Wi-Fi)

1. PC and phone on the same Wi-Fi. Find your PC's IP (`ipconfig` -> IPv4, e.g. 192.168.1.20).
2. Backend, reachable from the network:  `python manage.py runserver 0.0.0.0:8000`
3. Frontend: `npm run dev` (already configured with `host: true`).
4. On the phone open `http://192.168.1.20:5173`. The app talks to the backend at the same IP on port 8000 automatically.
5. If it doesn't load, allow Python and Node through Windows Firewall (Private networks).

Plain-HTTP limits: browsers only enable Web Share, clipboard and "Install app" on secure origins.
On Android Chrome you can open `chrome://flags/#unsafely-treat-insecure-origin-as-secure`, add
`http://192.168.1.20:5173`, enable it and relaunch. For a permanent fix, host the built `dist/` on HTTPS or
build the Android app with Capacitor (see above).

Without the backend, favorites, likes and watch time are still saved in the phone browser's local storage.

## Android (Capacitor)

For true gallery access and persistent library:
```bash
cd frontend
npm i @capacitor/core @capacitor/cli @capacitor/android
npm run build
npx cap add android
npx cap sync
npx cap open android
```
Set `VITE_API_BASE_URL` to a reachable backend (e.g. `http://10.0.2.2:8000/api` for the emulator).
Next step for a native library: add a MediaStore plugin (e.g. `@capacitor-community/media`) and feed
its results into `useLocalMedia` as `LocalMedia` items.

## Production notes

- Serve the built frontend (`npm run build` → `dist/`) from a static host; run Django with gunicorn.
- The `X-Device-Id` scheme is not authentication. If you need multi-user accounts, add DRF token/session auth.
- Not yet implemented: virtualized grid for very large (10k+) libraries, and persistent storage of
  imported file handles across launches.
