import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registering a service worker is what lets Android Chrome offer
// "Install app" / "Add to Home screen" for PIXXA. Only do this in the
// production build — in dev it would fight with Vite's own hot reloading.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* non-fatal: app still works without the install prompt */
    });
  });
}
