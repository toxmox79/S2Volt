import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return {
    name: "S2 Volt Materialplanung",
    short_name: "S2 Volt",
    description: "Technische Materialplanung und KI-gestützte Ausschreibungsanalyse für Elektroprojekte.",
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    display: "standalone",
    orientation: "any",
    background_color: "#edf1f7",
    theme_color: "#ff4539",
    categories: ["business", "productivity", "utilities"],
    icons: [
      { src: `${basePath}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${basePath}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
      { src: `${basePath}/icons/icon-maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}
