import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GitHub Portugal",
    short_name: "GitHub Portugal",
    description:
      "Comunidade portuguesa de programadores e de projetos open source no GitHub.",
    lang: "pt-PT",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1a1e23",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/logo.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
