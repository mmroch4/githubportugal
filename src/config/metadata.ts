import type { Metadata, Viewport } from "next";

export const siteUrl = "https://githubportugal.com";

export const links = {
  discord: "https://discord.com/invite/cnJdppDkUp",
  whatsapp: "https://chat.whatsapp.com/EfKv6GPEgd89XgYXhiAhFk",
  repository: "https://github.com/mmroch4/githubportugal",
};

const description =
  "Comunidade portuguesa de programadores e de projetos open source no GitHub.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "GitHub Portugal",
  title: {
    default: "GitHub Portugal",
    template: "%s | GitHub Portugal",
  },
  description,
  authors: [{ name: "Miguel Rocha", url: "https://github.com/mmroch4" }],
  creator: "Miguel Rocha",
  keywords: [
    "Comunidade",
    "Projetos open source",
    "open source",
    "Código aberto",
    "Programação",
    "Programadores",
    "Portugal",
    "Repositórios GitHub",
    "GitHub Portugal",
  ],
  category: "Tecnologia",
  openGraph: {
    type: "website",
    locale: "pt_PT",
    siteName: "GitHub Portugal",
    title: "GitHub Portugal",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "GitHub Portugal",
    description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1a1e23" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1117" },
  ],
};
