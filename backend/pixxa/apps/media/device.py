"""
PIXXA is a local-first, single-user-per-device app: there's no forced
login. Each frontend instance generates a random device id once (stored in
localStorage) and sends it as the `X-Device-Id` header on every request.
All app-state (albums, favorites, likes, watch time, preferences) is
namespaced by this id, so metadata never crosses devices.
"""

DEVICE_HEADER = "HTTP_X_DEVICE_ID"


def get_device_id(request) -> str:
    device_id = request.META.get(DEVICE_HEADER) or request.headers.get("X-Device-Id")
    if not device_id:
        device_id = "default-device"
    return device_id[:128]
