import type { MetadataRoute } from "next";

/** Web app manifest (sprint T-06). Colours match the app theme in globals.css and layout.tsx. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "CUORE",
    short_name: "CUORE",
    description: "CUORE: Local comfort, thoughtfully engineered.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "en",
    background_color: "#fbf8f5",
    theme_color: "#9b2c3a",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
