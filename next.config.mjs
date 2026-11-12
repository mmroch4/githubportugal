import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Estas páginas leem os ficheiros de data/ quando voltam a ser geradas no servidor.
  outputFileTracingIncludes: {
    "/projetos": ["./data/projetos.yml"],
    "/eventos": ["./data/eventos.yml"],
    "/eventos/calendario.ics": ["./data/eventos.yml"],
    "/comunidades": ["./data/comunidades.yml"],
    // Bot do Discord: /ranking, /evento e /projeto.
    "/api/discord": [
      "./data/ranking.json",
      "./data/ranking-excluidos.yml",
      "./data/eventos.yml",
      "./data/projetos.yml",
    ],
    "/artigos": ["./src/content/artigos/*.mdx"],
    "/llms.txt": ["./data/*.yml", "./src/content/artigos/*.mdx"],
    "/llms-full.txt": [
      "./src/content/guia/*.mdx",
      "./src/content/artigos/*.mdx",
    ],
  },
};

const withMDX = createMDX({
  options: {
    // Tira o cabeçalho (frontmatter) dos artigos do texto; é lido em src/lib/artigos.ts.
    remarkPlugins: ["remark-frontmatter"],
  },
});

export default withMDX(nextConfig);
